/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import {
  PointerEvent,
  PointerEventType,
  PointerOverEvent,
  PointerUpdateTrigger,
  SettingsSpec,
} from '../../../../specs';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSpecOrNull } from './heatmap_spec';
import { getCurrentPointerPosition, getXValue } from './picked_shapes';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';

function isSameEventValue(a: PointerOverEvent, b: PointerOverEvent, changeTrigger: PointerUpdateTrigger) {
  const checkX = changeTrigger === PointerUpdateTrigger.X || changeTrigger === PointerUpdateTrigger.Both;
  const checkY = changeTrigger === PointerUpdateTrigger.Y || changeTrigger === PointerUpdateTrigger.Both;
  return (
    (!checkX || (a.x === b.x && a.scale === b.scale && a.unit === b.unit)) &&
    (!checkY || a.y.every((y, i) => y.value === b.y[i]?.value))
  );
}

const hasPointerEventChanged = (prev: PointerEvent, next: PointerEvent | null, changeTrigger: PointerUpdateTrigger) =>
  next?.type !== prev.type ||
  (prev.type === PointerEventType.Over &&
    next?.type === PointerEventType.Over &&
    !isSameEventValue(prev, next, changeTrigger));


/**
 * Will call the onPointerUpdate listener every time the following preconditions are met:
 * - the onPointerUpdate listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnPointerUpdateCaller(): (state: GlobalChartState) => void {
  let prevPointerEvent: PointerEvent | null = null;

  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.Heatmap) {
      selector = createCustomCachedSelector(
        [getSpecOrNull, getLastClickSelector, getSettingsSpecSelector, getCurrentPointerPosition, getXValue, getChartIdSelector],
        (spec, lastClick: PointerState | null, settings: SettingsSpec, currentPointer, invertedValues, chartId): void => {
          if (!spec) {
            return;
          }

          if (prevPointerEvent === null) {
            prevPointerEvent = { chartId, type: PointerEventType.Out };
          }
          const tempPrev = { ...prevPointerEvent };
          const nextPointerEvent = {
              chartId: state.chartId,
              type:currentPointer.x === - 1 && currentPointer.y === -1 ?  PointerEventType.Out : PointerEventType.Over,
              scale: "time",
              x: invertedValues.xValue,
              y: [{value: invertedValues.yValue ?? null}],
              smHorizontalValue: null,
              smVerticalValue: null,
            } as PointerOverEvent
          // we have to update the prevPointerEvents before possibly calling the onPointerUpdate
          // to avoid a recursive loop of calls caused by the impossibility to update the prevPointerEvent
          prevPointerEvent = nextPointerEvent;

          if (settings.onPointerUpdate && hasPointerEventChanged(tempPrev, nextPointerEvent, settings.pointerUpdateTrigger)){
            console.log("onPointerUpdate", nextPointerEvent)
            settings.onPointerUpdate(nextPointerEvent);
        }


        }

      );
    }
    if (selector) {
      selector(state);
    }
  };
}
