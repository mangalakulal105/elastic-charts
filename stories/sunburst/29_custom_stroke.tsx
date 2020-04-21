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
 * under the License. */

import { Chart, Datum, Partition, PartitionLayout, Settings } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import React from 'react';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';
import { color } from '@storybook/addon-knobs';

export const example = () => {
  const partialCustomTheme = {
    background: {
      color: color('Change background container color', 'black'),
    },
  };
  return (
    <Chart className="story-chart-dark">
      <Settings theme={partialCustomTheme} />
      <Partition
        id="spec_1"
        data={mocks.manyPie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.origin,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            fillLabel: { textInvertible: true },
            shape: {
              fillColor: indexInterpolatedFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          partitionLayout: PartitionLayout.sunburst,
          linkLabel: { maxCount: 15, textColor: 'white' },
          sectorLineStroke: 'rgb(26, 27, 32)', // same as the dark theme
          sectorLineWidth: 1.2,
        }}
      />
    </Chart>
  );
};
