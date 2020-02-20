import { boolean, text } from '@storybook/addon-knobs';
import React from 'react';
import {
  AreaSeries,
  Axis,
  Chart,
  CurveType,
  getAxisId,
  getSpecId,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { getRandomNumber } from '../../src/mocks/utils';

const dateFormatter = timeFormatter('HH:mm');

export default {
  title: 'Area Chart/Band Area Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const bandAreaChart = () => {
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => {
    return {
      x: d[0],
      max: d[1] + 4 + 4 * getRandomNumber(),
      min: d[1] - 4 - 4 * getRandomNumber(),
    };
  });
  const lineData = KIBANA_METRICS.metrics.kibana_os_load[0].data.map((d) => {
    return [d[0], d[1]];
  });
  const scaleToDataExtent = boolean('scale to extent', true);
  const y0AccessorFormat = text('y0AccessorFormat', '');
  const y1AccessorFormat = text('y1AccessorFormat', '');
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis
        id={getAxisId('bottom')}
        title={'timestamp per 1 minute'}
        position={Position.Bottom}
        showOverlappingTicks={true}
        tickFormat={dateFormatter}
      />
      <Axis
        id={getAxisId('left')}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id={getSpecId('area')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={'x'}
        yAccessors={['max']}
        y0Accessors={['min']}
        y1AccessorFormat={y1AccessorFormat || undefined}
        y0AccessorFormat={y0AccessorFormat || undefined}
        data={data}
        yScaleToDataExtent={scaleToDataExtent}
        curve={CurveType.CURVE_MONOTONE_X}
      />

      <LineSeries
        id={getSpecId('average')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={lineData}
        yScaleToDataExtent={scaleToDataExtent}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
bandAreaChart.story = {
  name: 'band area chart',
};
