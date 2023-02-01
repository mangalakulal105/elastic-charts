/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipInfo, XYChartSeriesIdentifier } from '@elastic/charts';

export const simple: TooltipInfo<any, XYChartSeriesIdentifier> = {
  header: {
    seriesIdentifier: {
      key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-a}',
      specId: 'bars1',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'y1'],
    },
    valueAccessor: 'y1',
    label: 'a - y1',
    value: 0,
    formattedValue: '2022-10-31 00:00:00.666',
    markValue: null,
    color: '#54B399',
    isHighlighted: false,
    isVisible: true,
    datum: { x: 0, g: 'a', y1: 1, y2: 4 },
  },
  values: [
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'a - y1',
      value: 1,
      formattedValue: '1.00',
      markValue: null,
      color: '#54B399',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y2}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'a - y2',
      value: 4,
      formattedValue: '4.00',
      markValue: null,
      color: '#6092C0',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-b}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'b - y1',
      value: 3,
      formattedValue: '3.00',
      markValue: null,
      color: '#D36086',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y2}splitAccessors{g-b}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'b - y2',
      value: 6,
      formattedValue: '6.00',
      markValue: null,
      color: '#9170B8',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
  ],
};

export const long: TooltipInfo<any, XYChartSeriesIdentifier> = {
  header: {
    seriesIdentifier: {
      key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-a}',
      specId: 'bars1',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: ['a', 'y1'],
    },
    valueAccessor: 'y1',
    label: 'a - y1',
    value: 0,
    formattedValue: '2022-10-31 00:00:00.666',
    markValue: null,
    color: '#54B399',
    isHighlighted: false,
    isVisible: true,
    datum: { x: 0, g: 'a', y1: 1, y2: 4 },
  },
  values: [
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'a - y1',
      value: 1,
      formattedValue: '1.00',
      markValue: null,
      color: '#54B399',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y2}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'a - y2',
      value: 4,
      formattedValue: '4.00',
      markValue: null,
      color: '#6092C0',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-b}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'b - y1',
      value: 3,
      formattedValue: '3.00',
      markValue: null,
      color: '#D36086',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y2}splitAccessors{g-b}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'b - y2',
      value: 6,
      formattedValue: '6.00',
      markValue: null,
      color: '#9170B8',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars2}yAccessor{y1}splitAccessors{g-a}',
        specId: 'bars2',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'a - y1',
      value: 1,
      formattedValue: '1.00',
      markValue: null,
      color: '#54B399',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars2}yAccessor{y2}splitAccessors{g-a}',
        specId: 'bars2',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'a - y2',
      value: 4,
      formattedValue: '4.00',
      markValue: null,
      color: '#6092C0',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars2}yAccessor{y1}splitAccessors{g-b}',
        specId: 'bars2',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'b - y1',
      value: 3,
      formattedValue: '3.00',
      markValue: null,
      color: '#D36086',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars2}yAccessor{y2}splitAccessors{g-b}',
        specId: 'bars2',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'b - y2',
      value: 6,
      formattedValue: '6.00',
      markValue: null,
      color: '#9170B8',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
  ],
};

export const partition: TooltipInfo<any, XYChartSeriesIdentifier> = {
  header: null,
  values: [
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'EMEA',
      value: 1,
      formattedValue: '5.23M (50%)',
      markValue: null,
      color: '#72A4CD',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y2}splitAccessors{g-a}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y2',
        splitAccessors: new Map(),
        seriesKeys: ['a', 'y2'],
      },
      valueAccessor: 'y1',
      label: 'Italy',
      value: 4,
      formattedValue: '2.51M (25%)',
      markValue: null,
      color: '#99BFDB',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'a', y1: 1, y2: 4 },
    },
    {
      seriesIdentifier: {
        key: 'groupId{__global__}spec{bars1}yAccessor{y1}splitAccessors{g-b}',
        specId: 'bars1',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['b', 'y1'],
      },
      valueAccessor: 'y1',
      label: 'Tuscany',
      value: 3,
      formattedValue: '5.76k (0.5%)',
      markValue: null,
      color: '#CEE0EC',
      isHighlighted: false,
      isVisible: true,
      datum: { x: 0, g: 'b', y1: 3, y2: 6 },
    },
  ],
};
