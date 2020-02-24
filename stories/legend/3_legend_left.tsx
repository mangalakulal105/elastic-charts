import React from 'react';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src/';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';

export const example = () => {
  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Left} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2']}
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};
