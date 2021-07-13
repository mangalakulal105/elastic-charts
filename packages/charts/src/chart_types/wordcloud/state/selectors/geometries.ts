/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecsFromStore } from '../../../../state/utils';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { WordcloudSpec } from '../../specs';
import { render } from './scenegraph';

const getSpecs = (state: GlobalChartState) => state.specs;

const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export const geometries = createCustomCachedSelector(
  [getSpecs, getParentDimensions],
  (specs, parentDimensions): ShapeViewModel => {
    const wordcloudSpecs = getSpecsFromStore<WordcloudSpec>(specs, ChartType.Wordcloud, SpecType.Series);
    return wordcloudSpecs.length === 1 ? render(wordcloudSpecs[0], parentDimensions) : nullShapeViewModel();
  },
);
