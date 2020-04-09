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

import React from 'react';
import { BubbleSeriesSpec, DEFAULT_GLOBAL_ID, SeriesTypes } from '../utils/specs';
import { ScaleType } from '../../../scales';
import { ChartTypes } from '../../../chart_types';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
import { SpecTypes } from '../../../specs/settings';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: SpecTypes.Series,
  seriesType: SeriesTypes.Bubble,
  groupId: DEFAULT_GLOBAL_ID,
  xScaleType: ScaleType.Ordinal,
  yScaleType: ScaleType.Linear,
  xAccessor: 'x',
  yAccessors: ['y'],
  hideInLegend: false,
  yScaleToDataExtent: false,
};
type SpecRequiredProps = Pick<BubbleSeriesSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<BubbleSeriesSpec, 'chartType' | 'specType' | 'seriesType' | 'id' | 'data'>>;

/**
 * @note This series type uses a spatial index that is incompatible with other series types.
 * Nothing will break, just the tooltip values will be combined across linear and spatial values.
 * Please avoid mixed series types until this is resolved.
 */
export const BubbleSeries: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    BubbleSeriesSpec,
    | 'seriesType'
    | 'groupId'
    | 'xScaleType'
    | 'yScaleType'
    | 'xAccessor'
    | 'yAccessors'
    | 'hideInLegend'
    | 'yScaleToDataExtent'
  >(defaultProps),
);
