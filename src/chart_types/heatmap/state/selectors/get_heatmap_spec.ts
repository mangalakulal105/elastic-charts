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

import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../../specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSpecs } from '../../../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { HeatmapSpec } from '../../specs';

/** @internal */
export const getHeatmapSpecSelector = createCachedSelector([getSpecs], (specs) => {
  const spec = getSpecsFromStore<HeatmapSpec>(specs, ChartTypes.Heatmap, SpecTypes.Series);
  return spec[0];
})(getChartIdSelector);
