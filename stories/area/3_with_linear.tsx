import React from 'react';
import { AreaSeries, Axis, Chart, CurveType, Position, ScaleType } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const example = () => {
  const start = KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0];
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20).map((d) => {
    return [(d[0] - start) / 30000, d[1]];
  });
  return (
    <Chart className="story-chart">
      <Axis id="bottom" title="index" position={Position.Bottom} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <AreaSeries
        id="areas"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};

// storybook configuration
example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
