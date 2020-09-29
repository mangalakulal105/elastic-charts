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

import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { computeChartDimensionsSelector, getHeatmapSpec, getHeatmapTable } from './compute_chart_dimensions';
import { getColorScale } from './get_color_scale';
import { render } from './scenegraph';

/** @internal */
export const geometries = createCachedSelector(
  [getHeatmapSpec, computeChartDimensionsSelector, getSettingsSpecSelector, getHeatmapTable, getColorScale],
  (heatmapSpec, chartDimensions, settingSpec, heatmapTable, colorScale): ShapeViewModel => {
    return heatmapSpec
      ? render(heatmapSpec, settingSpec, chartDimensions, heatmapTable, colorScale)
      : nullShapeViewModel();
  },
)(getChartIdSelector);
