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
  defaultPartitionValueFormatter,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
  entryValue,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

const theme: PartialTheme = {
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

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <div
      style={{
        maxWidth: 600,
        maxHeight: 600,
        resize: 'both',
        width: '100%',
        height: '100%',
        padding: '0px',
        overflow: 'auto',
      }}
    >
      <Chart title={title} description={description} size={{ height: 21 }}>
        <Settings showLegend legendMaxDepth={1} theme={theme} baseTheme={useBaseTheme()} />
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
                fillColor: (key, sortIndex, node) => {
                  // concat all leaf and define the color based on the index of the fist children
                  const rootTree = node.parent.children.flatMap((d) => entryValue(d).children);
                  const index = rootTree.findIndex((d) => entryValue(d) === entryValue(node.children[0]));
                  return indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, index, rootTree);
                },
              },
            },
            {
              groupByRollup: (d: Datum) => d.dest,
              nodeLabel: (d: any) => countryLookup[d].name,
              shape: {
                fillColor: (key, sortIndex, node) => {
                  // concat all leaf and define the color based on their index
                  const rootTree = node.parent.parent.children.flatMap((d) => entryValue(d).children);
                  const index = rootTree.findIndex((d) => entryValue(d) === node);
                  return indexInterpolatedFillColor(interpolatorCET2s(0.8))(null, index, rootTree);
                },
              },
            },
          ]}
        />
      </Chart>
    </div>
  );
};

Example.parameters = {
  markdown:
    'In this test we show a very short pie chart, where the legend is bearly visible and serves to check the avoidance of rendering error with zero or lower outerRadius',
};
