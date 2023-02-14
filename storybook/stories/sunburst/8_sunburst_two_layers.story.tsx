/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  defaultPartitionValueFormatter,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
} from '@elastic/charts';
import { CHILDREN_KEY, entryKey, entryValue, PARENT_KEY, SORT_INDEX_KEY } from '@elastic/charts/src';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

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
    },
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 0.95,
    emptySizeRatio: 0,
    circlePadding: 4,
  },
};

export const Example = () => {
  const showDebug = boolean('show table for debugging', false);
  return (
    <Chart>
      <Settings showLegend legendMaxDepth={1} theme={theme} baseTheme={useBaseTheme()} debug={showDebug} />
      <Partition
        id="spec_1"
        data={mocks.sunburst}
        layout={PartitionLayout.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            fillLabel: {
              fontFamily: 'Impact',
              valueFormatter: (d: number) =>
                `$${defaultPartitionValueFormatter(Math.round(d / 1000000000000))}\u00A0Tn`,
            },
            shape: {
              fillColor: (entry) => {
                const node = entryValue(entry);
                // concat all leaf and define the color based on the index of the fist children
                const rootTree = node[PARENT_KEY][CHILDREN_KEY].flatMap((d) => entryValue(d)[CHILDREN_KEY]);
                const index = rootTree.findIndex((d) => entryValue(d) === entryValue(node[CHILDREN_KEY][0]));
                return indexInterpolatedFillColor(interpolatorCET2s)(null, index, rootTree);
              },
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: (entry) => {
                const node = entryValue(entry);
                // concat all leaf and define the color based on their index
                const rootTree = node[PARENT_KEY][PARENT_KEY][CHILDREN_KEY].flatMap((d) => entryValue(d)[CHILDREN_KEY]);
                const index = rootTree.findIndex((d) => entryValue(d) === node);

                return indexInterpolatedFillColor(interpolatorCET2s)(null, index, rootTree);
              },
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
