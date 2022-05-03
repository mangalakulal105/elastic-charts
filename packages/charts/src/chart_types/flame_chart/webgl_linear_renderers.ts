/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  bindFramebuffer,
  bindVertexArray,
  createCompiledShader,
  createLinkedProgram,
  createTexture,
  getAttributes,
  getRenderer,
  GL_FRAGMENT_SHADER,
  GL_READ_FRAMEBUFFER,
  GL_VERTEX_SHADER,
  readPixel,
  Render,
  Texture,
} from '../../common/kingly';
import { LabelAccessor } from '../../utils/common';
import { colorFrag, GEOM_INDEX_OFFSET, rectVert, roundedRectFrag } from './shaders';
import { AnimationState, ColumnarViewModel, ContinuousDomainFocus, GLResources, PickFunction } from './types';

// text rendering and other config
const MAX_PADDING_RATIO = 0.25;
const MIN_FILL_RATIO = [1 - MAX_PADDING_RATIO, 0.6]; // retain at least 90% of the width and 60% of the height
const CORNER_RADIUS_RATIO = 0.25; // as a proportion of the shorter rectangle edge length
const VERTICES_PER_GEOM = 4; // assuming `gl.TRIANGLE_STRIP`
const TEXT_PAD_LEFT = 3;
const TEXT_PAD_RIGHT = 3;
const MIN_TEXT_LENGTH = 0; // in font height, so 1 means roughly 2 characters (latin characters are tall on average)
const ROW_OFFSET_Y = 0.45; // approx. middle line (text is middle anchored so tall bars with small fonts can still have vertically centered text)
const MAX_FONT_HEIGHT_RATIO = 0.9; // relative to the row height
const MAX_FONT_SIZE = 14;
const BOX_GAP = 0.5;

// utility functions
const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);
const mix = (a: number, b: number, x: number) => (1 - x) * a + x * b; // like the GLSL `mix`
const scale = (value: number, from: number, to: number) => (value - from) / (to - from);

const renderer = (
  ctx: CanvasRenderingContext2D,
  gl: WebGL2RenderingContext,
  focus: ContinuousDomainFocus,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  formatter: LabelAccessor,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
) => {
  // focus
  const textureWidth = dpr * cssWidth;
  const textureHeight = dpr * cssHeight;

  const dataNames = columnarGeomData.label;

  // determine layer count
  const layerSet = new Set<number>();
  for (let i = 1; i < columnarGeomData.position1.length; i += 2) layerSet.add(columnarGeomData.position1[i]);
  const layerCount = layerSet.size;

  return (logicalTime: number) => {
    // get focus
    const focusLoX = mix(focus.prevFocusX0, focus.currentFocusX0, logicalTime);
    const focusLoY = mix(focus.prevFocusY0, focus.currentFocusY0, logicalTime);
    const focusHiX = mix(focus.prevFocusX1, focus.currentFocusX1, logicalTime);
    const focusHiY = mix(focus.prevFocusY1, focus.currentFocusY1, logicalTime);

    // row height, font size and dependent values
    const rowHeight = 1 / layerCount;
    const zoomedRowHeight = rowHeight / Math.abs(focusHiY - focusLoY);
    const fontSize = Math.min(
      Math.round(zoomedRowHeight * textureHeight - dpr * BOX_GAP) * MAX_FONT_HEIGHT_RATIO,
      dpr * MAX_FONT_SIZE,
    );
    const minTextLengthCssPix = MIN_TEXT_LENGTH * fontSize; // don't render shorter text than this
    const minRectWidthForTextInCssPix = minTextLengthCssPix + TEXT_PAD_LEFT + TEXT_PAD_RIGHT;
    const minRectWidth = minRectWidthForTextInCssPix / cssWidth;

    const canvasSizeChanged = true; // textureWidthChanged || textureHeightChanged;
    pickTexture.clear();
    [false, true].forEach((pickLayer) =>
      (pickLayer ? pickTextureRenderer : roundedRectRenderer)({
        target: pickLayer ? pickTexture.target() : null,
        uniformValues: {
          pickLayer,
          t: Math.max(0.001, logicalTime), // for some reason, an exact zero will lead to `mix` as if it were 1 (glitch)
          resolution: [cssWidth, cssHeight],
          gapPx: pickLayer ? [0, 0] : [BOX_GAP, BOX_GAP], // in CSS pixels (but let's not leave a gap for shape picking)
          minFillRatio: MIN_FILL_RATIO,
          cornerRadiusPx: pickLayer ? 0 : cssHeight * rowHeight * CORNER_RADIUS_RATIO, // note that for perf reasons the fragment shaders are split anywayrowHeight0: rowHeight,
          hoverIndex: hoverIndex + GEOM_INDEX_OFFSET,
          rowHeight0: rowHeight,
          rowHeight1: rowHeight,
          focus0: [focusLoX, focusHiX, focusLoY, focusHiY],
          focus1: [focusLoX, focusHiX, focusLoY, focusHiY],
        },
        viewport: canvasSizeChanged && { x: 0, y: 0, width: textureWidth, height: textureHeight },
        clear: { color: [0, 0, 0, 0] }, // todo fix rendering glitches, clearing doesn't seem to help
        draw: {
          geom: gl.TRIANGLE_STRIP,
          offset: 0,
          count: VERTICES_PER_GEOM,
          instanceCount: dataNames.length,
        },
      }),
    );

    // text rendering
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    let lastTextColor = '';
    dataNames.forEach((dataName, i) => {
      const textColor = 'black';
      const size = mix(columnarGeomData.size0[i], columnarGeomData.size1[i], logicalTime);
      // todo also trivially skip text outside the current view (eg. more than 1 row above currently selected node; or left/right of the currently selected node
      // otherwise it becomes too choppy as the horizontal magnification makes rectangles wider for text even outside the chart
      const scaledSize = size / (focusHiX - focusLoX);
      if (scaledSize >= minRectWidth) {
        const xNorm = mix(columnarGeomData.position0[2 * i], columnarGeomData.position1[2 * i], logicalTime);
        const yNorm = mix(columnarGeomData.position0[2 * i + 1], columnarGeomData.position1[2 * i + 1], logicalTime);
        const baseX = scale(xNorm, focusLoX, focusHiX) * cssWidth;
        const leftOutside = Math.max(0, -baseX);
        const x = baseX + leftOutside; // don't start the text in the negative range, b/c it's not readable there
        const y = cssHeight * (1 - scale(yNorm, focusLoY, focusHiY));
        const baseWidth = scaledSize * cssWidth - BOX_GAP - TEXT_PAD_RIGHT;
        const width = baseWidth - leftOutside; // if a box is partially cut on the left, the remaining box becomes smaller
        const label = formatter(dataName);
        if (x + scaledSize < 0 || x > cssWidth || y < 0 || y > cssHeight || !label) return; // don't render what's outside
        ctx.beginPath();
        ctx.rect(x, y - zoomedRowHeight * cssHeight, width, zoomedRowHeight * cssHeight);
        if (textColor !== lastTextColor) {
          // as we're sorting the iteration, the number of color changes (API calls) is minimized
          ctx.fillStyle = textColor;
          lastTextColor = textColor;
        }
        ctx.save();
        ctx.clip();
        ctx.fillText(label, x + TEXT_PAD_LEFT, y - ROW_OFFSET_Y * rowHeight * cssHeight);
        ctx.restore();
      }
    });
    ctx.restore();
  };
};

/** @internal */
export function ensureLinearFlameWebGL(
  glCanvas: HTMLCanvasElement,
  glResources: GLResources,
  dpr: number,
  columnarViewModel: ColumnarViewModel,
  cssWidth: number,
  cssHeight: number,
): GLResources {
  const gl = glResources.gl || glCanvas.getContext('webgl2', { premultipliedAlpha: true, antialias: true });
  if (!gl) return glResources;

  const textureWidth = dpr * cssWidth;
  const textureHeight = dpr * cssHeight;

  // ensure texture for the appropriate size
  const pickTexture =
    glResources.pickTexture && textureWidth === glResources.textureWidth && textureHeight === glResources.textureHeight
      ? glResources.pickTexture
      : (glResources.pickTexture?.delete() ?? true) &&
        createTexture(gl, {
          textureIndex: 0,
          width: textureWidth,
          height: textureHeight,
          internalFormat: gl.RGBA8,
          data: null, // we use a shader to write this texture,
        });

  const readPixelXY: PickFunction = (x, y) => {
    if (gl) {
      bindFramebuffer(gl, GL_READ_FRAMEBUFFER, pickTexture.target());
      const pixel = readPixel(gl, dpr * x, textureHeight - dpr * y);
      const found = pixel[0] + pixel[1] + pixel[2] + pixel[3] > 0;
      const datumIndex = found
        ? pixel[3] + 256 * (pixel[2] + 256 * (pixel[1] + 256 * pixel[0])) - GEOM_INDEX_OFFSET
        : NaN;
      return Number.isNaN(datumIndex) ? NaN : datumIndex;
    } else {
      return NaN;
    }
  };

  /**
   * Vertex array attributes
   */

  const columnarGeomData: ColumnarViewModel = columnarViewModel;

  const instanceAttributes = Object.keys(columnarGeomData);
  const attributeLocations = new Map(instanceAttributes.map((name, i: GLuint) => [name, i]));

  const vao = glResources.vao || gl.createVertexArray();
  if (!vao) return glResources;

  bindVertexArray(gl, vao);

  // by how many instances should each attribute advance?
  instanceAttributes.forEach((name) => {
    const attributeLocation = attributeLocations.get(name);
    if (typeof attributeLocation === 'number') gl.vertexAttribDivisor(attributeLocation, 1);
  });

  const geomProgram =
    glResources.geomProgram ||
    createLinkedProgram(
      gl,
      createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
      createCompiledShader(gl, GL_FRAGMENT_SHADER, roundedRectFrag),
      attributeLocations,
    );

  const pickProgram =
    glResources.pickProgram ||
    createLinkedProgram(
      gl,
      createCompiledShader(gl, GL_VERTEX_SHADER, rectVert),
      createCompiledShader(gl, GL_FRAGMENT_SHADER, colorFrag),
      attributeLocations,
    );

  /**
   * Resource allocation: Render setup
   */

  // fill attribute values
  getAttributes(gl, geomProgram, attributeLocations).forEach((setValue, key) => {
    const value = columnarGeomData[key as keyof ColumnarViewModel];
    if (value instanceof Float32Array) setValue(value);
  });

  // couple the program with the attribute input and global GL flags
  const roundedRectRenderer = getRenderer(gl, geomProgram, vao, { depthTest: false, blend: true });
  const pickTextureRenderer = getRenderer(gl, pickProgram, vao, { depthTest: false, blend: false }); // must not blend the texture, else the pick color thus datumIndex will be wrong

  /**
   * Resource allocation: Texture
   */

  // eslint-disable-next-line no-shadow
  const deallocateResources = ({ gl, vao, pickTexture, geomProgram, pickProgram }: GLResources) => {
    pickTexture?.delete();
    if (gl) {
      if (geomProgram) {
        getAttributes(gl, geomProgram, attributeLocations).forEach((setValue) => setValue(new Float32Array())); // set buffers to zero length
      }

      gl.deleteVertexArray(vao);
      gl.deleteProgram(geomProgram);
      gl.deleteProgram(pickProgram);
    }
  };

  return {
    gl,
    columnarGeomData,
    roundedRectRenderer,
    pickTextureRenderer,
    deallocateResources,
    pickTexture,
    textureWidth,
    textureHeight,
    vao,
    geomProgram,
    pickProgram,
    readPixelXY,
  };
}

/** @internal */
export function renderLinearFlameWebGL(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  containerWidth: number,
  containerHeight: number,
  animationDuration: number,
  focus: ContinuousDomainFocus,
  hoverIndex: number,
  animationState: AnimationState,
  glResources: GLResources,
  inTween: boolean,
) {
  const { gl, columnarGeomData, roundedRectRenderer, pickTextureRenderer, pickTexture } = glResources;
  if (!gl || !pickTexture) return;
  const { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 } = focus;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const formatter: LabelAccessor = (v) => `${v}`; // todo add a proper formatter option to the APL
  const timeFunction = animationDuration > 0 ? easeInOut(Math.min(5, animationDuration / 100)) : linear;

  const render = renderer(
    ctx,
    gl,
    focus,
    containerWidth,
    containerHeight,
    dpr,
    columnarGeomData,
    formatter,
    pickTexture,
    pickTextureRenderer,
    roundedRectRenderer,
    hoverIndex,
  );

  window.cancelAnimationFrame(animationState.rafId); // todo consider deallocating/reallocating or ensuring resources upon cancellation
  if (animationDuration > 0 && inTween) {
    render(0);
    const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
    if (focusChanged) {
      animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
        const anim = (t: number) => {
          const unitNormalizedTime = Math.max(0, (t - epochStartTime) / animationDuration);
          render(timeFunction(Math.min(1, unitNormalizedTime)));
          if (unitNormalizedTime <= 1) {
            animationState.rafId = window.requestAnimationFrame(anim);
          }
        };
        animationState.rafId = window.requestAnimationFrame(anim);
      });
    }
  } else {
    render(1);
  }
}
