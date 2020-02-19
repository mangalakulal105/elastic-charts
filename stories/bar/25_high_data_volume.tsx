import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, TooltipType } from '../../src';
import { SeededDataGenerator } from '../../src/mocks/utils';

export default {
  title: 'Bar Chart/With High Data Volume',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withHighDataVolume = () => {
  const dg = new SeededDataGenerator();
  const data = dg.generateSimpleSeries(15000);
  const tooltipProps = {
    type: TooltipType.Follow,
  };
  return (
    <Chart className={'story-chart'}>
      <Settings tooltip={tooltipProps} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data}
      />
    </Chart>
  );
};
withHighDataVolume.story = {
  name: 'with high data volume',
};
