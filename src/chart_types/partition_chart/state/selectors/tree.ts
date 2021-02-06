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

import { configMetadata } from '../../layout/config';
import { childOrders, HierarchyOfArrays, HIERARCHY_ROOT_KEY } from '../../layout/utils/group_by_rollup';
import { getHierarchyOfArrays } from '../../layout/viewmodel/hierarchy_of_arrays';
import { isSunburst, isTreemap } from '../../layout/viewmodel/viewmodel';
import { PartitionSpec } from '../../specs';
import { getPartitionSpecs } from './get_partition_specs';

function getTreeForSpec(spec: PartitionSpec) {
  const { data, valueAccessor, layers } = spec;
  const layout = spec.config.partitionLayout ?? configMetadata.partitionLayout.dflt;
  const sorter = isTreemap(layout) || isSunburst(layout) ? childOrders.descending : null;
  return getHierarchyOfArrays(
    data,
    valueAccessor,
    [() => HIERARCHY_ROOT_KEY, ...layers.map(({ groupByRollup }) => groupByRollup)],
    sorter,
  );
}

/** @internal */
export const getTree = createCachedSelector(
  [getPartitionSpecs],
  (partitionSpecs): HierarchyOfArrays => {
    return partitionSpecs.length === 1 ? getTreeForSpec(partitionSpecs[0]) : []; // singleton!
  },
)((state) => state.chartId);
