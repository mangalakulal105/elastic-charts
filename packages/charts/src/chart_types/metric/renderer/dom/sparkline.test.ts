/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSafeTrendData } from './sparkline';
import { MetricWTrend } from '../../specs';

const sampleData = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 3 },
];

const sampleDataWithNull = [
  { x: 0, y: 1 },
  { x: 1, y: null },
  { x: 2, y: 3 },
];
describe('getSafeTrendData', () => {
  it('should avoid to process the data if already sorted', () => {
    expect(getSafeTrendData(sampleData)).toEqual(sampleData);
  });

  it('should sort the data if is not sorted correctly', () => {
    expect(getSafeTrendData(sampleData.slice().reverse())).toEqual(sampleData);
  });

  it('should rework the data if multiple series are appended one next to another', () => {
    expect(getSafeTrendData([...sampleData, ...sampleData])).toEqual(sampleData.map(({ x, y }) => ({ x, y: y * 2 })));
  });

  it('should handle null values correctly', () => {
    expect(getSafeTrendData([...sampleDataWithNull] as MetricWTrend['trend'])).toEqual(sampleDataWithNull);
  });

  it('should handle null values correctly when multiple series are appended one next to another', () => {
    expect(getSafeTrendData([...sampleDataWithNull, ...sampleDataWithNull] as MetricWTrend['trend'])).toEqual(
      // eslint-disable-next-line eqeqeq
      sampleDataWithNull.map(({ x, y }) => ({ x, y: y == null ? 0 : y * 2 })),
    );
  });
});
