/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  LIGHT_THEME,
  LineSeries,
  niceTimeFormatByDay,
  PointShape,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { renderEuiColorPicker } from '../legend/11_legend_actions';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20);
const shapes = Object.values(PointShape);

export const Example = () => {
  const showColorPicker = boolean('Show color picker', false);

  return (
    <Chart className="story-chart">
      <Settings
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
        legendColorPicker={showColorPicker ? renderEuiColorPicker('leftCenter') : undefined}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      {shapes.map((shape, i) => {
        return (
          <LineSeries
            key={shape}
            id={shape}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            lineSeriesStyle={{ point: { shape, radius: 10 } }}
            data={data.map(([x, y]) => [x, y + 10 * i])}
          />
        );
      })}
      <LineSeries
        id="multi"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        color="lightgray"
        pointStyleAccessor={(datum) => {
          return {
            shape: shapes[datum.datum[2] % shapes.length],
            fill: LIGHT_THEME.colors.vizColors[datum.datum[2] % LIGHT_THEME.colors.vizColors.length],
            opacity: 0.9,
            radius: 5,
            stroke: LIGHT_THEME.colors.vizColors[datum.datum[2] % LIGHT_THEME.colors.vizColors.length],
            strokeWidth: 1,
            visible: true,
          };
        }}
        data={data.map(([x, y], i) => [x, y + 60, i])}
      />
    </Chart>
  );
};
