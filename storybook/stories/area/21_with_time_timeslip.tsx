/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const minorGridStyle = { stroke: 'black', strokeWidth: 0.15, opacity: 1 };
const gridStyle = { stroke: 'black', strokeWidth: 0.5, opacity: 1 };
const fontFamily = '"Atkinson Hyperlegible"';
const tickLabelStyle = { fontSize: 11, fontFamily, fill: 'rgba(0,0,0,0.8)' };
const axisTitleColor = 'rgb(112,112,112)';
const axisTitleFontSize = 15;
const dataInk = 'rgba(96, 146, 192, 1)';

const xAxisStyle = {
  tickLine: { size: 0.0001, padding: -6, ...gridStyle },
  axisLine: { stroke: 'magenta', strokeWidth: 10, visible: false },
  tickLabel: {
    ...tickLabelStyle,
    alignment: { horizontal: Position.Left, vertical: Position.Bottom },
    padding: 0,
    offset: { x: 0, y: 0 },
  },
  axisTitle: { visible: false, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
};

const data = KIBANA_METRICS.metrics.kibana_os_load[0].data;
const t0 = data[0][0];

export const Example = () => {
  const whiskers = boolean('X axis minor whiskers', true);
  const shortWhiskers = boolean('Shorter X axis minor whiskers', true);
  const minorGridLines = boolean('Minor grid lines', true);
  const horizontalAxisTitle = boolean('Horizontal axis title', false);
  const topAxisLabelFormat = (d: any) => {
    // const chartWidth = document.querySelector('.echContainer')?.getBoundingClientRect().width ?? 0;
    return `${whiskers ? ' ' : ''}${new Intl.DateTimeFormat('en-US', { minute: 'numeric' })
      .format(d)
      .padStart(2, '0')}′  `;
  };
  const midAxisLabelFormatter = (d: any) => {
    return `${whiskers ? ' ' : ''}${new Intl.DateTimeFormat('en-US', { hour: 'numeric' })
      .format(d)
      .padStart(2, '0')}  `;
  };
  const bottomAxisLabelFormatter = (d: any) => {
    return `${whiskers ? ' ' : ''}${new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)}  `;
  };
  const yAxisTitle = 'CPU utilization';
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis
        id="title"
        title="System Load: CPU"
        position={Position.Top}
        tickFormat={() => (horizontalAxisTitle ? yAxisTitle : '')}
        ticks={0}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          axisTitle: { visible: true, fontFamily, fontSize: 24, fill: 'grey' },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tickLabel: horizontalAxisTitle
            ? {
                fill: 'rgb(64,64,64)',
                fontSize: axisTitleFontSize,
                padding: 20,
                alignment: { horizontal: 'center', vertical: Position.Bottom },
              }
            : {},
        })}
      />
      <Axis
        id="x_minor"
        position={Position.Bottom}
        showOverlappingTicks={false}
        tickFormat={topAxisLabelFormat}
        ticks={100}
        showGridLines={minorGridLines}
        gridLine={mergePartial(gridStyle, { strokeWidth: 0.1 })}
        style={mergePartial(
          xAxisStyle,
          whiskers
            ? {
                axisLine: { stroke: dataInk, strokeWidth: 1, visible: true },
                tickLine: { size: shortWhiskers ? 6 : 16, padding: shortWhiskers ? 0 : -10, ...minorGridStyle },
              }
            : { tickLine: { padding: 6 } },
        )}
        labelFormat={topAxisLabelFormat}
      />
      <Axis
        id="x_major"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks={false}
        showDuplicatedTicks={false}
        tickFormat={midAxisLabelFormatter}
        ticks={1}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          tickLabel: {
            padding: 0,
            offset: { x: 0, y: 0 },
          },
          tickLine: { size: 0.0001, padding: -6, ...gridStyle },
        })}
        labelFormat={midAxisLabelFormatter}
      />
      <Axis
        id="x_context"
        title="time (1-minute measurements)"
        position={Position.Bottom}
        showOverlappingTicks={false}
        showDuplicatedTicks={false}
        tickFormat={bottomAxisLabelFormatter}
        ticks={2}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          axisTitle: { visible: !horizontalAxisTitle, fontFamily },
        })}
        labelFormat={bottomAxisLabelFormatter}
      />
      <Axis
        id="left"
        title={yAxisTitle}
        position={Position.Left}
        showGridLines
        ticks={4}
        gridLine={minorGridStyle}
        style={{
          tickLine: { ...gridStyle, strokeWidth: 0.2, size: 8, padding: 4 },
          axisLine: { ...gridStyle, visible: false },
          tickLabel: { ...tickLabelStyle },
          axisTitle: { visible: !horizontalAxisTitle, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
        }}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <AreaSeries
        id="area1"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        yNice
        areaSeriesStyle={{
          area: { fill: dataInk, opacity: 0.3 },
          line: { stroke: dataInk, opacity: 1 },
        }}
        data={data.map(([t, v]) => [t0 + (t - t0) * 4, v])}
      />
    </Chart>
  );
};

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
