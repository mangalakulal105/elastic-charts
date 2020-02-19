import React from 'react';

import {
  Axis,
  Chart,
  HistogramBarSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

export default {
  title: 'Bar Chart/Test Single Histogram Bar Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const testSingleHistogramBarChart = () => {
  const formatter = timeFormatter(niceTimeFormatByDay(1));

  const xDomain = {
    minInterval: 60000,
  };

  return (
    <Chart className={'story-chart'}>
      <Settings xDomain={xDomain} />
      <Axis
        id={'bottom'}
        title={'timestamp per 1 minute'}
        position={Position.Bottom}
        showOverlappingTicks={true}
        tickFormat={formatter}
      />
      <Axis id={'left'} title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title} position={Position.Left} />
      <HistogramBarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 1)}
      />
    </Chart>
  );
};
testSingleHistogramBarChart.story = {
  name: '[test] single histogram bar chart',
};
