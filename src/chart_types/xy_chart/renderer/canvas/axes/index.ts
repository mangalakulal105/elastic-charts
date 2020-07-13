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

import { withContext } from '../../../../../renderers/canvas';
import { Dimensions } from '../../../../../utils/dimensions';
import { AxisId } from '../../../../../utils/ids';
import { AxisStyle } from '../../../../../utils/themes/theme';
import { getSpecsById } from '../../../state/utils/spec';
import { AxisTick, AxisTicksDimensions, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisSpec } from '../../../utils/specs';
import { renderDebugRect } from '../utils/debug';
import { renderLine } from './line';
import { renderTick } from './tick';
import { renderTickLabel } from './tick_label';
import { renderTitle } from './title';

/** @internal */
export interface AxisProps {
  axisStyle: AxisStyle;
  axisSpec: AxisSpec;
  axisTicksDimensions: AxisTicksDimensions;
  axisPosition: Dimensions;
  ticks: AxisTick[];
  debug: boolean;
  chartDimensions: Dimensions;
}

/** @internal */
export interface AxesProps {
  axesVisibleTicks: Map<AxisId, AxisTick[]>;
  axesSpecs: AxisSpec[];
  axesTicksDimensions: Map<AxisId, AxisTicksDimensions>;
  axesPositions: Map<AxisId, Dimensions>;
  axesStyles: Map<string, AxisStyle | null>;
  sharedAxesStyle: AxisStyle;
  debug: boolean;
  chartDimensions: Dimensions;
}

/** @internal */
export function renderAxes(ctx: CanvasRenderingContext2D, props: AxesProps) {
  const {
    axesVisibleTicks,
    axesSpecs,
    axesTicksDimensions,
    axesPositions,
    axesStyles,
    sharedAxesStyle,
    debug,
    chartDimensions,
  } = props;
  axesVisibleTicks.forEach((ticks, axisId) => {
    const axisSpec = getSpecsById<AxisSpec>(axesSpecs, axisId);
    const axisTicksDimensions = axesTicksDimensions.get(axisId);
    const axisPosition = axesPositions.get(axisId);

    if (!ticks || !axisSpec || !axisTicksDimensions || !axisPosition || axisSpec.hide) {
      return;
    }

    const axisStyle = axesStyles.get(axisSpec.id) ?? sharedAxesStyle;

    renderAxis(ctx, {
      axisSpec,
      axisTicksDimensions,
      axisPosition,
      ticks,
      axisStyle,
      debug,
      chartDimensions,
    });
  });
}

function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  withContext(ctx, (ctx) => {
    const { ticks, axisPosition, debug, axisStyle, axisSpec } = props;
    const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);
    ctx.translate(axisPosition.left, axisPosition.top);
    if (debug) {
      renderDebugRect(ctx, {
        x: 0,
        y: 0,
        width: axisPosition.width,
        height: axisPosition.height,
      });
    }

    withContext(ctx, (ctx) => {
      renderLine(ctx, props);
    });

    if (showTicks) {
      withContext(ctx, (ctx) => {
        ticks.forEach((tick) => {
          renderTick(ctx, tick, props);
        });
      });
    }

    if (props.axisStyle.tickLabel.visible) {
      withContext(ctx, (ctx) => {
        ticks
          .filter((tick) => tick.label !== null)
          .forEach((tick) => {
            renderTickLabel(ctx, tick, showTicks, props);
          });
      });
    }

    withContext(ctx, (ctx) => {
      renderTitle(ctx, props);
    });
  });
}
