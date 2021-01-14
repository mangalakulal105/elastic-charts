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

import { LegendItemExtraValues } from '../../../../commons/legend';
import { SeriesKey } from '../../../../commons/series_id';
import { SettingsSpec } from '../../../../specs';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { HierarchyOfArrays, CHILDREN_KEY } from '../../layout/utils/group_by_rollup';
import { PartitionSpec } from '../../specs';
import { getPieSpec } from './pie_spec';
import { getTree } from './tree';

/** @internal */
export const getLegendItemsExtra = createCachedSelector(
  [getPieSpec, getSettingsSpecSelector, getTree],
  (pieSpec, { legendMaxDepth }, tree): Map<SeriesKey, LegendItemExtraValues> => {
    const legendExtraValues = new Map<SeriesKey, LegendItemExtraValues>();

    if (!pieSpec) {
      return legendExtraValues;
    }
    if (isInvalidLegendMaxDepth(legendMaxDepth)) {
      return legendExtraValues;
    }

    return getExtraValueMap(pieSpec, tree);
  },
)(getChartIdSelector);

/**
 * Check if the legendMaxDepth from settings is not a valid number (NaN or <=0)
 *
 * @param legendMaxDepth - SettingsSpec['legendMaxDepth']
 */
function isInvalidLegendMaxDepth(legendMaxDepth: SettingsSpec['legendMaxDepth']): boolean {
  return typeof legendMaxDepth === 'number' && (Number.isNaN(legendMaxDepth) || legendMaxDepth <= 0);
}

/**
 * Creates flat extra value map from nested key path
 */
function getExtraValueMap(
  { layers, valueFormatter }: Pick<PartitionSpec, 'layers' | 'valueFormatter'>,
  tree: HierarchyOfArrays,
  keys: Map<SeriesKey, LegendItemExtraValues> = new Map(),
): Map<SeriesKey, LegendItemExtraValues> {
  if (tree.length === 0) {
    return keys;
  }

  for (let i = 0; i < tree.length; i++) {
    const branch = tree[i];
    const [key, arrayNode] = branch;
    const { value, path, [CHILDREN_KEY]: children } = arrayNode;

    if (key != null) {
      const values: LegendItemExtraValues = new Map();
      const formattedValue = valueFormatter ? valueFormatter(value) : value;

      values.set(key, formattedValue);
      keys.set(path.join('__'), values);
    }

    getExtraValueMap({ layers, valueFormatter }, children, keys);
  }
  return keys;
}
