/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { ChartDimensions } from '../../../xy_chart/utils/dimensions';
import { getGridCellHeight } from '../utils/axis';
import { computeAxesSizesSelector } from './compute_axes_sizes';
import { getHeatmapTableSelector } from './get_heatmap_table';

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * Returns chart dimensions  axes sizes and positions.
 * @internal
 */
export const computeChartDimensionsSelector = createCustomCachedSelector(
  [getParentDimension, computeAxesSizesSelector, getHeatmapTableSelector, getChartThemeSelector],
  (parentDimensions, axesSizes, { yValues }, { heatmap, chartPaddings }): ChartDimensions => {
    const availableHeightForGrid =
      parentDimensions.height -
      axesSizes.xAxisTitleVerticalSize -
      axesSizes.xAxis.height -
      axesSizes.legendHeight -
      heatmap.grid.stroke.width / 2;

    const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
    const fullHeatmapHeight = rowHeight * yValues.length;
    const visibleNumberOfRows =
      rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
        ? Math.floor(availableHeightForGrid / rowHeight)
        : yValues.length;

    const chartWidth = axesSizes.xAxis.width;
    const chartHeight = visibleNumberOfRows * rowHeight - heatmap.grid.stroke.width / 2;
    return {
      leftMargin: 0, // not yet used
      chartDimensions: {
        top: parentDimensions.top + heatmap.grid.stroke.width / 2 + chartPaddings.top,
        left: parentDimensions.left + axesSizes.xAxis.left + chartPaddings.left,
        width: Math.max(0, chartWidth - chartPaddings.left - chartPaddings.right),
        height: Math.max(0, chartHeight - chartPaddings.top - chartPaddings.bottom),
      },
    };
  },
);
