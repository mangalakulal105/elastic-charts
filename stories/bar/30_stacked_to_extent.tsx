import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';

export default {
  title: 'Bar Chart/Single Data Chart Stacked to Extent',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const singledatachartstackedtoextent = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={[
          { x: 0, y: 10, g: 'a' },
          { x: 0, y: 20, g: 'b' },
          { x: 0, y: 30, g: 'c' },
        ]}
        yScaleToDataExtent={true}
      />
    </Chart>
  );
};
singledatachartstackedtoextent.story = {
  name: 'single data stacked chart scale to extent',
};
