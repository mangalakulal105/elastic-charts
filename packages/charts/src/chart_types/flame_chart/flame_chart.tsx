/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, MouseEvent, RefObject } from 'react';
import { connect } from 'react-redux';

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import {
  bindFramebuffer,
  createTexture,
  GL_READ_FRAMEBUFFER,
  NullTexture,
  readPixel,
  Texture,
} from '../../common/kingly';
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { getTooltipType, SettingsSpec, SpecType, TooltipType } from '../../specs';
import { ON_POINTER_MOVE } from '../../state/actions/mouse';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../state/utils';
import { Size } from '../../utils/dimensions';
import { FlameSpec } from './flame_api';
import { roundUpSize } from './render/common';
import { drawFrame } from './render/draw_a_frame';
import { ensureWebgl } from './render/ensure_webgl';
import { GEOM_INDEX_OFFSET } from './shaders';
import { AnimationState, GLResources, NULL_GL_RESOURCES, nullColumnarViewModel, PickFunction } from './types';

const PINCH_ZOOM_CHECK_INTERVAL_MS = 100;
const TWEEN_EPSILON_MS = 20;
const SIDE_OVERSHOOT_RATIO = 0.05; // e.g. 0.05 means, extend the domain 5% to the left and 5% to the right
const TOP_OVERSHOOT_ROW_COUNT = 2; // e.g. 2 means, try to render two extra rows above (parent and grandparent)

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);
const rowHeight = (position: Float32Array) => (position.length >= 4 ? position[1] - position[3] : 1);
const specValueFormatter = (d: number) => d; // fixme use the formatter from the spec
const browserRootWindow = () => {
  let rootWindow = window; // we might be in an iframe, and visualViewport.scale is toplevel only
  while (window.parent && window.parent.window !== rootWindow) rootWindow = rootWindow.parent.window;
  return rootWindow;
};

const columnToRowPositions = ({ position1, size1 }: FlameSpec['columnarData'], i: number) => ({
  x0: position1[i * 2],
  x1: position1[i * 2] + size1[i],
  y0: position1[i * 2 + 1],
  y1: position1[i * 2 + 1] + rowHeight(position1),
});

interface FocusRect {
  timestamp: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const focusRect = (
  columnarViewModel: FlameSpec['columnarData'],
  drilldownDatumIndex: number,
  drilldownTimestamp: number,
): FocusRect => {
  if (Number.isNaN(drilldownDatumIndex)) return { x0: 0, y0: 0, x1: 1, y1: 1, timestamp: 0 };
  const { x0, x1, y1: rawY1 } = columnToRowPositions(columnarViewModel, drilldownDatumIndex);
  const sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);
  const topOvershoot = TOP_OVERSHOOT_ROW_COUNT * rowHeight(columnarViewModel.position1);
  const y1 = Math.min(1, rawY1 + topOvershoot);
  return {
    timestamp: drilldownTimestamp,
    x0: Math.max(0, x0 - sideOvershoot),
    x1: Math.min(1, x1 + sideOvershoot),
    y0: y1 - 1,
    y1: y1,
  };
};

const getColor = (c: Float32Array, i: number) => {
  const r = Math.round(255 * c[4 * i]);
  const g = Math.round(255 * c[4 * i + 1]);
  const b = Math.round(255 * c[4 * i + 2]);
  const a = c[4 * i + 3];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const colorToDatumIndex = (pixel: Uint8Array) => {
  // this is the inverse of what's done via BIT_SHIFTERS in shader code (bijective color/index mapping)
  const isEmptyArea = pixel[0] + pixel[1] + pixel[2] + pixel[3] < GEOM_INDEX_OFFSET; // ie. zero
  return isEmptyArea ? NaN : pixel[3] + 256 * (pixel[2] + 256 * (pixel[1] + 256 * pixel[0])) - GEOM_INDEX_OFFSET;
};

interface StateProps {
  columnarViewModel: FlameSpec['columnarData'];
  animationDuration: number;
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  tooltipRequired: boolean;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type FlameProps = StateProps & OwnProps;

class FlameComponent extends React.Component<FlameProps> {
  static displayName = 'Flame';

  // DOM API Canvas2d and WebGL resources
  private ctx: CanvasRenderingContext2D | null;
  private glContext: WebGL2RenderingContext | null;
  private pickTexture: Texture;
  private glResources: GLResources;
  private readonly glCanvasRef: RefObject<HTMLCanvasElement>;

  // native browser pinch zoom handling
  private pinchZoomSetInterval: number;
  private pinchZoomScale: number;

  // mouse coordinates for the tooltip
  private pointerX: number;
  private pointerY: number;

  // currently hovered over datum
  private hoverIndex: number;

  // drilldown and animation
  private animationState: AnimationState;
  private drilldownDatumIndex: number;
  private drilldownTimestamp: number;
  private prevDrilldownDatumIndex: number;
  private prevDrilldownTimestamp: number;

  constructor(props: Readonly<FlameProps>) {
    super(props);
    this.ctx = null;
    this.glContext = null;
    this.pickTexture = NullTexture;
    this.glResources = NULL_GL_RESOURCES;
    this.glCanvasRef = createRef();
    this.animationState = { rafId: NaN };
    this.drilldownDatumIndex = 0;
    this.drilldownTimestamp = -Infinity;
    this.prevDrilldownDatumIndex = 0;
    this.prevDrilldownTimestamp = -Infinity;
    this.hoverIndex = NaN;
    this.pointerX = -10000;
    this.pointerY = -10000;

    // browser pinch zoom handling
    this.pinchZoomSetInterval = NaN;
    this.pinchZoomScale = browserRootWindow().visualViewport.scale;
    this.setupViewportScaleChangeListener();
  }

  private inTween = (t: DOMHighResTimeStamp) =>
    this.drilldownTimestamp + this.props.animationDuration + TWEEN_EPSILON_MS >= t;

  private setupDevicePixelRatioChangeListener = () => {
    // redraw if the devicePixelRatio changed, for example:
    //   - applied browser zoom from the browser's top right hamburger menu (NOT the pinch zoom)
    //   - changed monitor resolution
    //   - dragged the browser to a monitor with a differing devicePixelRatio
    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(
      'change',
      () => {
        this.setState({});
        // this re-adds the `once` event listener (not sure if componentDidMount guarantees single execution)
        // and the value in the `watchMedia` resolution needs to change as well
        this.setupDevicePixelRatioChangeListener();
      },
      { once: true },
    );
  };

  private setupViewportScaleChangeListener = () => {
    window.clearInterval(this.pinchZoomSetInterval);
    this.pinchZoomSetInterval = window.setInterval(() => {
      const pinchZoomScale = browserRootWindow().visualViewport.scale; // not cached, to avoid holding a reference to a `window` object
      if (pinchZoomScale !== this.pinchZoomScale) {
        this.pinchZoomScale = pinchZoomScale;
        this.setState({});
      }
    }, PINCH_ZOOM_CHECK_INTERVAL_MS);
  };

  componentDidMount = () => {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
    this.setupDevicePixelRatioChangeListener();
  };

  componentDidUpdate = () => {
    if (!this.ctx) this.tryCanvasContext();
    this.ensurePickTexture();
    this.drawCanvas(); // eg. due to chartDimensions (parentDimensions) change
  };

  private getFocus = () => {
    const { x0: currentFocusX0, y0: currentFocusY0, x1: currentFocusX1, y1: currentFocusY1, timestamp } = focusRect(
      this.props.columnarViewModel,
      this.drilldownDatumIndex,
      this.drilldownTimestamp,
    );
    const { x0: prevFocusX0, y0: prevFocusY0, x1: prevFocusX1, y1: prevFocusY1 } = focusRect(
      this.props.columnarViewModel,
      this.prevDrilldownDatumIndex,
      this.prevDrilldownTimestamp,
    );
    return {
      currentTimestamp: timestamp,
      currentFocusX0,
      currentFocusY0,
      currentFocusX1,
      currentFocusY1,
      prevFocusX0,
      prevFocusY0,
      prevFocusX1,
      prevFocusY1,
    };
  };

  private datumAtXY: PickFunction = (x, y, pickTextureTarget) => {
    if (!this.glContext || !pickTextureTarget) return NaN;
    bindFramebuffer(this.glContext, GL_READ_FRAMEBUFFER, pickTextureTarget);
    return colorToDatumIndex(readPixel(this.glContext, x, y));
  };

  private getHoveredDatumIndex = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!this.props.forwardStageRef.current || !this.ctx || this.inTween(e.timeStamp)) return;

    const box = this.props.forwardStageRef.current.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const pr = window.devicePixelRatio * this.pinchZoomScale;
    const datumIndex = this.datumAtXY(pr * x, pr * (this.props.chartDimensions.height - y), this.pickTexture.target());
    this.pointerX = x;
    this.pointerY = y;

    return { datumIndex, timestamp: e.timeStamp };
  };

  private handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const hovered = this.getHoveredDatumIndex(e);
    const prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN; // todo instead of translating NaN/-1 back and forth, just convert to -1 for shader rendering
    if (hovered) {
      this.hoverIndex = hovered.datumIndex;
      if (!Object.is(this.hoverIndex, prevHoverIndex)) {
        if (Number.isFinite(hovered.datumIndex)) {
          this.props.onElementOver([{ vmIndex: hovered.datumIndex }]); // userland callback
        } else {
          this.hoverIndex = NaN;
          this.props.onElementOut(); // userland callback
        }
      }
      this.setState({}); // exact tooltip location needs an update
    }
  };

  private handleMouseClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const hovered = this.getHoveredDatumIndex(e);
    if (hovered) {
      this.prevDrilldownDatumIndex = this.drilldownDatumIndex;
      this.prevDrilldownTimestamp = this.drilldownTimestamp;
      this.drilldownDatumIndex = hovered.datumIndex;
      this.drilldownTimestamp = hovered.timestamp;
      this.hoverIndex = NaN; // no highlight
      this.setState({});
      this.props.onElementClick([{ vmIndex: hovered.datumIndex }]); // userland callback
    }
  };

  private handleMouseLeave = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (Number.isFinite(this.hoverIndex)) {
      this.hoverIndex = NaN; // no highlight when outside
      this.setState({}); // no tooltip when outside
    }
  };

  render = () => {
    const {
      forwardStageRef,
      chartDimensions: { width: requestedWidth, height: requestedHeight },
      a11ySettings,
    } = this.props;
    const width = roundUpSize(requestedWidth);
    const height = roundUpSize(requestedHeight);
    const style: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      cursor: this.hoverIndex >= 0 ? 'pointer' : DEFAULT_CSS_CURSOR,
    };
    const dpr = window.devicePixelRatio * this.pinchZoomScale;
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;
    const columns = this.props.columnarViewModel;
    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <canvas /* WebGL2 layer */
            ref={this.glCanvasRef}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={style}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
          <canvas /* Canvas2d layer */
            ref={forwardStageRef}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            onMouseMove={this.handleMouseMove}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={this.handleMouseClick}
            onMouseLeave={this.handleMouseLeave}
            style={style}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
        <BasicTooltip
          onPointerMove={() => ({ type: ON_POINTER_MOVE, position: { x: NaN, y: NaN }, time: NaN })}
          position={{ x: this.pointerX, y: this.pointerY, width: 0, height: 0 }}
          visible={this.props.tooltipRequired && this.hoverIndex >= 0}
          info={{
            header: null,
            values:
              this.hoverIndex >= 0
                ? [
                    {
                      label: columns.label[this.hoverIndex],
                      color: getColor(columns.color, this.hoverIndex),
                      isHighlighted: false,
                      isVisible: true,
                      seriesIdentifier: { specId: '', key: '' },
                      value: columns.value[this.hoverIndex],
                      formattedValue: `${specValueFormatter(columns.value[this.hoverIndex])}`,
                      valueAccessor: this.hoverIndex,
                    },
                  ]
                : [],
          }}
          getChartContainerRef={this.props.containerRef}
        />
      </>
    );
  };

  private drawCanvas = () => {
    window.requestAnimationFrame((t) => {
      if (!this.ctx || !this.glContext || !this.pickTexture) return;

      const focus = this.getFocus();

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const timeFunction =
        this.props.animationDuration > 0 ? easeInOut(Math.min(5, this.props.animationDuration / 100)) : linear;

      const renderFrame = drawFrame(
        this.ctx,
        this.glContext,
        focus,
        this.props.chartDimensions.width,
        this.props.chartDimensions.height,
        window.devicePixelRatio * this.pinchZoomScale,
        this.props.columnarViewModel,
        this.pickTexture,
        this.glResources.pickTextureRenderer,
        this.glResources.roundedRectRenderer,
        this.hoverIndex,
        rowHeight(this.props.columnarViewModel.position1),
      );

      window.cancelAnimationFrame(this.animationState.rafId); // todo consider deallocating/reallocating or ensuring resources upon cancellation
      if (this.props.animationDuration > 0 && this.inTween(t)) {
        renderFrame(0);
        const focusChanged = focus.currentFocusX0 !== focus.prevFocusX0 || focus.currentFocusX1 !== focus.prevFocusX1;
        if (focusChanged) {
          this.animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
            const anim = (t: number) => {
              const unitNormalizedTime = Math.max(0, (t - epochStartTime) / this.props.animationDuration);
              renderFrame(timeFunction(Math.min(1, unitNormalizedTime)));
              if (unitNormalizedTime <= 1) {
                this.animationState.rafId = window.requestAnimationFrame(anim);
              }
            };
            this.animationState.rafId = window.requestAnimationFrame(anim);
          });
        }
      } else {
        renderFrame(1);
      }

      this.props.onRenderChange(true);
    });
  };

  private ensurePickTexture = () => {
    const { width, height } = this.props.chartDimensions;
    const pr = window.devicePixelRatio * this.pinchZoomScale;
    const textureWidth = pr * width;
    const textureHeight = pr * height;
    const current = this.pickTexture;
    if (
      this.glContext &&
      (current === NullTexture || current.width !== textureWidth || current.height !== textureHeight)
    ) {
      // (re)create texture
      current.delete();
      this.pickTexture =
        createTexture(this.glContext, {
          textureIndex: 0,
          width: textureWidth,
          height: textureHeight,
          internalFormat: this.glContext.RGBA8,
          data: null,
        }) ?? NullTexture;
    }
  };

  private tryCanvasContext = () => {
    const canvas = this.props.forwardStageRef.current;
    const glCanvas = this.glCanvasRef.current;

    this.ctx = canvas && canvas.getContext('2d');
    this.glContext = glCanvas && glCanvas.getContext('webgl2');

    this.ensurePickTexture();

    if (this.glContext && this.glResources === NULL_GL_RESOURCES) {
      this.glResources = ensureWebgl(this.glContext, this.props.columnarViewModel);
    }
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const flameSpec = getSpecsFromStore<FlameSpec>(state.specs, ChartType.Flame, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    columnarViewModel: flameSpec?.columnarData ?? nullColumnarViewModel,
    animationDuration: flameSpec?.animation.duration ?? 0,
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: getTooltipType(settingsSpec) !== TooltipType.None,

    // mandatory charts API protocol; todo extract these mappings once there are other charts like Flame
    onElementOver: settingsSpec.onElementOver ?? (() => {}),
    onElementClick: settingsSpec.onElementClick ?? (() => {}),
    onElementOut: settingsSpec.onElementOut ?? (() => {}),
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}
  };
};

const FlameChartLayers = connect(mapStateToProps)(FlameComponent);

/** @internal */
export const FlameWithTooltip = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <FlameChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
