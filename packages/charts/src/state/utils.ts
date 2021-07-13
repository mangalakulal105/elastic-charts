/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../chart_types';
import { Spec } from '../specs';
import { SpecList, PointerState } from './chart_state';

/** @internal */
export function getSpecsFromStore<U extends Spec>(specs: SpecList, chartType: ChartType, specType?: string): U[] {
  return Object.keys(specs)
    .filter((specId) => {
      const currentSpec = specs[specId];
      const sameChartType = currentSpec.chartType === chartType;
      const sameSpecType = specType ? currentSpec.specType === specType : true;
      return sameChartType && sameSpecType;
    })
    .map((specId) => specs[specId] as U);
}

/** @internal */
export function isClicking(prevClick: PointerState | null, lastClick: PointerState | null) {
  if (prevClick === null && lastClick !== null) {
    return true;
  }
  return prevClick !== null && lastClick !== null && prevClick.time !== lastClick.time;
}

/** @internal */
export const getInitialPointerState = () => ({
  dragging: false,
  current: {
    position: {
      x: -1,
      y: -1,
    },
    time: 0,
  },
  down: null,
  up: null,
  lastDrag: null,
  lastClick: null,
});
