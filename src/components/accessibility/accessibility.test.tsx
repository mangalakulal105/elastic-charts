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

import { BarSeries, LineSeries, Settings } from '../../specs';
import { Chart } from '../chart';

describe('Accessibility', () => {
  it('should include the series types if one type of series', () => {
    const wrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <BarSeries id="test" data={[{ x: 0, y: 2 }]} />
      </Chart>,
    );
    const html = wrapper.html();
    const ddTagStartIndex = html.indexOf('<dd>');
    const ddTag = html.slice(ddTagStartIndex, ddTagStartIndex + 18);
    expect(ddTag).toBe('<dd>bar chart</dd>');
  });
  it('should include the series types if multiple types of series', () => {
    const wrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <BarSeries id="test" data={[{ x: 0, y: 2 }]} />
        <LineSeries id="test2" data={[{ x: 3, y: 5 }]} />
      </Chart>,
    );
    const html = wrapper.html();
    const ddTagStartIndex = html.indexOf('<dd>');
    const ddTag = html.slice(ddTagStartIndex, ddTagStartIndex + 40);
    expect(ddTag).toBe('<dd>Mixed chart: bar and line chart</dd>');
  });
});
