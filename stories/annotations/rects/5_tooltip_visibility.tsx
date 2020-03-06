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

import { select } from '@storybook/addon-knobs';
import React from 'react';
import { AnnotationTooltipFormatter, Axis, BarSeries, Chart, ScaleType, RectAnnotation } from '../../../src';
import { Position } from '../../../src/utils/commons';

export const example = () => {
  const tooltipOptions = {
    'default formatter, details defined': 'default_defined',
    'default formatter, details undefined': 'default_undefined',
    'custom formatter, return element': 'custom_element',
    'custom formatter, return null': 'custom_null',
  };

  const tooltipFormat = select('tooltip format', tooltipOptions, 'default_defined');

  const isDefaultDefined = tooltipFormat === 'default_defined';

  const dataValues = [
    {
      coordinates: {
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 7,
      },
      details: isDefaultDefined ? 'foo' : undefined,
    },
  ];

  const isCustomTooltipElement = tooltipFormat === 'custom_element';
  const tooltipFormatter: AnnotationTooltipFormatter = () => {
    if (!isCustomTooltipElement) {
      return null;
    }

    return <div>custom formatter</div>;
  };

  const isCustomTooltip = tooltipFormat.includes('custom');

  return (
    <Chart className="story-chart">
      <RectAnnotation
        dataValues={dataValues}
        id="rect"
        renderTooltip={isCustomTooltip ? tooltipFormatter : undefined}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
