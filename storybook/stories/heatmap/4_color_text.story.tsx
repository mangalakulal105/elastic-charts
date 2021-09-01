/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Settings } from '@elastic/charts';
import { BABYNAME_DATA } from '@elastic/charts/src/utils/data_samples/babynames';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const data = BABYNAME_DATA.filter(([year]) => year > 1950 && year < 1960);
  const textContrast = select('set the textContrast parameter in the config', [true, false], true);
  const pageBackgroundColor = select(
    'set the pageBackgroundColor parameter in the config',
    ['#000000', 'rgba(0,0,0,1)', 'blue', 'black'],
    '#000000',
  );
  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
        baseTheme={useBaseTheme()}
      />
      <Heatmap
        id="heatmap2"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 1000, color: '#ffffcc' },
            { start: 1000, end: 5000, color: '#a1dab4' },
            { start: 5000, end: 10000, color: '#41b6c4' },
            { start: 10000, end: 50000, color: '#2c7fb8' },
            { start: 50000, end: Infinity, color: '#253494' },
          ],
        }}
        data={data}
        xAccessor={(d) => d[2]}
        yAccessor={(d) => d[0]}
        valueAccessor={(d) => d[3]}
        valueFormatter={(value) => value.toFixed(0.2)}
        xSortPredicate="alphaAsc"
        config={{
          pageBackgroundColor,
          grid: {
            stroke: {
              width: 0,
            },
          },
          cell: {
            maxWidth: 'fill',
            maxHeight: 20,
            label: {
              visible: true,
              textContrast,
            },
            border: {
              stroke: 'transparent',
              strokeWidth: 1,
            },
          },
          yAxisLabel: {
            visible: true,
          },
          onBrushEnd: action('onBrushEnd'),
        }}
      />
    </Chart>
  );
};
