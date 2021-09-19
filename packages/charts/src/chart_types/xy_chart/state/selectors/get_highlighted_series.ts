/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../../common/legend';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeLegendSelector } from './compute_legend';

const getHighlightedLegendPath = (state: GlobalChartState) => state.interactions.highlightedLegendPath;

/** @internal */
export const getHighlightedSeriesSelector = createCustomCachedSelector(
  [getHighlightedLegendPath, computeLegendSelector],
  (highlightedLegendPaths, legendItems): LegendItem | undefined =>
    // it got simplified but todo its algorithmic complexity is still O(L * M * N)
    highlightedLegendPaths.length > 0
      ? legendItems.find(({ seriesIdentifiers }) =>
          seriesIdentifiers.some(({ key }) => highlightedLegendPaths.some(({ value }) => value === key)),
        )
      : undefined,
);
