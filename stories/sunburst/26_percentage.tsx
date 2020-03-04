import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import React from 'react';
import { ShapeTreeNode } from '../../src/chart_types/partition_chart/layout/types/viewmodel_types';
import {
  categoricalFillColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../utils/utils';

export const example = () => (
  <Chart className="story-chart">
    <Partition
      id="spec_26"
      data={mocks.miniSunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueGetter="percent"
      valueFormatter={(d: number) => `${Math.round(d)}%`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: any) => productLookup[d].name,
          shape: {
            fillColor: (d: ShapeTreeNode) => {
              return categoricalFillColor(colorBrewerCategoricalStark9, 0.7)(d.sortIndex);
            },
          },
        },
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          shape: {
            fillColor: (d: ShapeTreeNode) => {
              return categoricalFillColor(colorBrewerCategoricalStark9, 0.5)(d.parent.sortIndex);
            },
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          shape: {
            fillColor: (d: ShapeTreeNode) => {
              return categoricalFillColor(colorBrewerCategoricalStark9, 0.3)(d.parent.parent.sortIndex);
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
          fontStyle: 'italic',
          textInvertible: true,
          fontWeight: 900,
          valueFont: {
            fontFamily: 'Menlo',
            fontStyle: 'normal',
            fontWeight: 100,
          },
        },
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 1,
        idealFontSizeJump: 1.1,
        outerSizeRatio: 1,
        emptySizeRatio: 0,
        circlePadding: 4,
        backgroundColor: 'rgba(229,229,229,1)',
      }}
    />
  </Chart>
);
