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

import createCachedSelector from 're-reselect';

import { ScaleBand } from '../../../../scales/scale_band';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { Dimensions } from '../../../../utils/dimensions';
import { Point } from '../../../../utils/point';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;

export type PointerPosition = Point & { horizontalPanelValue: PrimitiveValue; verticalPanelValue: PrimitiveValue };
/**
 * Get the x and y pointer position relative to the chart projection area
 * @internal
 */
export const getProjectedPointerPositionSelector = createCachedSelector(
  [getCurrentPointerPosition, computeChartDimensionsSelector, computeSmallMultipleScalesSelector],
  (currentPointerPosition, { chartDimensions }, smallMultipleScales): PointerPosition =>
    getProjectedPointerPosition(currentPointerPosition, chartDimensions, smallMultipleScales),
)(getChartIdSelector);

/**
 * Get the x and y pointer position relative to the chart projection area
 * @param chartAreaPointerPosition the pointer position relative to the chart area
 * @param chartAreaDimensions the chart dimensions
 */
function getProjectedPointerPosition(
  chartAreaPointerPosition: Point,
  { left, top, width, height }: Dimensions,
  { horizontal, vertical }: SmallMultipleScales,
): PointerPosition {
  const { x, y } = chartAreaPointerPosition;
  // get positions relative to chart
  let xPos = x - left;
  let yPos = y - top;

  // limit cursorPosition to the chart area
  if (xPos < 0 || xPos >= width) {
    xPos = -1;
  }
  if (yPos < 0 || yPos >= height) {
    yPos = -1;
  }
  const h = getPosRelativeToPanel(horizontal, xPos);
  const v = getPosRelativeToPanel(vertical, yPos);

  return {
    x: h.pos,
    y: v.pos,
    horizontalPanelValue: h.value,
    verticalPanelValue: v.value,
  };
}

function getPosRelativeToPanel(panelScale: ScaleBand, pos: number): { pos: number; value: PrimitiveValue } {
  const outerPadding = panelScale.outerPadding * panelScale.step;
  const innerPadding = panelScale.innerPadding * panelScale.step;
  const numOfDomainSteps = panelScale.domain.length;
  const rangeWithoutOuterPaddings = numOfDomainSteps * panelScale.bandwidth + (numOfDomainSteps - 1) * innerPadding;

  if (pos < outerPadding || pos > outerPadding + rangeWithoutOuterPaddings) {
    return { pos: -1, value: null };
  }
  const posWOInitialOuterPadding = pos - outerPadding;
  const minEqualSteps = (numOfDomainSteps - 1) * panelScale.step;
  if (posWOInitialOuterPadding <= minEqualSteps) {
    const relativePosIndex = Math.floor(posWOInitialOuterPadding / panelScale.step);
    const relativePos = posWOInitialOuterPadding - panelScale.step * relativePosIndex;
    if (relativePos > panelScale.bandwidth) {
      return { pos: -1, value: null };
    }
    return { pos: relativePos, value: panelScale.domain[relativePosIndex] };
  }
  return {
    pos: posWOInitialOuterPadding - panelScale.step * (numOfDomainSteps - 1),
    value: panelScale.domain[numOfDomainSteps - 1],
  };
}
