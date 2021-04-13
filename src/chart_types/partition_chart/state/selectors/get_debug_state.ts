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

import { TAU } from '../../../../common/constants';
import { Pixels, PointObject } from '../../../../common/geometry';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { DebugState, PartitionDebugState } from '../../../../state/types';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { isSunburst } from '../../layout/viewmodel/viewmodel';
import { partitionMultiGeometries } from './geometries';

/** @internal */
export const getDebugStateSelector = createCachedSelector(
  [partitionMultiGeometries],
  (geoms): DebugState => {
    return {
      partition: geoms.reduce<PartitionDebugState[]>((acc, { panelTitle, config, quadViewModel, diskCenter }) => {
        const partitions: PartitionDebugState['partitions'] = quadViewModel.map((quadViewModel) => {
          const { dataName, depth, fillColor, value } = quadViewModel;
          return {
            name: dataName,
            depth,
            color: fillColor,
            value,
            coords: isSunburst(config.partitionLayout)
              ? getCoordsForSector(quadViewModel, diskCenter)
              : getCoordsForRectangle(quadViewModel, diskCenter),
          };
        });
        acc.push({
          panelTitle,
          partitions,
        });
        return acc;
      }, []),
    };
  },
)(getChartIdSelector);

function getCoordsForSector({ x0, x1, y1px, y0px }: QuadViewModel, diskCenter: PointObject): [Pixels, Pixels] {
  const X0 = x0 - TAU / 4;
  const X1 = x1 - TAU / 4;
  const cr = y0px + (y1px - y0px) / 2;
  const angle = X0 + (X1 - X0) / 2;
  const x = Math.cos(angle) * cr + diskCenter.x;
  const y = Math.sin(angle) * cr + diskCenter.y;
  return [x, y];
}

function getCoordsForRectangle({ x0, x1, y1px, y0px }: QuadViewModel, diskCenter: PointObject): [Pixels, Pixels] {
  const y = y0px + (y1px - y0px) / 2 + diskCenter.y;
  const x = x0 + (x1 - x0) / 2 + diskCenter.x;
  return [x, y];
}
