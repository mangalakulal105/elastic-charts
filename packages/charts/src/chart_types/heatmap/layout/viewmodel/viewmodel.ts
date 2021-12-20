/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bisectLeft } from 'd3-array';
import { ScaleBand, scaleBand, scaleQuantize } from 'd3-scale';

import { colorToRgba } from '../../../../common/color_library_wrappers';
import { fillTextColor } from '../../../../common/fill_text_color';
import { Pixels } from '../../../../common/geometry';
import { Box, maximiseFontSize, TextMeasure } from '../../../../common/text_utils';
import { ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { LinearScale, OrdinalScale, RasterTimeScale } from '../../../../specs';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { addIntervalToTime } from '../../../../utils/chrono/elasticsearch';
import { clamp } from '../../../../utils/common';
import { Dimensions, innerPad, pad } from '../../../../utils/dimensions';
import { Logger } from '../../../../utils/logger';
import { HeatmapStyle, Theme } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { HeatmapSpec } from '../../specs';
import { ChartDims, HeatmapTable } from '../../state/selectors/compute_chart_dimensions';
import { ColorScale } from '../../state/selectors/get_color_scale';
import {
  Cell,
  PickDragFunction,
  PickDragShapeFunction,
  PickHighlightedArea,
  ShapeViewModel,
  TextBox,
} from '../types/viewmodel_types';

/** @public */
export interface HeatmapCellDatum {
  x: NonNullable<PrimitiveValue>;
  y: NonNullable<PrimitiveValue>;
  value: number;
  originalIndex: number;
}

function getValuesInRange(
  values: NonNullable<PrimitiveValue>[],
  startValue: NonNullable<PrimitiveValue>,
  endValue: NonNullable<PrimitiveValue>,
) {
  const startIndex = values.indexOf(startValue);
  const endIndex = Math.min(values.indexOf(endValue) + 1, values.length);
  return values.slice(startIndex, endIndex);
}

function estimatedNonOverlappingTickCount(
  chartWidth: number,
  formatter: HeatmapSpec['xAxisLabelFormatter'],
  { fontSize, fontFamily }: HeatmapStyle['xAxisLabel'],
): number {
  return withTextMeasure((textMeasure) => {
    const labelSample = formatter(Date.now());
    const { width } = textMeasure(labelSample, 0, fontSize, fontFamily);
    const maxTicks = chartWidth / width;
    // Dividing by 2 is a temp fix to make sure {@link ScaleContinuous} won't produce
    // to many ticks creating nice rounded tick values
    // TODO add support for limiting the number of tick in {@link ScaleContinuous}
    return Math.floor(maxTicks / 2);
  });
}
/** @internal */
export function shapeViewModel(
  textMeasure: TextMeasure,
  spec: HeatmapSpec,
  { heatmap: heatmapTheme, background }: Theme,
  dims: ChartDims,
  heatmapTable: HeatmapTable,
  colorScale: ColorScale,
  bandsToHide: Array<[number, number]>,
): ShapeViewModel {
  const gridStrokeWidth = heatmapTheme.grid.stroke.width ?? 1;

  const { table, yValues, xValues } = heatmapTable;

  // measure the text width of all rows values to get the grid area width
  const boxedYValues = yValues.map<Box & { value: NonNullable<PrimitiveValue> }>((value) => ({
    text: spec.yAxisLabelFormatter(value),
    value,
    isValue: false,
    ...heatmapTheme.yAxisLabel,
  }));

  // compute the scale for the rows positions
  const yScale = scaleBand<NonNullable<PrimitiveValue>>().domain(yValues).range([0, dims.fullHeatmapHeight]);

  const yInvertedScale = scaleQuantize<NonNullable<PrimitiveValue>>()
    .domain([0, dims.fullHeatmapHeight])
    .range(yValues);

  // compute the scale for the columns positions
  const xScale = scaleBand<NonNullable<PrimitiveValue>>().domain(xValues).range([0, dims.grid.width]);

  const xInvertedScale = scaleQuantize<NonNullable<PrimitiveValue>>().domain([0, dims.grid.width]).range(xValues);

  // compute the cell width (can be smaller then the available size depending on config
  const cellWidth =
    heatmapTheme.cell.maxWidth !== 'fill' && xScale.bandwidth() > heatmapTheme.cell.maxWidth
      ? heatmapTheme.cell.maxWidth
      : xScale.bandwidth();

  // compute the cell height (we already computed the max size for that)
  const cellHeight = yScale.bandwidth();

  const currentGridHeight = dims.grid.height;

  // compute the position of each column label
  const textXValues = getXTicks(spec, heatmapTheme, dims.grid, xScale, heatmapTable);

  const { padding } = heatmapTheme.yAxisLabel;

  // compute the position of each row label
  const textYValues = boxedYValues.map<TextBox>((d) => {
    return {
      ...d,
      // position of the Y labels
      x: -pad(padding, 'right'),
      y: cellHeight / 2 + (yScale(d.value) || 0),
    };
  });

  const cellWidthInner = cellWidth - gridStrokeWidth * 2;
  const cellHeightInner = cellHeight - gridStrokeWidth * 2;

  if (colorToRgba(background.color)[3] < 1) {
    Logger.expected(
      'Text contrast requires a opaque background color, using fallbackColor',
      'an opaque color',
      background.color,
    );
  }

  // compute each available cell position, color and value
  const cellMap = table.reduce<Record<string, Cell>>((acc, d) => {
    const x = xScale(String(d.x));
    const y = yScale(String(d.y))! + gridStrokeWidth;
    const yIndex = yValues.indexOf(d.y);

    if (x === undefined || y === undefined || yIndex === -1) {
      return acc;
    }
    const cellBackgroundColor = colorScale(d.value);
    const cellKey = getCellKey(d.x, d.y);

    const formattedValue = spec.valueFormatter(d.value);

    const fontSize = maximiseFontSize(
      textMeasure,
      formattedValue,
      heatmapTheme.cell.label,
      heatmapTheme.cell.label.minFontSize,
      heatmapTheme.cell.label.maxFontSize,
      // adding 3px padding per side to avoid that text touches the edges
      cellWidthInner - 6,
      cellHeightInner - 6,
    );

    acc[cellKey] = {
      x:
        (heatmapTheme.cell.maxWidth !== 'fill' ? x + xScale.bandwidth() / 2 - heatmapTheme.cell.maxWidth / 2 : x) +
        gridStrokeWidth,
      y,
      yIndex,
      width: cellWidthInner,
      height: cellHeightInner,
      datum: d,
      fill: {
        color: colorToRgba(cellBackgroundColor),
      },
      stroke: {
        color: colorToRgba(heatmapTheme.cell.border.stroke),
        width: heatmapTheme.cell.border.strokeWidth,
      },
      value: d.value,
      visible: !isValueHidden(d.value, bandsToHide),
      formatted: formattedValue,
      fontSize,
      textColor: fillTextColor(background.fallbackColor, cellBackgroundColor, background.color),
    };
    return acc;
  }, {});

  /**
   * Returns selected elements based on coordinates.
   * @param x
   * @param y
   */
  const pickQuads = (x: Pixels, y: Pixels): Array<Cell> | TextBox => {
    if (x > 0 && x < dims.grid.left && y > dims.grid.top && y < dims.grid.top + dims.grid.height) {
      // look up for a Y axis elements
      const yLabelKey = yInvertedScale(y);
      const yLabelValue = textYValues.find((v) => v.value === yLabelKey);
      if (yLabelValue) {
        return yLabelValue;
      }
    }

    if (x < dims.grid.left || y < dims.grid.top) {
      return [];
    }
    if (x > dims.grid.width + dims.grid.left || y > dims.grid.top + dims.grid.height) {
      return [];
    }
    const xValue = xInvertedScale(x - dims.grid.left);
    const yValue = yInvertedScale(y);
    if (xValue === undefined || yValue === undefined) {
      return [];
    }
    const cellKey = getCellKey(xValue, yValue);
    const cell = cellMap[cellKey];
    if (cell) {
      return [cell];
    }
    return [];
  };

  /**
   * Return selected cells and X,Y ranges based on the drag selection.
   */
  const pickDragArea: PickDragFunction = (bound) => {
    const [start, end] = bound;

    const { left, top, width } = dims.grid;
    const topLeft = [Math.min(start.x, end.x) - left, Math.min(start.y, end.y) - top];
    const bottomRight = [Math.max(start.x, end.x) - left, Math.max(start.y, end.y) - top];

    const startX = xInvertedScale(clamp(topLeft[0], 0, width));
    const endX = xInvertedScale(clamp(bottomRight[0], 0, width));
    const startY = yInvertedScale(clamp(topLeft[1], 0, currentGridHeight - 1));
    const endY = yInvertedScale(clamp(bottomRight[1], 0, currentGridHeight - 1));

    const allXValuesInRange: Array<NonNullable<PrimitiveValue>> = getValuesInRange(xValues, startX, endX);
    const allYValuesInRange: Array<NonNullable<PrimitiveValue>> = getValuesInRange(yValues, startY, endY);
    const invertedXValues: Array<NonNullable<PrimitiveValue>> =
      isRasterTimeScale(spec.xScale) && typeof endX === 'number'
        ? [startX, addIntervalToTime(endX, spec.xScale.interval, spec.timeZone)]
        : [...allXValuesInRange];
    const cells: Cell[] = [];

    allXValuesInRange.forEach((x) => {
      allYValuesInRange.forEach((y) => {
        const cellKey = getCellKey(x, y);
        cells.push(cellMap[cellKey]);
      });
    });

    return {
      cells: cells.filter(Boolean),
      x: invertedXValues,
      y: allYValuesInRange,
    };
  };

  /**
   * Resolves rect area based on provided X and Y ranges
   * @param x
   * @param y
   */
  const pickHighlightedArea: PickHighlightedArea = (
    x: Array<NonNullable<PrimitiveValue>>,
    y: Array<NonNullable<PrimitiveValue>>,
  ) => {
    const startValue = x[0];
    const endValue = x[x.length - 1];

    const leftIndex =
      typeof startValue === 'number' ? bisectLeft(xValues as number[], startValue) : xValues.indexOf(startValue);
    const rightIndex =
      typeof endValue === 'number' ? bisectLeft(xValues as number[], endValue) : xValues.indexOf(endValue) + 1;

    const isRightOutOfRange = rightIndex > xValues.length - 1 || rightIndex < 0;
    const isLeftOutOfRange = leftIndex > xValues.length - 1 || leftIndex < 0;

    const startFromScale = xScale(isLeftOutOfRange ? xValues[0] : xValues[leftIndex]);
    const endFromScale = xScale(isRightOutOfRange ? xValues[xValues.length - 1] : xValues[rightIndex]);

    if (startFromScale === undefined || endFromScale === undefined) {
      return null;
    }

    const xStart = dims.grid.left + startFromScale;

    // extend the range in case the right boundary has been selected
    const width = endFromScale - startFromScale + (isRightOutOfRange || isLeftOutOfRange ? cellWidth : 0);

    // resolve Y coordinated making sure the order is correct
    const { y: yStart, totalHeight } = y
      .filter((v) => yValues.includes(v))
      .reduce(
        (acc, current, i) => {
          if (i === 0) {
            acc.y = yScale(current) || 0;
          }
          acc.totalHeight += cellHeight;
          return acc;
        },
        { y: 0, totalHeight: 0 },
      );
    return {
      x: xStart,
      y: yStart,
      width,
      height: totalHeight,
    };
  };

  /**
   * Resolves coordinates and metrics of the selected rect area.
   */
  const pickDragShape: PickDragShapeFunction = (bound) => {
    const area = pickDragArea(bound);
    return pickHighlightedArea(area.x, area.y);
  };

  // vertical lines
  const xLines = Array.from({ length: xValues.length + 1 }, (d, i) => ({
    x1: dims.grid.left + i * cellWidth,
    x2: dims.grid.left + i * cellWidth,
    y1: dims.grid.top,
    y2: currentGridHeight,
  }));

  // horizontal lines
  const yLines = Array.from({ length: dims.visibleNumberOfRows + 1 }, (d, i) => ({
    x1: dims.grid.left,
    x2: dims.grid.left + dims.grid.width,
    y1: i * cellHeight,
    y2: i * cellHeight,
  }));

  const cells = Object.values(cellMap);
  const tableMinFontSize = cells.reduce((acc, { fontSize }) => Math.min(acc, fontSize), Infinity);

  return {
    theme: heatmapTheme,
    heatmapViewModel: {
      gridOrigin: {
        x: dims.grid.left,
        y: dims.grid.top,
      },
      gridLines: {
        x: xLines,
        y: yLines,
        stroke: {
          color: colorToRgba(heatmapTheme.grid.stroke.color),
          width: gridStrokeWidth,
        },
      },
      pageSize: dims.visibleNumberOfRows,
      cells,
      cellFontSize: (cell: Cell) => (heatmapTheme.cell.label.useGlobalMinFontSize ? tableMinFontSize : cell.fontSize),
      xValues: textXValues,
      yValues: textYValues,
      titles: [
        {
          origin: {
            x: dims.grid.left + dims.grid.width / 2,
            y:
              dims.grid.top +
              dims.grid.height +
              dims.xAxis.height +
              innerPad(heatmapTheme.axisTitle.padding) +
              heatmapTheme.axisTitle.fontSize / 2,
          },
          ...heatmapTheme.axisTitle,
          text: spec.xAxisTitle,
          rotation: 0,
        },
        {
          origin: {
            x: dims.yAxis.left - innerPad(heatmapTheme.axisTitle.padding) - heatmapTheme.axisTitle.fontSize / 2,
            y: dims.grid.top + dims.grid.height / 2,
          },
          ...heatmapTheme.axisTitle,
          text: spec.yAxisTitle,
          rotation: -90,
        },
      ],
    },
    pickQuads,
    pickDragArea,
    pickDragShape,
    pickHighlightedArea,
  };
}

function getCellKey(x: NonNullable<PrimitiveValue>, y: NonNullable<PrimitiveValue>) {
  return [String(x), String(y)].join('&_&');
}

function isValueHidden(value: number, rangesToHide: Array<[number, number]>) {
  return rangesToHide.some(([min, max]) => min <= value && value < max);
}

/** @internal */
export function isRasterTimeScale(scale: RasterTimeScale | OrdinalScale | LinearScale): scale is RasterTimeScale {
  return scale.type === ScaleType.Time;
}

function getXTicks(
  spec: HeatmapSpec,
  style: HeatmapStyle,
  grid: Dimensions,
  xScale: ScaleBand<string | number>,
  { xValues, xNumericExtent }: HeatmapTable,
): Array<TextBox> {
  const getTextValue = (
    formatter: HeatmapSpec['xAxisLabelFormatter'],
    scaleCallback: (x: string | number) => number | undefined | null,
  ) => (value: string | number): TextBox => {
    return {
      text: formatter(value),
      value,
      isValue: false,
      ...style.xAxisLabel,
      x: scaleCallback(value) ?? 0,
      y: style.xAxisLabel.fontSize / 2 + pad(style.xAxisLabel.padding, 'top'),
    };
  };
  if (isRasterTimeScale(spec.xScale)) {
    const timeScale = new ScaleContinuous(
      {
        type: ScaleType.Time,
        domain: xNumericExtent,
        range: [0, grid.width],
        nice: false,
      },
      {
        desiredTickCount: estimatedNonOverlappingTickCount(grid.width, spec.xAxisLabelFormatter, style.xAxisLabel),
        timeZone: spec.timeZone,
      },
    );
    return timeScale.ticks().map<TextBox>(getTextValue(spec.xAxisLabelFormatter, (x) => timeScale.scale(x)));
  }

  return xValues.map<TextBox>((textBox: string | number) => {
    return {
      ...getTextValue(spec.xAxisLabelFormatter, xScale)(textBox),
      x: (xScale(textBox) || 0) + xScale.bandwidth() / 2,
    };
  });
}
