/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import {
  TooltipList,
  TooltipWrapper,
  CustomTooltip,
  TooltipHeader,
  TooltipListItem,
  TooltipMetricRow,
  TooltipFooter,
} from '@elastic/charts';

import * as dataSets from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const dataSet = select(
    'dataSet',
    {
      'Simple - table': 'tableSimple',
      'Simple - list': 'simple',
      'Long - list': 'long',
    },
    'simple',
  );
  const Row: typeof TooltipListItem = ({ item }) => (
    <div>
      {item.formattedValue} (x = {item.datum.x})
    </div>
  );
  const MyTooltip: CustomTooltip = ({ className, dir, values, header, backgroundColor }) => {
    return (
      <TooltipWrapper className={className} dir={dir}>
        <TooltipHeader>My custom header</TooltipHeader>
        <TooltipMetricRow label="Sum of values" metric={14} />
        <TooltipList maxHeight={100} items={values} backgroundColor={backgroundColor} renderItem={Row}></TooltipList>
        todo
        <TooltipFooter>Here's my fooot!</TooltipFooter>
      </TooltipWrapper>
    );
  };
  return <TooltipShowcase info={dataSets[dataSet]} settings={{ customTooltip: MyTooltip }} />;
};
