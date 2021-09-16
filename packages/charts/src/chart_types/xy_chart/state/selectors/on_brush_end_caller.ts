/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'reselect';

import { ChartType } from '../../..';
import { Scale } from '../../../../scales';
import { GroupBrushExtent, XYBrushEvent } from '../../../../specs';
import { BrushAxis } from '../../../../specs/constants';
import { DragState, GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { clamp, Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { hasDragged, DragCheckProps } from '../../../../utils/events';
import { GroupId } from '../../../../utils/ids';
import { isVerticalRotation } from '../utils/common';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { computeSmallMultipleScalesSelector, SmallMultipleScales } from './compute_small_multiple_scales';
import { getPlotAreaRestrictedPoint, getPointsConstraintToSinglePanel, PanelPoints } from './get_brush_area';
import { getComputedScalesSelector } from './get_computed_scales';
import { isBrushAvailableSelector } from './is_brush_available';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';

const getLastDragSelector = (state: GlobalChartState) => state.interactions.pointer.lastDrag;

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 * @internal
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let prevProps: DragCheckProps | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      if (!isBrushAvailableSelector(state)) {
        selector = null;
        prevProps = null;
        return;
      }
      selector = createCustomCachedSelector(
        [
          getLastDragSelector,
          getSettingsSpecSelector,
          getComputedScalesSelector,
          computeChartDimensionsSelector,
          isHistogramModeEnabledSelector,
          computeSmallMultipleScalesSelector,
        ],
        (
          lastDrag,
          {
            onBrushEnd,
            rotation,
            brushAxis,
            minBrushDelta,
            roundHistogramBrushValues,
            allowBrushingLastHistogramBucket,
          },
          computedScales,
          { chartDimensions },
          histogramMode,
          smallMultipleScales,
        ): void => {
          const nextProps = {
            lastDrag,
            onBrushEnd,
          };
          if (lastDrag !== null && hasDragged(prevProps, nextProps) && onBrushEnd) {
            const brushAreaEvent: XYBrushEvent = {};
            const { yScales, xScale } = computedScales;

            if (brushAxis === BrushAxis.X || brushAxis === BrushAxis.Both) {
              brushAreaEvent.x = getXBrushExtent(
                chartDimensions,
                lastDrag,
                rotation,
                histogramMode,
                xScale as Scale<number>,
                smallMultipleScales,
                minBrushDelta,
                roundHistogramBrushValues,
                allowBrushingLastHistogramBucket,
              );
            }
            if (brushAxis === BrushAxis.Y || brushAxis === BrushAxis.Both) {
              brushAreaEvent.y = getYBrushExtents(
                chartDimensions,
                lastDrag,
                rotation,
                yScales,
                smallMultipleScales,
                minBrushDelta,
              );
            }
            if (brushAreaEvent.x !== undefined || brushAreaEvent.y !== undefined) {
              onBrushEnd(brushAreaEvent);
            }
          }
          prevProps = nextProps;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}

function scalePanelPointsToPanelCoordinates(
  scaleXPoint: boolean,
  { start, end, vPanelStart, hPanelStart, vPanelHeight, hPanelWidth }: PanelPoints,
) {
  // scale screen coordinates down to panel scale
  const startPos = scaleXPoint ? start.x - hPanelStart : start.y - vPanelStart;
  const endPos = scaleXPoint ? end.x - hPanelStart : end.y - vPanelStart;
  const panelMax = scaleXPoint ? hPanelWidth : vPanelHeight;
  return {
    minPos: Math.min(startPos, endPos),
    maxPos: Math.max(startPos, endPos),
    panelMax,
  };
}

function getXBrushExtent(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  rotation: Rotation,
  histogramMode: boolean,
  xScale: Scale<number>,
  smallMultipleScales: SmallMultipleScales,
  minBrushDelta?: number,
  roundHistogramBrushValues?: boolean,
  allowBrushingLastHistogramBucket?: boolean,
): [number, number] | undefined {
  const isXHorizontal = !isVerticalRotation(rotation);
  // scale screen coordinates down to panel scale
  const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXHorizontal);
  let { minPos, maxPos } = scaledPanelPoints;
  // reverse the positions if chart is mirrored
  if (rotation === -90 || rotation === 180) {
    minPos = scaledPanelPoints.panelMax - minPos;
    maxPos = scaledPanelPoints.panelMax - maxPos;
  }
  if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
    // if 0 size brush, avoid computing the value
    return;
  }

  const offset = histogramMode ? 0 : -(xScale.bandwidth + xScale.bandwidthPadding) / 2;
  const invertValue = roundHistogramBrushValues
    ? (value: number) => xScale.invertWithStep(value, xScale.domain)?.value
    : (value: number) => xScale.invert(value);
  const minPosScaled = invertValue(minPos + offset);
  const maxPosScaled = invertValue(maxPos + offset);

  const maxDomainValue = xScale.domain[1] + (allowBrushingLastHistogramBucket ? xScale.minInterval : 0);

  const minValue = clamp(minPosScaled, xScale.domain[0], maxPosScaled);
  const maxValue = clamp(minPosScaled, maxPosScaled, maxDomainValue);

  return [minValue, maxValue];
}

function getMinMaxPos(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  smallMultipleScales: SmallMultipleScales,
  scaleXPoint: boolean,
) {
  const panelPoints = getPanelPoints(chartDimensions, lastDrag, smallMultipleScales);
  // scale screen coordinates down to panel scale
  return scalePanelPointsToPanelCoordinates(scaleXPoint, panelPoints);
}

function getPanelPoints(chartDimensions: Dimensions, lastDrag: DragState, smallMultipleScales: SmallMultipleScales) {
  const plotStartPointPx = getPlotAreaRestrictedPoint(lastDrag.start.position, chartDimensions);
  const plotEndPointPx = getPlotAreaRestrictedPoint(lastDrag.end.position, chartDimensions);
  return getPointsConstraintToSinglePanel(plotStartPointPx, plotEndPointPx, smallMultipleScales);
}

function getYBrushExtents(
  chartDimensions: Dimensions,
  lastDrag: DragState,
  rotation: Rotation,
  yScales: Map<GroupId, Scale<number | string>>,
  smallMultipleScales: SmallMultipleScales,
  minBrushDelta?: number,
): GroupBrushExtent[] | undefined {
  const yValues: GroupBrushExtent[] = [];
  yScales.forEach((yScale, groupId) => {
    const isXVertical = isVerticalRotation(rotation);
    // scale screen coordinates down to panel scale
    const scaledPanelPoints = getMinMaxPos(chartDimensions, lastDrag, smallMultipleScales, isXVertical);
    let { minPos, maxPos } = scaledPanelPoints;

    if (rotation === 90 || rotation === 180) {
      minPos = scaledPanelPoints.panelMax - minPos;
      maxPos = scaledPanelPoints.panelMax - maxPos;
    }
    if (minBrushDelta !== undefined ? Math.abs(maxPos - minPos) < minBrushDelta : maxPos === minPos) {
      // if 0 size brush, avoid computing the value
      return;
    }

    const minPosScaled = yScale.invert(minPos);
    const maxPosScaled = yScale.invert(maxPos);
    const minValue = clamp(minPosScaled, (yScale as Scale<number>).domain[0], maxPosScaled);
    const maxValue = clamp(minPosScaled, maxPosScaled, (yScale as Scale<number>).domain[1]);
    yValues.push({ extent: [minValue, maxValue], groupId });
  });
  return yValues.length === 0 ? undefined : yValues;
}
