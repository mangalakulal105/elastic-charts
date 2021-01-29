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
import React from 'react';

import { Spec } from '.';
import { ChartTypes } from '../chart_types';
import { Predicate } from '../chart_types/heatmap/utils/common';
import { getConnect, specComponentFactory } from '../state/spec_factory';
import { SpecTypes } from './constants';

/** @alpha */
export type GroupByAccessor = (spec: Spec, datum: any) => string | number;
/** @alpha */
export type GroupBySort = Predicate;

/** @public */
export type Formatter = (value: ReturnType<GroupByAccessor>) => string;

/** @alpha */
export interface GroupBySpec extends Spec {
  /**
   * Function to return a unique value __by__ which to group the data
   */
  by: GroupByAccessor;
  /**
   * Sort predicate used to sort grouped data
   */
  sort: GroupBySort;
  /**
   * Title for each panel. Use to display unique title for panel.
   *
   * If both axis title and this value are set, the axis title will be
   * treated as the primary title and this as the secondary.
   */
  title?: Formatter;
}
const DEFAULT_GROUP_BY_PROPS = {
  chartType: ChartTypes.Global,
  specType: SpecTypes.IndexOrder,
};

type DefaultGroupByProps = 'chartType' | 'specType';

/** @alpha */
export type GroupByProps = Pick<GroupBySpec, 'id' | 'by' | 'sort' | 'title'>;

/** @alpha */
export const GroupBy: React.FunctionComponent<GroupByProps> = getConnect()(
  specComponentFactory<GroupBySpec, DefaultGroupByProps>(DEFAULT_GROUP_BY_PROPS),
);
