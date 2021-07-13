/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SeriesDomainsAndData } from '../utils/types';
import { computeSeriesDomains } from '../utils/utils';
import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getSeriesSpecsSelector, getSmallMultiplesIndexOrderSelector } from './get_specs';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const computeSeriesDomainsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getDeselectedSeriesSelector,
    getSettingsSpecSelector,
    getSmallMultiplesIndexOrderSelector,
    getScaleConfigsFromSpecsSelector,
  ],
  (seriesSpecs, deselectedDataSeries, settingsSpec, smallMultiples, scaleConfigs): SeriesDomainsAndData => {
    return computeSeriesDomains(
      seriesSpecs,
      scaleConfigs,
      deselectedDataSeries,
      settingsSpec.orderOrdinalBinsBy,
      smallMultiples,
      // @ts-ignore
      settingsSpec.sortSeriesBy,
    );
  },
);
