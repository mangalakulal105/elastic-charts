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

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../packages/elastic-charts/src';
import { SeededDataGenerator } from '../../packages/elastic-charts/src/mocks/utils';
import { TooltipType } from '../../packages/elastic-charts/src/specs/constants';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const dg = new SeededDataGenerator();
  const data = dg.generateSimpleSeries(15000);
  const tooltipProps = {
    type: TooltipType.Follow,
  };
  return (
    <Chart className="story-chart">
      <Settings tooltip={tooltipProps} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
