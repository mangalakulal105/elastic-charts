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

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  PointerEvent,
  Placement,
  niceTimeFormatter,
  TooltipType,
  LineSeries,
  AreaSeries,
  RectAnnotation,
} from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { palettes } from '../../packages/charts/src/utils/themes/colors';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const chartTypes: Record<string, any> = {
  bar: BarSeries,
  line: LineSeries,
  area: AreaSeries,
};

const getSeriesKnob = (group?: string) => {
  const type =
    select<string>(
      'Series type',
      {
        Bar: 'bar',
        Line: 'line',
        Area: 'area',
      },
      'area',
      group,
    ) ?? 'area';
  return chartTypes[type] ?? BarSeries;
};

export const Example = () => {
  const ref1 = React.createRef<Chart>();
  const ref2 = React.createRef<Chart>();
  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
    if (ref1.current) {
      ref1.current.dispatchExternalPointerEvent(event);
    }
    if (ref2.current) {
      ref2.current.dispatchExternalPointerEvent(event);
    }
  };
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = KIBANA_METRICS.metrics.kibana_os_load[1].data;

  const TopSeries = getSeriesKnob();
  const BottomSeries = getSeriesKnob();

  const showNullValues = boolean('show null values', true);

  return (
    <>
      <Chart className="story-chart" ref={ref1} size={{ height: '50%' }} id="chart1">
        <Settings
          onPointerUpdate={pointerUpdate}
          pointerUpdateDebounce={0}
          pointerUpdateTrigger="x"
          externalPointerEvents={{
            tooltip: { visible: true, placement: Placement.Left },
          }}
          tooltip={{ type: TooltipType.VerticalCursor, showNullValues }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          ticks={3}
          position={Position.Left}
          tickFormat={(d: any) => (d === null ? 'N/A' : Number(d).toFixed(2))}
        />
        <RectAnnotation
          dataValues={[
            {
              coordinates: { x0: data2[10][0], x1: data2[29][0] },
            },
          ]}
          id="zoomed"
          hideTooltips
        />

        <TopSeries
          id="Top"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data1.slice(2, 35).map((d, i) => {
            if (i === 7 || i === 11 || i === 12) {
              return [d[0], null];
            }
            return d;
          })}
        />
      </Chart>
      <Chart className="story-chart" ref={ref2} size={{ height: '50%' }} id="chart2">
        <Settings
          onPointerUpdate={pointerUpdate}
          tooltip={{ type: TooltipType.VerticalCursor, showNullValues }}
          externalPointerEvents={{
            tooltip: { visible: true, placement: Placement.Left, boundary: 'chart' },
          }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          position={Position.Left}
          ticks={3}
          tickFormat={(d: any) => (d === null ? 'N/A' : Number(d).toFixed(2))}
          domain={{ min: 5, max: 20 }}
        />

        <BottomSeries
          id="Bottom"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data2.slice(10, 30).map((d, i) => {
            if (i === 4 || i === 10) {
              return [d[0], null];
            }
            return d;
          })}
          color={palettes.echPaletteForLightBackground.colors[0]}
        />
      </Chart>
    </>
  );
};

Example.story = {
  parameters: {
    info: {
      text: '',
    },
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
