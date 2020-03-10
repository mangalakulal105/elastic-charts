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
 * under the License. */

import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { partitionGeometries } from './geometries';
import { INPUT_KEY } from '../../layout/utils/group_by_rollup';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { TooltipInfo } from '../../../../components/tooltip/types';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../../specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { PartitionSpec } from '../../specs';
import { valueGetterFunction } from './scenegraph';
import { percentValueGetter, sumValueGetter } from '../../layout/config/config';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

function getPieSpecOrNull(state: GlobalChartState): PartitionSpec | null {
  const pieSpecs = getSpecsFromStore<PartitionSpec>(state.specs, ChartTypes.Partition, SpecTypes.Series);
  return pieSpecs.length > 0 ? pieSpecs[0] : null;
}

function getValueFormatter(state: GlobalChartState) {
  return getPieSpecOrNull(state)?.valueFormatter;
}

function getValueGetter(state: GlobalChartState) {
  return getPieSpecOrNull(state)?.valueGetter || (() => NaN);
}

function getLabelFormatters(state: GlobalChartState) {
  return getPieSpecOrNull(state)?.layers;
}

const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
});

export const getTooltipInfoSelector = createCachedSelector(
  [
    getPieSpecOrNull,
    partitionGeometries,
    getCurrentPointerPosition,
    getValueGetter,
    getValueFormatter,
    getLabelFormatters,
  ],
  (pieSpec, geoms, pointerPosition, valueGetter, valueFormatter, labelFormatters): TooltipInfo => {
    if (!pieSpec || !valueFormatter || !labelFormatters) {
      return EMPTY_TOOLTIP;
    }
    const picker = geoms.pickQuads;
    const diskCenter = geoms.diskCenter;
    const x = pointerPosition.x - diskCenter.x;
    const y = pointerPosition.y - diskCenter.y;
    const pickedShapes: Array<QuadViewModel> = picker(x, y);
    const datumIndices = new Set();
    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };
    const valueGetterFun = valueGetterFunction(valueGetter);
    const primaryValueGetterFun = valueGetterFun === percentValueGetter ? sumValueGetter : valueGetterFun;
    pickedShapes.forEach((shape) => {
      const node = shape.parent;
      const labelFormatter = labelFormatters[shape.depth - 1];
      const formatter = labelFormatter?.nodeLabel;

      tooltipInfo.values.push({
        label: formatter ? formatter(shape.dataName) : shape.dataName,
        color: shape.fillColor,
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: pieSpec.id,
          key: pieSpec.id,
        },
        value: `${valueFormatter(primaryValueGetterFun(shape))} (${pieSpec.percentFormatter(
          percentValueGetter(shape),
        )})`,
        valueAccessor: shape.depth,
      });
      const shapeNode = node.children.find(([key]) => key === shape.dataName);
      if (shapeNode) {
        const indices = shapeNode[1][INPUT_KEY] || [];
        indices.forEach((i) => datumIndices.add(i));
      }
    });

    return tooltipInfo;
  },
)((state) => state.chartId);
