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

import { Color } from '../utils/commons';
import { SeriesIdentifier } from './series_id';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
/** @internal */
export type LegendItemChildId = string;

/** @internal */
export type LegendItem = {
  seriesIdentifier: SeriesIdentifier;
  childId?: LegendItemChildId;
  childs?: LegendItem[];
  depth?: number;
  color: Color;
  label: string;
  isSeriesVisible?: boolean;
  isItemHidden?: boolean;
  defaultExtra?: {
    raw: number | null;
    formatted: number | string | null;
  };
};

/** @internal */
export type LegendItemExtraValues = Map<LegendItemChildId, PrimitiveValue>;
