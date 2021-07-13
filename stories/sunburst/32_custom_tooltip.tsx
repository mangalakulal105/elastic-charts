/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings, CustomTooltip } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { getPlacementKnob, getFallbackPlacementsKnob, getBoundaryKnob } from '../utils/knobs';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

const CustomTooltip: CustomTooltip = ({ values }) => (
  <div
    style={{
      padding: 10,
      minHeight: 40,
      backgroundColor: 'blue',
      color: 'white',
    }}
  >
    My Custom Tooltip:
    <br />
    {values.map(({ label }) => label)}
  </div>
);

export const Example = () => {
  const tooltipOptions = {
    placement: getPlacementKnob('Tooltip placement'),
    fallbackPlacements: getFallbackPlacementsKnob(),
    boundary: getBoundaryKnob(),
    customTooltip: boolean('Custom Tooltip', false) ? CustomTooltip : undefined,
  };
  return (
    <Chart className="story-chart">
      <Settings showLegend legendMaxDepth={1} theme={STORYBOOK_LIGHT_THEME} tooltip={tooltipOptions} />
      <Partition
        id="spec_1"
        data={mocks.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            fillLabel: {
              fontFamily: 'Impact',
              valueFormatter: (d: number) =>
                `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000000))}\u00A0Tn`,
            },
            shape: {
              fillColor: (d) =>
                // pick color from color palette based on mean angle - rather distinct colors in the inner ring
                indexInterpolatedFillColor(interpolatorCET2s)(d, (d.x0 + d.x1) / 2 / (2 * Math.PI), []),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: (d) =>
                // pick color from color palette based on mean angle - related yet distinct colors in the outer ring
                indexInterpolatedFillColor(interpolatorCET2s)(d, (d.x0 + d.x1) / 2 / (2 * Math.PI), []),
            },
          },
        ]}
        config={{
          partitionLayout: PartitionLayout.sunburst,
          linkLabel: {
            maxCount: 0,
            fontSize: 14,
          },
          fontFamily: 'Arial',
          fillLabel: {
            textInvertible: true,
            valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontStyle: 'italic',
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          minFontSize: 1,
          idealFontSizeJump: 1.1,
          outerSizeRatio: 0.95,
          emptySizeRatio: 0,
          circlePadding: 4,
          backgroundColor: 'rgba(229,229,229,1)',
        }}
      />
    </Chart>
  );
};
