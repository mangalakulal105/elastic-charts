import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Pie Chart with Two Slices',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const TwoSlicesPieChart = () => (
  <Chart className="story-chart">
    <Partition
      id="spec_1"
      data={mocks.pie.slice(0, 2)}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: { textInvertible: true },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{ partitionLayout: PartitionLayout.sunburst }}
    />
  </Chart>
);
TwoSlicesPieChart.story = {
  name: 'Pie chart with two slices',
};
