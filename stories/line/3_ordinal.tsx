import React from 'react';
import { Axis, Chart, LineSeries, niceTimeFormatByDay, Position, ScaleType, Settings, timeFormatter } from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { getChartRotationKnob } from '../utils/knobs';
import { SB_KNOBS_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export const example = () => {
  return (
    <Chart className="story-chart">
      <Settings rotation={getChartRotationKnob()} />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks={true} tickFormat={dateFormatter} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(2)}%`}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5)}
      />
    </Chart>
  );
};

// storybook configuration
example.story = {
  parameters: {
    options: { selectedPanel: SB_KNOBS_PANEL },
  },
};
