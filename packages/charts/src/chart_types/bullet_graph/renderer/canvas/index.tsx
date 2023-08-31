/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable react/no-array-index-key */

import { scaleLinear } from 'd3-scale';
import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { renderBulletGraph } from './bullet_graph';
import { AlignedGrid } from '../../../../components/grid/aligned_grid';
import { ElementClickListener, BasicListener, ElementOverListener } from '../../../../specs';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { Size } from '../../../../utils/dimensions';
import { deepEqual } from '../../../../utils/fast_deep_equal';
import { Metric } from '../../../metric/renderer/dom/metric';
import { getBulletSpec, chartSize } from '../../selectors/chart_size';
import { hasChartTitles } from '../../selectors/has_chart_titles';
import { BulletGraphLayout, layout } from '../../selectors/layout';
import { BulletDatum, BulletGraphSpec } from '../../spec';
import { BulletGraphStyle, LIGHT_THEME_BULLET_STYLE } from '../../theme';

interface StateProps {
  initialized: boolean;
  debug: boolean;
  chartId: string;
  hasTitles: boolean;
  spec?: BulletGraphSpec;
  a11y: A11ySettings;
  size: Size;
  layout: BulletGraphLayout;
  style: BulletGraphStyle;
  bandColors: [string, string];
  onElementClick?: ElementClickListener;
  onElementOut?: BasicListener;
  onElementOver?: ElementOverListener;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = DispatchProps & StateProps & OwnProps;

class Component extends React.Component<Props> {
  static displayName = 'BulletGraph';
  private ctx: CanvasRenderingContext2D | null;
  private readonly devicePixelRatio: number;

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    return !deepEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      renderBulletGraph(this.ctx, this.devicePixelRatio, this.props);
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const { initialized, size, forwardStageRef, a11y, layout, spec, style } = this.props;
    if (!initialized || size.width === 0 || size.height === 0 || !spec) {
      return null;
    }

    return (
      <figure
        aria-labelledby={a11y.labelId}
        aria-describedby={a11y.descriptionId}
        style={{ width: '100%', height: '100%' }}
      >
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={size.width * this.devicePixelRatio}
          height={size.height * this.devicePixelRatio}
          style={{
            ...size,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        ></canvas>
        {layout.shouldRenderMetric && (
          <div className="echBulletAsMetric" style={{ width: '100%', height: '100%' }}>
            <AlignedGrid<BulletDatum>
              data={spec.data}
              contentComponent={({ datum, stats }) => {
                const colorScale = scaleLinear()
                  .domain([datum.domain.min, datum.domain.max])
                  // @ts-ignore - range determined from strings
                  .range(this.props.bandColors);
                return (
                  <Metric
                    chartId="XX"
                    datum={{
                      value: datum.value,
                      valueFormatter: datum.valueFormatter,
                      color: style.barBackground,
                      progressBarDirection: spec.subtype === 'horizontal' ? 'horizontal' : 'vertical',
                      title: datum.title,
                      subtitle: datum.subtitle,
                      domainMax: datum.domain.max,
                      extra: datum.target ? (
                        <span>
                          target: <strong>{datum.valueFormatter(datum.target)}</strong>
                        </span>
                      ) : undefined,
                    }}
                    hasTitles={this.props.hasTitles}
                    totalRows={stats.rows}
                    totalColumns={stats.columns}
                    columnIndex={stats.columnIndex}
                    rowIndex={stats.rowIndex}
                    style={{
                      background: style.background,
                      barBackground: `${colorScale(datum.value)}`,
                      border: 'gray',
                      minHeight: 0,
                      text: {
                        lightColor: 'white',
                        darkColor: 'black',
                      },
                      nonFiniteText: 'N/A',
                    }}
                    panel={{ width: size.width / stats.columns, height: size.height / stats.rows }}
                  />
                );
              }}
            />
            );
          </div>
        )}
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: StateProps = {
  initialized: false,
  debug: false,
  chartId: '',
  spec: undefined,
  hasTitles: false,
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,

  layout: {
    headerLayout: [],
    layoutAlignment: [],
    shouldRenderMetric: false,
  },
  style: LIGHT_THEME_BULLET_STYLE,
  bandColors: ['#D9C6EF', '#AA87D1'],
};

const mapStateToProps = (state: GlobalChartState): StateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const theme = getChartThemeSelector(state);

  const {
    debug,
    // onElementClick,
    // onElementOut,
    // onElementOver,
  } = getSettingsSpecSelector(state);

  return {
    initialized: true,
    debug,
    chartId: state.chartId,
    hasTitles: hasChartTitles(state),
    spec: getBulletSpec(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
    layout: layout(state),
    style: theme.bulletGraph,
    bandColors: theme.background.fallbackColor === 'black' ? ['#6092C0', '#3F4E61'] : ['#D9C6EF', '#AA87D1'], //['#6092C0', '#3F4E61']
    //.range(['#D9C6EF', '#AA87D1']);
    // onElementClick,
    // onElementOver,
    // onElementOut,
  };
};

/** @internal */
export const BulletGraphRenderer = connect(mapStateToProps, mapDispatchToProps)(Component);
