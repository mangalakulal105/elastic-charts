/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Line } from '../../../geoms/types';
import { Scale } from '../../../scales';
import { BBox, TextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import {
  degToRad,
  getPercentageValue,
  getUniqueValues,
  HorizontalAlignment,
  Position,
  Rotation,
  VerticalAlignment,
} from '../../../utils/common';
import { Dimensions, innerPad, Margins, outerPad, Size } from '../../../utils/dimensions';
import { Range } from '../../../utils/domain';
import { AxisId } from '../../../utils/ids';
import { Logger } from '../../../utils/logger';
import { Point } from '../../../utils/point';
import { AxisStyle, TextAlignment, TextOffset, Theme } from '../../../utils/themes/theme';
import { XDomain, YDomain } from '../domains/types';
import { MIN_STROKE_WIDTH } from '../renderer/canvas/primitives/line';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';
import { getSpecsById } from '../state/utils/spec';
import { isHorizontalAxis, isVerticalAxis } from './axis_type_utils';
import { getPanelSize, hasSMDomain } from './panel';
import { computeXScale, computeYScales } from './scales';
import { AxisSpec, TickFormatter, TickFormatterOptions } from './specs';

type TickValue = number | string;

/** @internal */
export interface AxisTick {
  value: TickValue;
  label: string;
  axisTickLabel: string;
  position: number;
}

/** @internal */
export interface AxisViewModel {
  maxLabelBboxWidth: number;
  maxLabelBboxHeight: number;
  maxLabelTextWidth: number;
  maxLabelTextHeight: number;
  isHidden: boolean;
}

/** @internal */
export interface TickLabelProps {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  textOffsetX: number;
  textOffsetY: number;
  horizontalAlign: Extract<
    HorizontalAlignment,
    typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Center | typeof HorizontalAlignment.Right
  >;
  verticalAlign: Extract<
    VerticalAlignment,
    typeof VerticalAlignment.Top | typeof VerticalAlignment.Middle | typeof VerticalAlignment.Bottom
  >;
}

/** @internal */
export const defaultTickFormatter = (tick: unknown) => `${tick}`;

/**
 * Compute the ticks values and identify max width and height of the labels
 * so we can compute the max space occupied by the axis component.
 * @internal
 */
export function axisViewModel(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomains: YDomain[],
  totalBarsInCluster: number,
  textMeasure: TextMeasure,
  chartRotation: Rotation,
  { gridLine, tickLabel }: AxisStyle,
  fallBackTickFormatter: TickFormatter,
  barsPadding?: number,
  enableHistogramMode?: boolean,
): AxisViewModel | null {
  const gridLineVisible = isVerticalAxis(axisSpec.position) ? gridLine.vertical.visible : gridLine.horizontal.visible;

  // don't compute anything on this axis if grid is hidden and axis is hidden
  if (axisSpec.hide && !gridLineVisible) {
    return null;
  }

  const scale = getScaleForAxisSpec(
    axisSpec,
    xDomain,
    yDomains,
    totalBarsInCluster,
    chartRotation,
    [0, 1],
    barsPadding,
    enableHistogramMode,
  );

  if (!scale) {
    Logger.warn(`Cannot compute scale for axis spec ${axisSpec.id}. Axis will not be displayed.`);
    return null;
  }

  const tickFormat = axisSpec.labelFormat ?? axisSpec.tickFormat ?? fallBackTickFormatter;
  const tickFormatOptions = { timeZone: xDomain.timeZone };
  const tickLabels = scale.ticks().map((d) => tickFormat(d, tickFormatOptions));

  const maxLabelSizes = (tickLabel.visible ? tickLabels : []).reduce(
    (sizes, labelText) => {
      const bbox = textMeasure(labelText, 0, tickLabel.fontSize, tickLabel.fontFamily);
      const rotatedBbox = computeRotatedLabelDimensions(bbox, tickLabel.rotation);
      sizes.maxLabelBboxWidth = Math.max(sizes.maxLabelBboxWidth, Math.ceil(rotatedBbox.width));
      sizes.maxLabelBboxHeight = Math.max(sizes.maxLabelBboxHeight, Math.ceil(rotatedBbox.height));
      sizes.maxLabelTextWidth = Math.max(sizes.maxLabelTextWidth, Math.ceil(bbox.width));
      sizes.maxLabelTextHeight = Math.max(sizes.maxLabelTextHeight, Math.ceil(bbox.height));
      return sizes;
    },
    { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 },
  );

  return { ...maxLabelSizes, isHidden: axisSpec.hide && gridLineVisible };
}

/** @internal */
export function isYDomain(position: Position, chartRotation: Rotation): boolean {
  return isVerticalAxis(position) === (chartRotation % 180 === 0);
}

/** @internal */
export function getScaleForAxisSpec(
  { groupId, integersOnly, position }: AxisSpec,
  xDomain: XDomain,
  yDomains: YDomain[],
  totalBarsInCluster: number,
  chartRotation: Rotation,
  range: Range,
  barsPadding?: number,
  enableHistogramMode?: boolean,
): Scale | null {
  return isYDomain(position, chartRotation)
    ? computeYScales({ yDomains, range, integersOnly }).get(groupId) ?? null
    : computeXScale({ xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, integersOnly });
}

/** @internal */
export function computeRotatedLabelDimensions(unrotatedDims: BBox, degreesRotation: number): BBox {
  const { width, height } = unrotatedDims;
  const radians = degToRad(degreesRotation);
  const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));

  return {
    width: rotatedWidth,
    height: rotatedHeight,
  };
}

function getUserTextOffsets(dimensions: AxisViewModel, offset: TextOffset) {
  const defaults = {
    x: 0,
    y: 0,
  };

  if (offset.reference === 'global') {
    return {
      local: defaults,
      global: {
        x: getPercentageValue(offset.x, dimensions.maxLabelBboxWidth, 0),
        y: getPercentageValue(offset.y, dimensions.maxLabelBboxHeight, 0),
      },
    };
  }

  return {
    global: defaults,
    local: {
      x: getPercentageValue(offset.x, dimensions.maxLabelTextWidth, 0),
      y: getPercentageValue(offset.y, dimensions.maxLabelTextHeight, 0),
    },
  };
}

function getHorizontalTextOffset(
  width: number,
  alignment: Extract<
    HorizontalAlignment,
    typeof HorizontalAlignment.Left | typeof HorizontalAlignment.Center | typeof HorizontalAlignment.Right
  >,
): number {
  switch (alignment) {
    case HorizontalAlignment.Left:
      return -width / 2;
    case HorizontalAlignment.Right:
      return width / 2;
    case HorizontalAlignment.Center:
    default:
      return 0;
  }
}

function getVerticalTextOffset(
  height: number,
  alignment: Extract<
    VerticalAlignment,
    typeof VerticalAlignment.Top | typeof VerticalAlignment.Middle | typeof VerticalAlignment.Bottom
  >,
): number {
  switch (alignment) {
    case VerticalAlignment.Top:
      return -height / 2;
    case VerticalAlignment.Bottom:
      return height / 2;
    case VerticalAlignment.Middle:
    default:
      return 0;
  }
}

function getHorizontalAlign(
  position: Position,
  rotation: number,
  alignment: HorizontalAlignment = HorizontalAlignment.Near,
): Exclude<HorizontalAlignment, typeof HorizontalAlignment.Far | typeof HorizontalAlignment.Near> {
  if (
    alignment === HorizontalAlignment.Center ||
    alignment === HorizontalAlignment.Right ||
    alignment === HorizontalAlignment.Left
  ) {
    return alignment;
  }

  if ([-90, 90].includes(rotation)) {
    if (position === Position.Left || position === Position.Right) {
      return HorizontalAlignment.Center;
    }

    if (position === Position.Top) {
      return rotation === 90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
    }

    return rotation === -90 ? HorizontalAlignment.Right : HorizontalAlignment.Left;
  }

  if ([0, 180].includes(rotation) && (position === Position.Bottom || position === Position.Top)) {
    return HorizontalAlignment.Center;
  }

  if (position === Position.Left) {
    return alignment === HorizontalAlignment.Near ? HorizontalAlignment.Right : HorizontalAlignment.Left;
  }

  if (position === Position.Right) {
    return alignment === HorizontalAlignment.Near ? HorizontalAlignment.Left : HorizontalAlignment.Right;
  }

  // fallback for near/far on top/bottom axis
  return HorizontalAlignment.Center;
}

function getVerticalAlign(
  position: Position,
  rotation: number,
  alignment: VerticalAlignment = VerticalAlignment.Middle,
): Exclude<VerticalAlignment, typeof VerticalAlignment.Far | typeof VerticalAlignment.Near> {
  if (
    alignment === VerticalAlignment.Middle ||
    alignment === VerticalAlignment.Top ||
    alignment === VerticalAlignment.Bottom
  ) {
    return alignment;
  }

  if ([0, 180].includes(rotation)) {
    if (position === Position.Bottom || position === Position.Top) {
      return VerticalAlignment.Middle;
    }

    if (position === Position.Left) {
      return rotation === 0 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
    }

    return rotation === 180 ? VerticalAlignment.Bottom : VerticalAlignment.Top;
  }

  if (position === Position.Top) {
    return alignment === VerticalAlignment.Near ? VerticalAlignment.Bottom : VerticalAlignment.Top;
  }

  if (position === Position.Bottom) {
    return alignment === VerticalAlignment.Near ? VerticalAlignment.Top : VerticalAlignment.Bottom;
  }

  // fallback for near/far on left/right axis
  return VerticalAlignment.Middle;
}

/**
 * Gets the computed x/y coordinates & alignment properties for an axis tick label.
 * @internal
 */
export function getTickLabelProps(
  { tickLine, tickLabel }: AxisStyle,
  tickPosition: number,
  position: Position,
  rotation: number,
  axisSize: Size,
  tickDimensions: AxisViewModel,
  showTicks: boolean,
  textOffset: TextOffset,
  textAlignment?: TextAlignment,
): TickLabelProps {
  const { maxLabelBboxWidth, maxLabelTextWidth, maxLabelBboxHeight, maxLabelTextHeight } = tickDimensions;
  const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
  const labelInnerPadding = innerPad(tickLabel.padding);
  const isLeftAxis = position === Position.Left;
  const isAxisTop = position === Position.Top;
  const horizontalAlign = getHorizontalAlign(position, rotation, textAlignment?.horizontal);
  const verticalAlign = getVerticalAlign(position, rotation, textAlignment?.vertical);

  const userOffsets = getUserTextOffsets(tickDimensions, textOffset);
  // getHorizontalTextOffset needs to be used for vertical axis labels, and vertical labels of horizontal axes
  const textOffsetX =
    (isHorizontalAxis(position) && rotation === 0 ? 0 : getHorizontalTextOffset(maxLabelTextWidth, horizontalAlign)) +
    userOffsets.local.x;
  const textOffsetY = getVerticalTextOffset(maxLabelTextHeight, verticalAlign) + userOffsets.local.y;

  if (isVerticalAxis(position)) {
    const x = isLeftAxis ? axisSize.width - tickDimension - labelInnerPadding : tickDimension + labelInnerPadding;
    const offsetX = (isLeftAxis ? -1 : 1) * (maxLabelBboxWidth / 2);

    return {
      x,
      y: tickPosition,
      offsetX: offsetX + userOffsets.global.x,
      offsetY: userOffsets.global.y,
      textOffsetY,
      textOffsetX,
      horizontalAlign,
      verticalAlign,
    };
  }

  const offsetY = isAxisTop ? -maxLabelBboxHeight / 2 : maxLabelBboxHeight / 2;

  return {
    x: tickPosition,
    y: isAxisTop ? axisSize.height - tickDimension - labelInnerPadding : tickDimension + labelInnerPadding,
    offsetX: userOffsets.global.x,
    offsetY: offsetY + userOffsets.global.y,
    textOffsetX,
    textOffsetY,
    horizontalAlign,
    verticalAlign,
  };
}

/** @internal */
export function getVerticalAxisTickLineProps(
  position: Position,
  axisWidth: number,
  tickSize: number,
  tickPosition: number,
): Line {
  const isLeftAxis = position === Position.Left;
  const y = tickPosition;
  const x1 = isLeftAxis ? axisWidth : 0;
  const x2 = isLeftAxis ? axisWidth - tickSize : tickSize;

  return { x1, y1: y, x2, y2: y };
}

/** @internal */
export function getHorizontalAxisTickLineProps(
  position: Position,
  axisHeight: number,
  tickSize: number,
  tickPosition: number,
): Line {
  const isTopAxis = position === Position.Top;
  const x = tickPosition;
  const y1 = isTopAxis ? axisHeight - tickSize : 0;
  const y2 = isTopAxis ? axisHeight : tickSize;

  return { x1: x, y1, x2: x, y2 };
}

/** @internal */
export function getMinMaxRange(
  axisPosition: Position,
  chartRotation: Rotation,
  { width, height }: Size,
): {
  minRange: number;
  maxRange: number;
} {
  switch (axisPosition) {
    case Position.Bottom:
    case Position.Top:
      return getBottomTopAxisMinMaxRange(chartRotation, width);
    case Position.Left:
    case Position.Right:
    default:
      return getLeftAxisMinMaxRange(chartRotation, height);
  }
}

function getBottomTopAxisMinMaxRange(chartRotation: Rotation, width: number) {
  switch (chartRotation) {
    case 90:
      // dealing with y domain
      return { minRange: 0, maxRange: width };
    case -90:
      // dealing with y domain
      return { minRange: width, maxRange: 0 };
    case 180:
      // dealing with x domain
      return { minRange: width, maxRange: 0 };
    case 0:
    default:
      // dealing with x domain
      return { minRange: 0, maxRange: width };
  }
}

function getLeftAxisMinMaxRange(chartRotation: Rotation, height: number) {
  switch (chartRotation) {
    case 90:
      // dealing with x domain
      return { minRange: 0, maxRange: height };
    case -90:
      // dealing with x domain
      return { minRange: height, maxRange: 0 };
    case 180:
      // dealing with y domain
      return { minRange: 0, maxRange: height };
    case 0:
    default:
      // dealing with y domain
      return { minRange: height, maxRange: 0 };
  }
}

/** @internal */
export function getAvailableTicks(
  axisSpec: AxisSpec,
  scale: Scale,
  totalBarsInCluster: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  rotationOffset: number,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const ticks = scale.ticks();
  const isSingleValueScale = scale.domain[0] - scale.domain[1] === 0;
  const hasAdditionalTicks = enableHistogramMode && scale.bandwidth > 0;

  if (hasAdditionalTicks) {
    const lastComputedTick = ticks[ticks.length - 1];

    if (!isSingleValueScale) {
      const penultimateComputedTick = ticks[ticks.length - 2];
      const computedTickDistance = lastComputedTick - penultimateComputedTick;
      const numTicks = scale.minInterval / computedTickDistance;

      for (let i = 1; i <= numTicks; i++) {
        ticks.push(i * computedTickDistance + lastComputedTick);
      }
    }
  }
  const shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;

  const band = scale.bandwidth / (1 - scale.barsPadding);
  const halfPadding = (band - scale.bandwidth) / 2;
  const offset =
    (enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2) + (scale.isSingleValue() ? 0 : rotationOffset);
  const tickFormatter = axisSpec.tickFormat ?? fallBackTickFormatter;
  const labelFormatter = axisSpec.labelFormat ?? tickFormatter;

  if (isSingleValueScale && hasAdditionalTicks) {
    const [firstTickValue] = ticks;
    const firstLabel = tickFormatter(firstTickValue, tickFormatOptions);
    const firstTick = {
      value: firstTickValue,
      label: firstLabel,
      axisTickLabel: labelFormatter(firstTickValue, tickFormatOptions),
      position: (scale.scale(firstTickValue) ?? 0) + offset,
    };

    const lastTickValue = firstTickValue + scale.minInterval;
    const lastLabel = tickFormatter(lastTickValue, tickFormatOptions);
    const lastTick = {
      value: lastTickValue,
      label: lastLabel,
      axisTickLabel: labelFormatter(lastTickValue, tickFormatOptions),
      position: scale.bandwidth + halfPadding * 2,
    };

    return [firstTick, lastTick];
  }
  return enableDuplicatedTicks(axisSpec, scale, offset, fallBackTickFormatter, tickFormatOptions);
}

/** @internal */
export function enableDuplicatedTicks(
  axisSpec: AxisSpec,
  scale: Scale,
  offset: number,
  fallBackTickFormatter: TickFormatter,
  tickFormatOptions?: TickFormatterOptions,
): AxisTick[] {
  const allTicks: AxisTick[] = scale.ticks().map((tick) => ({
    value: tick,
    // TODO handle empty string tick formatting
    // Nick is this ^^^ now handled here? vvv Or you meant sg else?
    label: (axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    axisTickLabel: (axisSpec.labelFormat ?? axisSpec.tickFormat ?? fallBackTickFormatter)(tick, tickFormatOptions),
    position: (scale.scale(tick) ?? 0) + offset,
  }));
  return axisSpec.showDuplicatedTicks ? allTicks : getUniqueValues(allTicks, 'label', true);
}

/** @internal */
export function getVisibleTicks(allTicks: AxisTick[], axisSpec: AxisSpec, axisDim: AxisViewModel): AxisTick[] {
  const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
  const requiredSpace = isVerticalAxis(position) ? axisDim.maxLabelBboxHeight / 2 : axisDim.maxLabelBboxWidth / 2;
  return showOverlappingLabels
    ? allTicks
    : [...allTicks]
        .sort((a: AxisTick, b: AxisTick) => a.position - b.position)
        .reduce(
          (prev, tick) => {
            const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace;
            if (tickLabelFits || showOverlappingTicks) {
              prev.visibleTicks.push(tickLabelFits ? tick : { ...tick, axisTickLabel: '' });
              if (tickLabelFits) prev.occupiedSpace = tick.position + requiredSpace;
            }
            return prev;
          },
          { visibleTicks: [] as AxisTick[], occupiedSpace: -Infinity },
        ).visibleTicks;
}

/** @internal */
export function getTitleDimension({
  visible,
  fontSize,
  padding,
}: AxisStyle['axisTitle'] | AxisStyle['axisPanelTitle']): number {
  return visible && fontSize > 0 ? innerPad(padding) + fontSize + outerPad(padding) : 0;
}

/** @internal */
export function getAxisPosition(
  chartDimensions: Dimensions,
  chartMargins: Margins,
  axisTitle: AxisStyle['axisTitle'],
  axisPanelTitle: AxisStyle['axisPanelTitle'],
  axisSpec: AxisSpec,
  axisDim: AxisViewModel,
  smScales: SmallMultipleScales,
  cumTopSum: number,
  cumBottomSum: number,
  cumLeftSum: number,
  cumRightSum: number,
  tickDimension: number,
  labelPaddingSum: number,
  showLabels: boolean,
) {
  const titleDimension = axisSpec.title ? getTitleDimension(axisTitle) : 0;
  const { position } = axisSpec;
  const { maxLabelBboxHeight, maxLabelBboxWidth } = axisDim;
  const { top, left, height, width } = chartDimensions;
  const dimensions = { top, left, width, height };
  let topIncrement = 0;
  let bottomIncrement = 0;
  let leftIncrement = 0;
  let rightIncrement = 0;

  if (isVerticalAxis(position)) {
    const panelTitleDimension = hasSMDomain(smScales.vertical) ? getTitleDimension(axisPanelTitle) : 0;
    const dimWidth =
      labelPaddingSum + (showLabels ? maxLabelBboxWidth : 0) + tickDimension + titleDimension + panelTitleDimension;
    if (position === Position.Left) {
      leftIncrement = chartMargins.left + dimWidth;
      dimensions.left = cumLeftSum + chartMargins.left;
    } else {
      rightIncrement = dimWidth + chartMargins.right;
      dimensions.left = left + width + cumRightSum;
    }
    dimensions.width = dimWidth;
  } else {
    const panelTitleDimension = hasSMDomain(smScales.horizontal) ? getTitleDimension(axisPanelTitle) : 0;
    const dimHeight =
      labelPaddingSum + (showLabels ? maxLabelBboxHeight : 0) + tickDimension + titleDimension + panelTitleDimension;
    if (position === Position.Top) {
      topIncrement = dimHeight + chartMargins.top;
      dimensions.top = cumTopSum + chartMargins.top;
    } else {
      bottomIncrement = dimHeight + chartMargins.bottom;
      dimensions.top = top + height + cumBottomSum;
    }
    dimensions.height = dimHeight;
  }

  return { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement };
}

/** @internal */
export function shouldShowTicks({ visible, strokeWidth, size }: AxisStyle['tickLine'], axisHidden: boolean): boolean {
  return !axisHidden && visible && size > 0 && strokeWidth >= MIN_STROKE_WIDTH;
}

/** @internal */
export interface AxisGeometry {
  anchorPoint: Point;
  size: Size;
  parentSize: Size;
  axis: {
    id: AxisId;
    position: Position;
    panelTitle?: string; // defined later per panel
    secondary?: boolean; // defined later per panel
  };
  dimension: AxisViewModel;
  ticks: AxisTick[];
  visibleTicks: AxisTick[];
}

/** @internal */
export function getAxesGeometries(
  computedChartDims: {
    chartDimensions: Dimensions;
    leftMargin: number;
  },
  { chartPaddings, chartMargins, axes: sharedAxesStyle }: Theme,
  chartRotation: Rotation,
  axisSpecs: AxisSpec[],
  axisDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  xDomain: XDomain,
  yDomains: YDomain[],
  smScales: SmallMultipleScales,
  totalGroupsCount: number,
  enableHistogramMode: boolean,
  fallBackTickFormatter: TickFormatter,
  barsPadding?: number,
): Array<AxisGeometry> {
  const axesGeometries: Array<AxisGeometry> = [];
  const panel = getPanelSize(smScales);

  const anchorPointByAxisGroups = [...axisDimensions.entries()].reduce(
    (acc, [axisId, dimension]) => {
      const axisSpec = getSpecsById<AxisSpec>(axisSpecs, axisId);

      if (!axisSpec) {
        return acc;
      }

      const { tickLine, tickLabel, axisTitle, axisPanelTitle } = axesStyles.get(axisId) ?? sharedAxesStyle;
      const tickDimension = shouldShowTicks(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
      const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;

      const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = getAxisPosition(
        computedChartDims.chartDimensions,
        chartMargins,
        axisTitle,
        axisPanelTitle,
        axisSpec,
        dimension,
        smScales,
        acc.top,
        acc.bottom,
        acc.left,
        acc.right,
        tickDimension,
        labelPaddingSum,
        tickLabel.visible,
      );

      acc.pos.set(axisId, {
        anchor: {
          top: acc.top,
          left: acc.left,
          right: acc.right,
          bottom: acc.bottom,
        },
        dimensions,
      });
      return {
        top: acc.top + topIncrement,
        bottom: acc.bottom + bottomIncrement,
        left: acc.left + leftIncrement,
        right: acc.right + rightIncrement,
        pos: acc.pos,
      };
    },
    {
      top: 0,
      bottom: chartPaddings.bottom,
      left: computedChartDims.leftMargin,
      right: chartPaddings.right,
      pos: new Map<
        AxisId,
        {
          anchor: { left: number; right: number; top: number; bottom: number };
          dimensions: Dimensions;
        }
      >(),
    },
  ).pos;

  axisDimensions.forEach((axisDim, id) => {
    const axisSpec = getSpecsById<AxisSpec>(axisSpecs, id);
    const anchorPoint = anchorPointByAxisGroups.get(id);
    // Consider refactoring this so this condition can be tested
    // Given some of the values that get passed around, maybe re-write as a reduce instead of forEach?
    if (!axisSpec || !anchorPoint) {
      return;
    }

    const isVertical = isVerticalAxis(axisSpec.position);
    const minMaxRanges = getMinMaxRange(axisSpec.position, chartRotation, panel);

    const scale = getScaleForAxisSpec(
      axisSpec,
      xDomain,
      yDomains,
      totalGroupsCount,
      chartRotation,
      [minMaxRanges.minRange, minMaxRanges.maxRange],
      barsPadding,
      enableHistogramMode,
    );

    if (!scale) {
      throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
    }
    const tickFormatOptions = {
      timeZone: xDomain.timeZone,
    };

    // TODO: Find the true cause of the this offset error
    const rotationOffset =
      enableHistogramMode &&
      ((isVertical && [-90].includes(chartRotation)) || (!isVertical && [180].includes(chartRotation)))
        ? scale.step
        : 0;

    const allTicks = getAvailableTicks(
      axisSpec,
      scale,
      totalGroupsCount,
      enableHistogramMode,
      isVertical ? fallBackTickFormatter : defaultTickFormatter,
      rotationOffset,
      tickFormatOptions,
    );
    const visibleTicks = getVisibleTicks(allTicks, axisSpec, axisDim);

    const size = axisDim.isHidden
      ? { width: 0, height: 0 }
      : {
          width: isVertical ? anchorPoint.dimensions.width : panel.width,
          height: isVertical ? panel.height : anchorPoint.dimensions.height,
        };
    axesGeometries.push({
      axis: {
        id: axisSpec.id,
        position: axisSpec.position,
      },
      anchorPoint: {
        x: anchorPoint.dimensions.left,
        y: anchorPoint.dimensions.top,
      },
      size,
      parentSize: {
        height: anchorPoint.dimensions.height,
        width: anchorPoint.dimensions.width,
      },
      dimension: axisDim,
      ticks: allTicks,
      visibleTicks,
    });
  });
  return axesGeometries;
}
