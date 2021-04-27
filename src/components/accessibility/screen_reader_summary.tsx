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

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { getSeriesTypes } from '../../chart_types/xy_chart/state/selectors/get_series_types';
import { SeriesType } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { Description } from './description';
import { Label } from './label';
import { Types } from './types';

interface ScreenReaderSummaryProps {
  seriesTypes: Set<SeriesType | string>;
  a11ySettings: A11ySettings;
}

const ScreenReaderSummaryComponent = ({ seriesTypes, a11ySettings }: ScreenReaderSummaryProps) => {
  const chartSeriesTypes =
    seriesTypes.size > 1 ? `Mixed chart: ${[...seriesTypes].join(' and ')} chart` : `${[...seriesTypes]} chart`;
  return (
    <div className="echScreenReaderOnly">
      <Label {...a11ySettings} />
      <Description {...a11ySettings} />
      <Types {...a11ySettings} chartSeriesTypes={chartSeriesTypes} />
    </div>
  );
};

const mapStateToProps = (state: GlobalChartState) => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_A11Y_SETTINGS;
  }
  return {
    seriesTypes: getSeriesTypes(state),
    a11ySettings: getA11ySettingsSelector(state),
  };
};
/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
