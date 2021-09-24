/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, ShapeTreeNode } from '@elastic/charts';
import { defaultValueFormatter } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, colorBrewerCategoricalStark9, productLookup } from '../utils/utils';

export const Example = () => {
  const showDebug = boolean('show table for debugging', false);
  return (
    <Chart className="story-chart">
      <Settings
        theme={{
          chartPaddings: { left: 50, right: 50, top: 50, bottom: 50 },
        }}
        baseTheme={useBaseTheme()}
        debug={showDebug}
        showLegend
        flatLegend
        showLegendExtra
      />
      <Partition
        id="spec_1"
        data={mocks.pie.slice(0, 4)}
        layout={PartitionLayout.waffle}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9.slice(1))(d.sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9.slice(1))(d.sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};
