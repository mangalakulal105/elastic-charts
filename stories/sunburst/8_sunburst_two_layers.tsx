import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import React from 'react';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s, regionLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Two Layers',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const SunburstTwoLayers = () => (
  <Chart className="story-chart">
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: {
            fontFamily: 'Impact',
            valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000000))}\xa0Tn`,
          },
          shape: {
            fillColor: (d) => {
              // pick color from color palette based on mean angle - rather distinct colors in the inner ring
              return indexInterpolatedFillColor(interpolatorCET2s)(d, (d.x0 + d.x1) / 2 / (2 * Math.PI), []);
            },
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          shape: {
            fillColor: (d) => {
              // pick color from color palette based on mean angle - related yet distinct colors in the outer ring
              return indexInterpolatedFillColor(interpolatorCET2s)(d, (d.x0 + d.x1) / 2 / (2 * Math.PI), []);
            },
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
          valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`,
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
SunburstTwoLayers.story = {
  name: 'Sunburst with two layers, angle color',
};
