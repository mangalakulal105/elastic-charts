/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { TooltipInfo } from '../../components/tooltip/types';
import { getTooltipType, SpecType, TooltipType } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import { createCustomCachedSelector } from '../../state/create_selector';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../state/utils';
import { FlameSpec } from './flame_api';

/** @internal */
export const getFlameSpec = (state: GlobalChartState): FlameSpec | void =>
  getSpecsFromStore<FlameSpec>(state.specs, ChartType.Flame, SpecType.Series)[0];

/** @internal */
export const getPickedShape = ({ interactions }: GlobalChartState) => interactions.hoveredGeomIndex;

/** @internal */
export const getPointerCursor = createCustomCachedSelector(
  [getPickedShape, getSettingsSpecSelector],
  (pickedShape, { onElementClick, onElementOver }) =>
    Number.isFinite(pickedShape) && (onElementClick || onElementOver) ? 'pointer' : DEFAULT_CSS_CURSOR,
);

/** @internal */
export const getTooltipInfo = createCustomCachedSelector(
  [getFlameSpec, getPickedShape],
  (spec, datumIndex): TooltipInfo => ({
    header: null,
    values:
      spec && Number.isFinite(datumIndex)
        ? [
            {
              label: spec.columnarData.label[datumIndex],
              color: `rgba(${Math.round(255 * spec.columnarData.color[4 * datumIndex])}, ${Math.round(
                255 * spec.columnarData.color[4 * datumIndex + 1],
              )}, ${Math.round(255 * spec.columnarData.color[4 * datumIndex + 2])}, ${
                spec.columnarData.color[4 * datumIndex + 3]
              })`,
              isHighlighted: false,
              isVisible: true,
              seriesIdentifier: { specId: spec.id, key: spec.id },
              value: spec.columnarData.value[datumIndex],
              formattedValue: `${spec.valueFormatter(spec.columnarData.value[datumIndex])}`,
              valueAccessor: datumIndex,
            },
          ]
        : [],
  }),
);

/** @internal */
export const shouldDisplayTooltip = createCustomCachedSelector(
  [getFlameSpec, getSettingsSpecSelector],
  (spec, settingsSpec): boolean => Boolean(spec) && getTooltipType(settingsSpec) !== TooltipType.None,
);

/** @internal */
export const getTooltipAnchor = ({ interactions: { pointer } }: GlobalChartState) => {
  return { x: pointer.current.position.x, y: pointer.current.position.y, width: 0, height: 0, isRotated: false };
};
