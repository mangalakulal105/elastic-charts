import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Rotations/0 Deg Linear',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const rotations0DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={0} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations0DegLinear.story = {
  name: '0 deg linear',
};
