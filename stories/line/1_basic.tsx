import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Chart, getSpecId, LineSeries, ScaleType } from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

export default {
  title: 'Line Chart/Basic',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const basic = () => {
  const toggleSpec = boolean('toggle line spec', true);
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = data1.map((datum) => [datum[0], datum[1] - 1]);
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'lines1' : 'lines2';

  return (
    <Chart className={'story-chart'}>
      <LineSeries
        id={getSpecId(specId)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
basic.story = {
  name: 'basic',
};
