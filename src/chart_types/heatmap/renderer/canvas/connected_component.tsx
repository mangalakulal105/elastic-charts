/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ScreenReaderSummary } from '../../../../components/accessibility';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { Dimensions } from '../../../../utils/dimensions';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geometries } from '../../state/selectors/geometries';
import { getHeatmapContainerSizeSelector } from '../../state/selectors/get_heatmap_container_size';
import { renderCanvas2d } from './canvas_renderers';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartContainerDimensions: Dimensions;
  a11ySettings: A11ySettings;
  seriesTypes: string;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;
class Component extends React.Component<Props> {
  static displayName = 'Heatmap';

  // firstRender = true; // this will be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
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
      const { width, height }: Dimensions = this.props.chartContainerDimensions;
      renderCanvas2d(this.ctx, this.devicePixelRatio, {
        ...this.props.geometries,
        config: { ...this.props.geometries.config, width, height },
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      a11ySettings,
      seriesTypes,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          <ScreenReaderSummary a11ySettings={a11ySettings} seriesTypes={seriesTypes} />
        </canvas>
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  geometries: nullShapeViewModel(),
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  seriesTypes: 'heatmap chart',
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    geometries: geometries(state),
    chartContainerDimensions: getHeatmapContainerSizeSelector(state),
    a11ySettings: getA11ySettingsSelector(state),
    seriesTypes: 'heatmap chart',
  };
};

/** @internal */
export const Heatmap = connect(mapStateToProps, mapDispatchToProps)(Component);
