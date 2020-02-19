import React from 'react';
import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, timeFormatter } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter('HH:mm');

export default {
  title: 'Area Chart/Stacked with Separate Specs',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const stackedWithSeparatedSpecs = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'timestamp per 1 minute'}
        showOverlappingTicks={true}
        tickFormat={dateFormatter}
      />
      <Axis
        id={'left'}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <AreaSeries
        id={getSpecId('1')}
        name={KIBANA_METRICS.metrics.kibana_os_load[2].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
      />
      <AreaSeries
        id={getSpecId('2')}
        name={KIBANA_METRICS.metrics.kibana_os_load[1].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
      />
      <AreaSeries
        id={getSpecId('3')}
        name={KIBANA_METRICS.metrics.kibana_os_load[0].metric.label}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
      />
    </Chart>
  );
};
stackedWithSeparatedSpecs.story = {
  name: 'stacked with separated specs',
};
