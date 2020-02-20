import React from 'react';
import {
  Axis,
  Chart,
  CurveType,
  getAxisId,
  getSpecId,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export default {
  title: 'Line Chart/Multipe with Axis and Legend',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const multiplewaxisandlegend = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        showOverlappingTicks={true}
        tickFormat={dateFormatter}
      />
      <Axis
        id={getAxisId('left')}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />

      <LineSeries
        id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.LINEAR}
      />
      <LineSeries
        id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[1].metric.label)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
        curve={CurveType.LINEAR}
      />
      <LineSeries
        id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[2].metric.label)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
        curve={CurveType.LINEAR}
      />
    </Chart>
  );
};
multiplewaxisandlegend.story = {
  name: 'multiple w axis and legend',
};
