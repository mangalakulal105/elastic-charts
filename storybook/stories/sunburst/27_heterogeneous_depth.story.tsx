/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Chart,
  Datum,
  Partition,
  PartitionLayout,
  Settings,
  PartialTheme,
  defaultPartitionValueFormatter,
  PrimitiveValue,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import {
  discreteColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../utils/utils';

const theme: PartialTheme = {
  chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
  partition: {
    linkLabel: {
      maxCount: 0,
      fontSize: 14,
    },
    fontFamily: 'Arial',
    fillLabel: {
      fontStyle: 'italic',
      fontWeight: 900,
      valueFont: {
        fontFamily: 'Menlo',
        fontStyle: 'normal',
        fontWeight: 100,
      },
    },
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    circlePadding: 4,
  },
};

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings theme={theme} baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.miniSunburst}
      layout={PartitionLayout.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: PrimitiveValue) => (d !== null ? productLookup[d].name : ''),
          shape: {
            fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalStark9, 0.7)(sortIndex),
          },
        },
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
          nodeLabel: (d: PrimitiveValue) => (d !== null ? regionLookup[d].regionName : ''),
          shape: {
            fillColor: (key, sortIndex, node) =>
              discreteColor(colorBrewerCategoricalStark9, 0.5)(node.parent.sortIndex),
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: PrimitiveValue) => (d !== null ? countryLookup[d].name : ''),
          showAccessor: (d: PrimitiveValue) => !(['chn', 'hkg', 'jpn', 'kor'] as PrimitiveValue[]).includes(d),
          shape: {
            fillColor: (key, sortIndex, node) =>
              discreteColor(colorBrewerCategoricalStark9, 0.3)(node.parent.parent.sortIndex),
          },
        },
      ]}
    />
  </Chart>
);

Example.parameters = {
  background: { default: 'white' },
};
