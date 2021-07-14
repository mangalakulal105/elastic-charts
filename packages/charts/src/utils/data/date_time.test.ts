/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';

import { snapDateToInterval } from './date_time';

describe('snap to interval', () => {
  it('should snap to begin of calendar interval', () => {
    const initialDate = DateTime.fromISO('2020-01-03T07:00:01Z');
    const snappedDate = snapDateToInterval(initialDate.toMillis(), 'calendar', '1d', 'start', 'UTC');
    expect(DateTime.fromMillis(snappedDate, { zone: 'utc' }).toISO()).toBe('2020-01-03T00:00:00.000Z');
  });

  it('should snap to end of calendar interval', () => {
    const initialDate = DateTime.fromISO('2020-01-03T07:00:01Z');
    const snappedDate = snapDateToInterval(initialDate.toMillis(), 'calendar', '1d', 'end', 'UTC');
    expect(DateTime.fromMillis(snappedDate, { zone: 'utc' }).toISO()).toBe('2020-01-03T23:59:59.999Z');
  });

  it('should snap to begin of fixed interval', () => {
    const initialDate = DateTime.fromISO('2020-01-03T07:00:01Z');
    const snappedDate = snapDateToInterval(initialDate.toMillis(), 'fixed', '30m', 'start', 'UTC');
    expect(DateTime.fromMillis(snappedDate, { zone: 'utc' }).toISO()).toBe('2020-01-03T07:00:00.000Z');
  });

  it('should snap to end of fixed interval', () => {
    const initialDate = DateTime.fromISO('2020-01-03T07:00:01Z');
    const snappedDate = snapDateToInterval(initialDate.toMillis(), 'fixed', '30m', 'end', 'UTC');
    expect(DateTime.fromMillis(snappedDate, { zone: 'utc' }).toISO()).toBe('2020-01-03T07:29:59.999Z');
  });
});
