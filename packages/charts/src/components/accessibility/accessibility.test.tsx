/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { Goal } from '../../chart_types/goal_chart/specs';
import { GoalSubtype } from '../../chart_types/goal_chart/specs/constants';
import { defaultPartitionValueFormatter } from '../../chart_types/partition_chart/layout/config';
import { PartitionLayout } from '../../chart_types/partition_chart/layout/types/config_types';
import { arrayToLookup } from '../../common/color_calcs';
import { mocks } from '../../mocks/hierarchical';
import { productDimension } from '../../mocks/hierarchical/dimension_codes';
import { ScaleType } from '../../scales/constants';
import { AreaSeries, Axis, BarSeries, LineSeries, Partition, Settings } from '../../specs';
import { Datum, Position } from '../../utils/common';
import { KIBANA_METRICS } from '../../utils/data_samples/test_dataset_kibana';
import { Chart } from '../chart';

describe('Accessibility', () => {
  describe('Screen reader summary xy charts', () => {
    it('should include the series types if one type of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(wrapper.find('dd').first().text()).toBe('bar chart');
    });
    it('should include the series types if multiple types of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
          <LineSeries id="test2" data={[{ x: 3, y: 5 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(wrapper.find('dd').first().text()).toBe('Mixed chart: bar and line chart');
    });
  });

  describe('Partition charts accessibility', () => {
    const productLookup = arrayToLookup((d: any) => d.sitc1, productDimension);
    type TestDatum = { cat1: string; cat2: string; val: number };

    const sunburstWrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
        />
      </Chart>,
    );

    const treemapWrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          layout={PartitionLayout.treemap}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
        />
      </Chart>,
    );

    const sunburstLayerWrapper = mount(
      <Chart>
        <Settings showLegend flatLegend={false} legendMaxDepth={2} />
        <Partition
          id="spec_1"
          data={[
            { cat1: 'A', cat2: 'A', val: 1 },
            { cat1: 'A', cat2: 'B', val: 1 },
            { cat1: 'B', cat2: 'A', val: 1 },
            { cat1: 'B', cat2: 'B', val: 1 },
            { cat1: 'C', cat2: 'A', val: 1 },
            { cat1: 'C', cat2: 'B', val: 1 },
          ]}
          valueAccessor={(d: TestDatum) => d.val}
          layers={[
            {
              groupByRollup: (d: TestDatum) => d.cat1,
            },
            {
              groupByRollup: (d: TestDatum) => d.cat2,
            },
          ]}
        />
      </Chart>,
    );

    it('should include the series type if partition chart', () => {
      expect(sunburstWrapper.find('dd').first().text()).toBe('sunburst chart');
    });
    it('should include series type if treemap type', () => {
      expect(treemapWrapper.find('dd').first().text()).toBe('treemap chart');
    });
    it('should test defaults for screen reader data  table', () => {
      expect(sunburstWrapper.find('tr').first().text()).toBe('LabelValuePercentage');
    });
    it('should  include additional columns if a multilayer pie chart', () => {
      expect(sunburstLayerWrapper.find('tr').first().text()).toBe('DepthLabelParentValuePercentage');
    });
  });

  describe('Goal chart type accessibility', () => {
    const goalChartWrapper = mount(
      <Chart>
        <Goal
          id="spec_1"
          subtype={GoalSubtype.Goal}
          base={0}
          target={260}
          actual={170}
          bands={[200, 250, 300]}
          ticks={[0, 50, 100, 150, 200, 250, 300]}
          labelMajor="Revenue 2020 YTD  "
          labelMinor="(thousand USD)  "
          centralMajor="170"
          centralMinor=""
          angleStart={Math.PI}
          angleEnd={0}
        />
      </Chart>,
    );

    const bandLabelsAscending = ['freezing', 'chilly', 'brisk'];
    const bandsAscending = [200, 250, 300];

    const ascendingBandLabelsGoalChart = mount(
      <Chart className="story-chart">
        <Goal
          id="spec_1"
          subtype={GoalSubtype.Goal}
          base={0}
          target={260}
          actual={170}
          bands={bandsAscending}
          ticks={[0, 50, 100, 150, 200, 250, 300]}
          labelMajor="Revenue 2020 YTD  "
          labelMinor="(thousand USD)  "
          centralMajor="170"
          centralMinor=""
          angleStart={Math.PI}
          angleEnd={0}
          bandLabels={bandLabelsAscending}
        />
      </Chart>,
    );
    it('should test defaults for goal charts', () => {
      expect(goalChartWrapper.find('.echScreenReaderOnly').first().text()).toBe(
        'Revenue 2020 YTD  (thousand USD)  Chart type:goal chartMinimum:0Maximum:300Target:260Value:170',
      );
    });
    it('should correctly render ascending semantic values', () => {
      expect(ascendingBandLabelsGoalChart.find('.echGoalDescription').first().text()).toBe(
        '0 - 200freezing200 - 250chilly250 - 300brisk',
      );
    });
  });

  describe('screen reader table for cartesian charts', () => {
    const XYChartSingleSeriesSmall = mount(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    it('should have the data table in the markdown by default', () => {
      expect(XYChartSingleSeriesSmall.find('.echScreenReaderTable').first().text()).toBeDefined();
    });
    it('should not have buttons for more data with small dataset less than 20', () => {
      expect(XYChartSingleSeriesSmall.find('button')).toEqual({});
    });

    const XYChartSingleSeriesLarge = mount(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <AreaSeries
          id="area"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        />
      </Chart>,
    );
    it('should have buttons for more data with small dataset less than 20', () => {
      expect(XYChartSingleSeriesLarge.find('button')).toBeDefined();
    });
  });

  const timeslipLargeExample = mount(
    <Chart>
      <Settings theme={{ axes: { tickLine: { visible: true } } }} debug xDomain={undefined} />
      <Axis
        id="x_minor"
        position={Position.Top}
        showOverlappingTicks={false}
        showOverlappingLabels={false}
        showGridLines={true}
        style={{
          axisLine: { stroke: 'rgba(96, 146, 192, 1)' },
          tickLine: { size: 0.0001, padding: 4 },
          tickLabel: {
            ...{ fontSize: 11, fontFamily: 'Atkinson Hyperlegible' },
            alignment: { horizontal: Position.Left, vertical: Position.Bottom },
            padding: 0,
            offset: { x: 0, y: 0 },
          },
          axisTitle: { fontFamily: 'Atkinson Hyperlegible', fill: 'rgb(112,112,112)', fontSize: 15 },
        }}
        tickFormat={(d: any) =>
          new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }).format(d)
        }
        labelFormat={(d: any) =>
          `${new Intl.DateTimeFormat('en-US', { minute: 'numeric' }).format(d).padStart(2, '0')}′`
        }
        title="time (1-minute measurements)"
        timeAxisLayerCount={3}
      />
      <AreaSeries
        id="Utilization"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        yNice
        color="rgba(96, 146, 192, 1)"
        areaSeriesStyle={{ area: { opacity: 0.3 }, line: { opacity: 1 } }}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
      />
    </Chart>,
  );

  it('should show date time formatting correctly if tickFormatter is present', () => {
    // expect the third td showing the x values to be formatted as a date
    expect(timeslipLargeExample.find('td').slice(2, 3).text().startsWith('March 1, 2019')).toBeTruthy();
  });
});
