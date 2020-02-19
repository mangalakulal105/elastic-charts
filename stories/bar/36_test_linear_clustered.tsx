import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

export default {
  title: 'Bar Chart/Test Linear Clustered',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const testLinearClustered = () => {
  const data9 = [
    [1, 1, 3],
    [2, 2, 4],
    [3, 3, 5],
    [4, 4, 6],
    [5, 5, 7],
    [6, 4, 6],
    [7, 3, 5],
    [8, 2, 4],
    [9, 1, 3],
  ];
  return (
    <Chart className={'story-chart'}>
      <Axis id={'bottom'} title={'index'} position={Position.Bottom} />
      <Axis
        id={'left'}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />
      <BarSeries
        id={'lines'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1, 2]}
        data={data9}
      />
    </Chart>
  );
};
testLinearClustered.story = {
  name: '[test] - linear clustered',
};
