/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const onShownClickText = text('onShownClickLabel', 'Click: isolate series');
  const onHiddenClickText = text('onHiddenClickLabel', 'Click: show all series');
  const onShownShiftClickText = text('onShownShiftClickLabel', 'SHIFT + click: hide series');
  const onHiddenShifText = text('onHiddenShiftClickLabel', 'SHIFT + click: show series');
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Top}
        legendItemLabels={{
          onShownClick: onShownClickText,
          onHiddenClick: onHiddenClickText,
          onShownShiftClick: onShownShiftClickText,
          onHiddenShiftClick: onHiddenShifText,
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};
