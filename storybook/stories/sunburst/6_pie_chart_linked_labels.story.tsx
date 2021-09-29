/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { defaultValueFormatter } from '@elastic/charts/src/chart_types/partition_chart/layout/config';

import { useBaseTheme } from '../../use_base_theme';
import { indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => (
  <Chart>
    <Settings
      theme={{
        chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
        partition: { linkLabel: { maximumSection: 10000 } },
      }}
      baseTheme={useBaseTheme()}
    />
    <Partition
      id="spec_1"
      data={[
        { sitc1: 'Machinery and transport equipment', exportVal: 5 },
        { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 4 },
      ]}
      layout={PartitionLayout.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultValueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
    />
  </Chart>
);
