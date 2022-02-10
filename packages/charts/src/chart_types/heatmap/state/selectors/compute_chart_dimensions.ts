/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleBand } from 'd3-scale';

import { Radian } from '../../../../common/geometry';
import { extent } from '../../../../common/math';
import { cutToLength, TextAlign } from '../../../../common/text_utils';
import { rotate2, sub2, Vec2 } from '../../../../common/vectors';
import { screenspaceMarkerScaleCompressor } from '../../../../solvers/screenspace_marker_scale_compressor';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { addPadding, TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad, isFiniteNumber } from '../../../../utils/common';
import { Dimensions, horizontalPad, innerPad, outerPad, pad, Size } from '../../../../utils/dimensions';
import { isHorizontalLegend } from '../../../../utils/legend';
import { AxisStyle, HeatmapStyle } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { limitXAxisLabelRotation } from '../../layout/viewmodel/default_constaints';
import { HeatmapCellDatum, isRasterTimeScale } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs/heatmap';
import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getHeatmapTableSelector } from './get_heatmap_table';

/** @internal */
export interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  yValues: Array<string | number>;
  xValues: Array<string | number>;
  xNumericExtent: [number, number];
  extent: [number, number];
}

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/** @internal */
export type ChartElementSizes = {
  yAxis: Dimensions;
  xAxis: Dimensions;
  grid: Dimensions;
  fullHeatmapHeight: number;
  rowHeight: number;
  visibleNumberOfRows: number;
  xAxisTickCadence: number;
};

/**
 * Returns grid and axes sizes and positions.
 * @internal
 */
export const computeChartElementSizesSelector = createCustomCachedSelector(
  [getParentDimension, getLegendSizeSelector, getHeatmapTableSelector, getChartThemeSelector, getHeatmapSpecSelector],
  (
    container,
    legendSize,
    { yValues, xValues, xNumericExtent },
    { heatmap, axes: { axisTitle: axisTitleStyle } },
    { xAxisTitle, yAxisTitle, xAxisLabelFormatter, yAxisLabelFormatter, xScale },
  ): ChartElementSizes => {
    return withTextMeasure((textMeasure) => {
      const isLegendHorizontal = isHorizontalLegend(legendSize.position);
      const legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
      const legendHeight = isLegendHorizontal
        ? heatmap.maxLegendHeight ?? legendSize.height + legendSize.margin * 2
        : 0;

      const yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
      const yAxisWidth = getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure);

      const xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
      console.log({ yAxisWidth, yAxisTitleHorizontalSize });
      const isTimeScale = isRasterTimeScale(xScale);
      const isRotated = heatmap.xAxisLabel.rotation !== 0;
      const normalizedXScale = scaleBand<NonNullable<PrimitiveValue>>().domain(xValues).range([0, 1]);
      console.log({ xValues, xNumericExtent });
      const xScaleLabelAlignment = isRasterTimeScale(xScale) ? 0 : normalizedXScale.bandwidth() / 2;
      const xAxisSize = getXAxisSize(
        isTimeScale,
        heatmap.xAxisLabel,
        xAxisLabelFormatter,
        (d) => {
          return (normalizedXScale(d) ?? 0) + xScaleLabelAlignment;
        },
        isTimeScale ? [...xValues, xNumericExtent[1] - 1] : xValues,
        textMeasure,
        container.width - legendWidth,
        [
          yAxisTitleHorizontalSize + yAxisWidth,
          0, // fill this if you need a right Y axis
        ],
        isRotated ? 'right' : isTimeScale ? 'left' : 'center',
      );

      const availableHeightForGrid = container.height - xAxisTitleVerticalSize - xAxisSize.height - legendHeight;

      const rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
      const fullHeatmapHeight = rowHeight * yValues.length;

      const visibleNumberOfRows =
        rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
          ? Math.floor(availableHeightForGrid / rowHeight)
          : yValues.length;

      const grid: Dimensions = {
        width: xAxisSize.width,
        height: visibleNumberOfRows * rowHeight,
        left: container.left + xAxisSize.left,
        top: container.top,
      };

      const yAxis: Dimensions = {
        width: yAxisWidth,
        height: grid.height,
        top: grid.top,
        left: grid.left - yAxisWidth,
      };

      const xAxis: Dimensions = {
        width: grid.width,
        height: xAxisSize.height,
        top: grid.top + grid.height,
        left: grid.left,
      };

      return {
        grid,
        yAxis,
        xAxis,
        visibleNumberOfRows,
        fullHeatmapHeight,
        rowHeight,
        xAxisTickCadence: xAxisSize.tickCadence,
      };
    });
  },
);

function getYAxisHorizontalUsedSpace(
  yValues: HeatmapTable['yValues'],
  style: HeatmapStyle['yAxisLabel'],
  formatter: HeatmapSpec['yAxisLabelFormatter'],
  textMeasure: TextMeasure,
) {
  if (!style.visible) {
    return 0;
  }
  // account for the space required to show the longest Y axis label
  const longestLabelWidth = yValues.reduce<number>((acc, value) => {
    const { width } = textMeasure(formatter(value), style, style.fontSize);
    return Math.max(width, acc);
  }, 0);

  const labelsWidth =
    style.width === 'auto'
      ? longestLabelWidth
      : typeof style.width === 'number'
      ? style.width
      : Math.max(longestLabelWidth, style.width.max);

  return labelsWidth + horizontalPad(style.padding);
}

function getTextSizeDimension(
  text: string,
  style: AxisStyle['axisTitle'],
  textMeasure: TextMeasure,
  param: 'height' | 'width',
): number {
  if (!style.visible || text === '') {
    return 0;
  }
  const textPadding = innerPad(style.padding) + outerPad(style.padding);
  if (param === 'height') {
    return style.fontSize + textPadding;
  }

  const textBox = textMeasure(
    text,
    {
      fontFamily: style.fontFamily,
      fontVariant: 'normal',
      fontWeight: 'bold',
      fontStyle: style.fontStyle ?? 'normal',
    },
    style.fontSize,
  );
  return textBox.width + textPadding;
}

function getGridCellHeight(rows: number, grid: HeatmapStyle['grid'], height: number): number {
  if (rows === 0) {
    return height; // TODO check if this can be just 0
  }
  const stretchedHeight = height / rows;

  if (stretchedHeight < grid.cellHeight.min) {
    return grid.cellHeight.min;
  }
  if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
    return grid.cellHeight.max;
  }

  return stretchedHeight;
}

function getXAxisSize(
  isTimeScale: boolean,
  style: HeatmapStyle['xAxisLabel'],
  formatter: HeatmapSpec['xAxisLabelFormatter'],
  scale: (d: NonNullable<PrimitiveValue>) => number,
  labels: (string | number)[],
  textMeasure: TextMeasure,
  containerWidth: number,
  surroundingSpace: [number, number],
  alignment: TextAlign,
) {
  if (!style.visible) {
    return { width: 0, height: 0, left: 0, right: 0, tickCadence: 1 };
  }
  const rotationRad = degToRad(-limitXAxisLabelRotation(style.rotation));

  const formattedLabels = labels.map((label) =>
    style.width === 'auto' || !isFiniteNumber(style.width)
      ? // use formatted and optionally limited labels
        // measure the text label size or use a fixed width/height depending on the style
        {
          ...addPadding(
            textMeasure(cutToLength(formatter(label), style.maxTextLength), style, style.fontSize),
            style.padding,
          ),
          label,
        }
      : { width: style.width, height: style.fontSize, label },
  );

  // TODO refactor and move to monotonic hill climber
  let tickCadence = 1;
  let dimension = {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    containsOverlap: true,
  };

  while (dimension.containsOverlap && tickCadence <= formattedLabels.length) {
    tickCadence++;
    dimension = computeCompressedScale(
      isTimeScale,
      style,
      scale,
      formattedLabels.filter((_, i) => i % tickCadence === 0),
      containerWidth,
      surroundingSpace,
      alignment,
      rotationRad,
    );
  }
  console.log(tickCadence);

  return {
    ...dimension,
    tickCadence,
  };
}

function computeCompressedScale(
  checkForOverlaps: boolean,
  style: HeatmapStyle['xAxisLabel'],
  scale: (d: NonNullable<PrimitiveValue>) => number,
  formattedLabels: Array<Size & { label: number | NonNullable<PrimitiveValue> }>,
  containerWidth: number,
  surroundingSpace: [number, number],
  alignment: TextAlign,
  rotation: Radian,
): Size & { left: number; right: number; containsOverlap: boolean } {
  const { itemWidths, domainPositions, hMax } = formattedLabels.reduce<{
    wMax: number;
    hMax: number;
    itemWidths: [number, number][];
    domainPositions: number[];
  }>(
    (acc, { width, height, label }) => {
      // rotate the label box coordinates
      const labelRect: Vec2[] = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ];
      const rotationOrigin: Vec2 = getRotationOriginFromAlignment(width, height, alignment);
      const rotatedVectors = labelRect.map((vector) => rotate2(rotation, sub2(vector, rotationOrigin)));

      // find the rotated bounding box
      const x = extent(rotatedVectors.map((v) => v[0]));
      const y = extent(rotatedVectors.map((v) => v[1]));
      acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
      acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));

      // describe the item width as the left and right vector size from the rotation origin
      acc.itemWidths.push([Math.abs(x[0]), Math.abs(x[1])]);

      // use a categorical scale with labels aligned to the center to compute the domain position
      const domainPosition = scale(label);
      acc.domainPositions.push(domainPosition);
      return acc;
    },
    { wMax: -Infinity, hMax: -Infinity, itemWidths: [], domainPositions: [] },
  );

  // account for the left and right space (Y axes, overflows etc)
  const globalDomainPositions = [0, ...domainPositions, 1];
  const globalItemWidth: [number, number][] = [[surroundingSpace[0], 0], ...itemWidths, [0, surroundingSpace[1]]];
  const { scaleMultiplier, bounds } = screenspaceMarkerScaleCompressor(
    globalDomainPositions,
    globalItemWidth,
    containerWidth,
  );
  const containsOverlap = checkForOverlaps
    ? itemWidths.some((curr, i) => {
        if (i >= itemWidths.length - 2) {
          return false;
        }
        const currentX = domainPositions[i] * scaleMultiplier;
        const nextX = domainPositions[i + 1] * scaleMultiplier;
        return currentX + curr[1] > nextX + itemWidths[i + 1][0];
      })
    : false;
  const leftMargin = isFiniteNumber(bounds[0]) ? globalItemWidth[bounds[0]][0] : 0;
  const rightMargin = isFiniteNumber(bounds[1]) ? globalItemWidth[bounds[1]][1] : 0;
  return {
    // the horizontal space
    width: scaleMultiplier,
    right: rightMargin,
    left: leftMargin,
    // the height represent the height of the max rotated bbox plus the padding and the vertical position of the rotation origin
    height: hMax + pad(style.padding, 'top') + style.fontSize / 2,
    containsOverlap,
  };
}

function getRotationOriginFromAlignment(width: number, height: number, alignment: TextAlign): Vec2 {
  // with no rotation move the origin to the middle/center
  // with rotation instead rotate around the right most/middle center (right alignment)
  switch (alignment) {
    case 'right':
      return [width, height / 2];
    case 'left':
      return [0, height / 2];
    default:
      return [width / 2, height / 2];
  }
}
