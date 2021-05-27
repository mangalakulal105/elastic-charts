/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { mount } from 'enzyme';
import React from 'react';

import { config } from '../../chart_types/partition_chart/layout/config';
import { PartitionLayout } from '../../chart_types/partition_chart/layout/types/config_types';
import { arrayToLookup } from '../../common/color_calcs';
import { mocks } from '../../mocks/hierarchical';
import { productDimension } from '../../mocks/hierarchical/dimension_codes';
import { BarSeries, LineSeries, Partition, Settings } from '../../specs';
import { Datum } from '../../utils/common';
import { Chart } from '../chart';

describe('Accessibility', () => {
  describe('Screen reader summary xy charts', () => {
    it('should include the series types if one type of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} />
        </Chart>,
      );
      expect(wrapper.find('dd').first().text()).toBe('bar chart');
    });
    it('should include the series types if multiple types of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} />
          <LineSeries id="test2" data={[{ x: 3, y: 5 }]} />
        </Chart>,
      );
      expect(wrapper.find('dd').first().text()).toBe('Mixed chart: bar and line chart');
    });
  });

  describe('Partition charts accessibility', () => {
    const productLookup = arrayToLookup((d: any) => d.sitc1, productDimension);
    const sunburstWrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
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
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
          config={{
            partitionLayout: PartitionLayout.treemap,
          }}
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
      expect(sunburstWrapper.find('tr').first().text()).toBe('CategoryValuePercentage');
    });
  });
});
