/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
  defaultPartitionValueFormatter,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export const Example = () => {
  const theme: PartialTheme = {
    chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
    background: {
      color: color('Background color', '#1c1c24'),
    },
    partition: {
      linkLabel: {
        maxCount: 15,
        textColor: boolean('custom linkLabel.textColor', false) ? color('linkLabel.textColor', 'white') : undefined,
      },
      fillLabel: {
        textColor: boolean('custom fillLabel.textColor', false) ? color('fillLabel.textColor', 'white') : undefined,
      },
      sectorLineWidth: 1.2,
    },
  };
  const fillColor = boolean('custom shape.fillColor', false) ? color('shape.fillColor', 'blue') : null;
  return (
    <Chart>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Partition
        id="spec_1"
        data={mocks.manyPie}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.origin,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            shape: {
              fillColor: fillColor ?? indexInterpolatedFillColor(interpolatorCET2s),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  theme: { default: 'dark' },
  background: { disable: true },
};
