/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartSize } from './chart_size';

describe('chart size utilities', () => {
  test('array', () => {
    expect(getChartSize([100, 100])).toEqual({
      width: 100,
      height: 100,
    });
    expect(getChartSize([undefined, 100])).toEqual({
      width: '100%',
      height: 100,
    });
    expect(getChartSize([100, undefined])).toEqual({
      width: 100,
      height: '100%',
    });
    expect(getChartSize([undefined, undefined])).toEqual({
      width: '100%',
      height: '100%',
    });
    expect(getChartSize([0, '100em'])).toEqual({
      width: 0,
      height: '100em',
    });
  });
  test('value', () => {
    expect(getChartSize(1)).toEqual({
      width: 1,
      height: 1,
    });
    expect(getChartSize('100em')).toEqual({
      width: '100em',
      height: '100em',
    });
    expect(getChartSize(0)).toEqual({
      width: 0,
      height: 0,
    });
  });
  test('object', () => {
    expect(getChartSize({ width: 100, height: 100 })).toEqual({
      width: 100,
      height: 100,
    });
    expect(getChartSize({ height: 100 })).toEqual({
      width: '100%',
      height: 100,
    });
    expect(getChartSize({ width: 100 })).toEqual({
      width: 100,
      height: '100%',
    });
    expect(getChartSize({})).toEqual({
      width: '100%',
      height: '100%',
    });
    expect(getChartSize({ width: 0, height: '100em' })).toEqual({
      width: 0,
      height: '100em',
    });
  });
});
