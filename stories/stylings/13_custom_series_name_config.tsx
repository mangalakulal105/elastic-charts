import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { SeriesNameConfigOptions } from '../../src/chart_types/xy_chart/utils/specs';

export const example = () => {
  const customSeriesNameOptions: SeriesNameConfigOptions = {
    names: [
      {
        // replace split accessor;
        accessor: 'g',
        value: 'a',
        name: 'replace a(from g)',
      },
      {
        // replace y accessor;
        accessor: 'y2',
        name: 'replace y2',
      },
    ],
    delimiter: ' | ',
  };
  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        data={TestDatasets.BARCHART_2Y1G}
        name={customSeriesNameOptions}
      />
    </Chart>
  );
};
