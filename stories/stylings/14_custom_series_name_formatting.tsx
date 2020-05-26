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

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, SeriesNameFn } from '../../src';
import moment from 'moment';
import { DateTime } from 'luxon';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const start = DateTime.fromISO('2019-01-01T00:00:00.000', { zone: 'utc' });
  const data = [
    { x: 1, y: 3, percent: 0.5, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 6, percent: 0.5, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 20, percent: 0.5, time: start.plus({ month: 3 }).toMillis() },
    { x: 1, y: 9, percent: 0.7, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 13, percent: 0.7, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 14, percent: 0.7, time: start.plus({ month: 3 }).toMillis() },
    { x: 1, y: 15, percent: 0.1, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 18, percent: 1, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 7, percent: 1, time: start.plus({ month: 3 }).toMillis() },
  ];
  const customSeriesNamingFn: SeriesNameFn = ({ yAccessor, splitAccessors }, isTooltip) =>
    [
      ...[...splitAccessors.entries()].map(([key, value]) => {
        if (key === 'time') {
          // Format time group
          if (isTooltip) {
            // Format tooltip time to be longer
            return moment(value).format('ll');
          }

          // Format legend to be shorter
          return moment(value).format('M/YYYY');
        }

        if (key === 'percent') {
          // Format percent group
          return `${(value as number) * 100}%`;
        }

        return value;
      }),
      // don't format yAccessor
      yAccessor,
    ].join(' - ');

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['time', 'percent']}
        data={data}
        name={customSeriesNamingFn}
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
