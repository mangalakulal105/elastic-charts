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
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { render } from '../../layout/viewmodel/scenegraph';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getColorScale } from './get_color_scale';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const geometries = createCustomCachedSelector(
  [
    getHeatmapSpecSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    getHeatmapTableSelector,
    getColorScale,
    getDeselectedSeriesSelector,
    getChartThemeSelector,
  ],
  (
    heatmapSpec,
    dims,
    settingSpec,
    heatmapTable,
    { bands, scale: colorScale },
    deselectedSeries,
    theme,
  ): ShapeViewModel => {
    // instead of using the specId, each legend item is associated with an unique band label
    const disabledBandLabels = new Set(
      deselectedSeries.map(({ specId }) => {
        return specId;
      }),
    );

    const bandsToHide: Array<[number, number]> = bands
      .filter(({ label }) => {
        return disabledBandLabels.has(label);
      })
      .map(({ start, end }) => [start, end]);

    return heatmapSpec
      ? render(heatmapSpec, settingSpec, dims, heatmapTable, colorScale, bandsToHide, theme)
      : nullShapeViewModel();
  },
);
