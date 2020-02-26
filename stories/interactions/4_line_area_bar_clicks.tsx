import { action } from '@storybook/addon-actions';
import React from 'react';
import { AreaSeries, Axis, BarSeries, Chart, LineSeries, Position, ScaleType, Settings } from '../../src/';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
};

export const example = () => {
  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} {...onElementListeners} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 2.3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 8 },
        ]}
      />
      <LineSeries
        id="line"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2.3 },
          { x: 1, y: 7.3 },
          { x: 2, y: 6 },
          { x: 3, y: 2 },
        ]}
      />
    </Chart>
  );
};
