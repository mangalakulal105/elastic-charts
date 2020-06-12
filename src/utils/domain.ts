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

import { extent } from 'd3-array';

import { YDomainRange } from '../specs';
import { AccessorFn } from './accessor';

export type Domain = any[];

/** @internal */
export function computeOrdinalDataDomain(
  data: any[],
  accessor: AccessorFn,
  sorted?: boolean,
  removeNull?: boolean,
): string[] | number[] {
  // TODO: Check for empty data before computing domain
  if (data.length === 0) {
    return [0];
  }

  const domain = data.map(accessor).filter((d) => (removeNull ? d !== null : true));
  const uniqueValues = [...new Set(domain)];
  return sorted
    ? uniqueValues.sort((a, b) => `${a}`.localeCompare(`${b}`))
    : uniqueValues;
}

function getPaddedRange(start: number, end: number, domainOptions?: YDomainRange,): [number, number] {
  if (!domainOptions?.padding) {
    return [start, end];
  }

  let computedPadding = 0;

  if (typeof domainOptions.padding === 'string') {
    const padding = domainOptions.padding.trim();

    if (/\d+%$/.test(padding.trim())) {
      const paddingPercent = Number.parseInt(padding.trim().slice(0, -1), 10);
      const delta = Math.abs(end - start);
      computedPadding = delta * (paddingPercent / 100);
    }
    const num = Number.parseInt(padding, 10);

    computedPadding = num && !isNaN(num) ? num : 0;
  } else {
    computedPadding = domainOptions.padding;
  }

  if (computedPadding === 0) {
    return [start, end];
  }

  const newStart = start - computedPadding;
  const newEnd = end + computedPadding;

  if (domainOptions.constrainPadding ?? true) {
    return [
      start >= 0 && newStart < 0 ? 0 : newStart,
      end <= 0 && newEnd > 0 ? 0 : newEnd,
    ];
  }

  return [newStart, newEnd];
}

/** @internal */
export function computeDomainExtent(
  [start, end]: [number, number] | [undefined, undefined],
  domainOptions?: YDomainRange,
): [number, number] {
  if (start != null && end != null) {
    const [paddedStart, paddedEnd] = getPaddedRange(start, end, domainOptions);

    if (paddedStart >= 0 && paddedEnd >= 0) {
      return domainOptions?.fit ? [paddedStart, paddedEnd] : [0, paddedEnd];
    }
    if (paddedStart < 0 && paddedEnd < 0) {
      return domainOptions?.fit ? [paddedStart, paddedEnd] : [paddedStart, 0];
    }

    return [paddedStart, paddedEnd];
  }

  // if either start or end are null
  return [0, 0];
}

/** @internal */
export function computeContinuousDataDomain(
  data: any[],
  accessor: (n: any) => number,
  domainOptions?: YDomainRange,
): number[] {
  const range = extent<any, number>(data, accessor);

  return computeDomainExtent(range, domainOptions);
}
