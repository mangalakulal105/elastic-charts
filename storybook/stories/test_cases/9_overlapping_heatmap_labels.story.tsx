/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, color, number, text } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, HeatmapStyle, RecursivePartial, Settings } from '@elastic/charts';

import { ScaleType } from '../../../packages/charts/src/scales/constants';
import { DATA_1, ECOMMERCE_DATA } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const heatmap: RecursivePartial<HeatmapStyle> = {
    xAxisLabel: {
      visible: boolean('xAxisLabel visible', true),
      fontSize: number('xAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }),
      padding: number('xAxisLabel padding', 6, { range: true, min: 0, max: 15 }),
      rotation: number('set rotation of x axis label', -20, { step: 1, min: -90, max: 0, range: true }),
      maxTextLength: parseFloat(text('set the max text length for the x axis labels', 'Infinity')),
    },
  };
  const useCategoricalDataset = boolean('categorical data', false);
  const dataset = useCategoricalDataset ? ECOMMERCE_DATA : DATA_1.data;
  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend={boolean('show legend', false)}
        legendPosition="right"
        brushAxis="both"
        theme={{ heatmap }}
        baseTheme={useBaseTheme()}
        debug
        onBrushEnd={action('onBrushEnd')}
      />
      <Heatmap
        id="heatmap2"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 100, color: '#AADC32' },
            { start: 100, end: 200, color: '#35B779' },
            { start: 200, end: 300, color: '#24868E' },
            { start: 300, end: 400, color: '#3B528B' },
            { start: 400, end: Infinity, color: '#471164' },
          ],
        }}
        xScale={
          useCategoricalDataset
            ? {
                type: ScaleType.Ordinal,
              }
            : {
                type: ScaleType.Time,
                interval: DATA_1.interval,
              }
        }
        data={dataset}
        timeZone={DATA_1.timeZone}
        xAxisLabelFormatter={useCategoricalDataset ? (d) => `${d}` : DATA_1.xFormatter}
        xAccessor={(d) => (useCategoricalDataset ? d[0] : d.x)}
        yAccessor={(d) => (useCategoricalDataset ? d[1] : d.y)}
        valueAccessor={(d) => (useCategoricalDataset ? d[2] : d.value)}
        valueFormatter={(value) => (Number.isFinite(value) ? value.toFixed(0.2) : '')}
        xSortPredicate="dataIndex"
      />
    </Chart>
  );
};
