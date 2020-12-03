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
import { SeriesIdentifier } from '../commons/series_id';
import { SettingsSpec, SortSeriesByConfig } from '../specs/settings';

/**
 * A compare function used to determine the order of the elements. It is expected to return
 * a negative value if first argument is less than second argument, zero if they're equal and a positive
 * value otherwise.
 * @public
 */
export type SeriesCompareFn = (siA: SeriesIdentifier, siB: SeriesIdentifier) => number;

/** @internal */
export const DEFAULT_SORTING_FN = () => {
  return 0;
};

export function getRenderingCompareFn(settings: SettingsSpec): SeriesCompareFn {
  return getCompareFn(settings, 'tooltip');
}

export function getLegendCompareFn(settings: SettingsSpec): SeriesCompareFn {
  return getCompareFn(settings, 'tooltip');
}

export function getTooltipCompareFn(settings: SettingsSpec): SeriesCompareFn {
  return getCompareFn(settings, 'tooltip');
}

function getCompareFn({ sortSeriesBy }: SettingsSpec, aspect: keyof SortSeriesByConfig): SeriesCompareFn {
  if (typeof sortSeriesBy === 'object') {
    return sortSeriesBy[aspect] ?? sortSeriesBy.general ?? DEFAULT_SORTING_FN;
  }
  return sortSeriesBy ?? DEFAULT_SORTING_FN;
}
