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
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isHorizontalLegend } from '../../../../utils/legend';
import { Config } from '../../layout/types/config_types';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

/** @internal */
export interface GridHeightParams {
  height: number;
  gridCellHeight: number;
  pageSize: number;
}
const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const getGridHeightParamsSelector = createCustomCachedSelector(
  [
    getLegendSizeSelector,
    getSettingsSpecSelector,
    getParentDimension,
    getHeatmapConfigSelector,
    getHeatmapTableSelector,
    getHeatmapSpecSelector,
    getChartThemeSelector,
  ],
  (
    legendSize,
    { showLegend },
    { height: containerHeight },
    { xAxisLabel: { padding, visible, fontSize }, grid, maxLegendHeight },
    { yValues },
    { xAxisTitle },
    { axes: axesStyle },
  ): GridHeightParams => {
    const xAxisHeight = visible ? fontSize : 0;
    const titleHeight = xAxisTitle ? axesStyle.axisTitle.fontSize : 0;
    let legendHeight = 0;
    if (showLegend && isHorizontalLegend(legendSize.position)) {
      legendHeight = maxLegendHeight ?? legendSize.height;
    }
    const verticalRemainingSpace = containerHeight - xAxisHeight - padding - legendHeight - titleHeight;

    // compute the grid cell height
    const gridCellHeight = getGridCellHeight(yValues, grid, verticalRemainingSpace);
    const height = gridCellHeight * yValues.length;

    const pageSize =
      gridCellHeight > 0 && height > containerHeight
        ? Math.floor(verticalRemainingSpace / gridCellHeight)
        : yValues.length;
    return {
      height,
      gridCellHeight,
      pageSize,
    };
  },
);

function getGridCellHeight(yValues: Array<string | number>, grid: Config['grid'], height: number): number {
  if (yValues.length === 0) {
    return height;
  }
  const stretchedHeight = height / yValues.length;

  if (stretchedHeight < grid.cellHeight.min) {
    return grid.cellHeight.min;
  }
  if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
    return grid.cellHeight.max;
  }

  return stretchedHeight;
}

/**@internal */
export const xAxisTitlePosition = createCustomCachedSelector(
  [
    getLegendSizeSelector,
    getSettingsSpecSelector,
    getParentDimension,
    getHeatmapConfigSelector,
    getHeatmapSpecSelector,
  ],
  (
    { height, position },
    { showLegend },
    { height: containerHeight },
    { xAxisLabel: { padding, fontSize, visible }, axisTitleStyle, maxLegendHeight },
    { xAxisTitle },
  ): number => {
    const xAxisHeight = visible ? fontSize : 0;
    const titleHeight = xAxisTitle ? axisTitleStyle.fontSize / 2 : 0;
    let legendHeight = 0;
    if (showLegend && isHorizontalLegend(position)) {
      legendHeight = maxLegendHeight ?? height;
    }
    const titlePadding =
      typeof axisTitleStyle.padding === 'number' ? axisTitleStyle.padding : axisTitleStyle.padding.outer;
    // for top and bottom of the xAxisLabel
    const totalVerticalPadding = padding * 2;

    return containerHeight - xAxisHeight - totalVerticalPadding - legendHeight - titleHeight - titlePadding;
  },
);
