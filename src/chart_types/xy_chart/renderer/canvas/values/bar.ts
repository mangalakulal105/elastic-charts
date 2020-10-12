/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Rect } from '../../../../../geoms/types';
import { Rotation } from '../../../../../utils/commons';
import { Dimensions } from '../../../../../utils/dimensions';
import { BarGeometry } from '../../../../../utils/geometry';
import { Point } from '../../../../../utils/point';
import { Theme } from '../../../../../utils/themes/theme';
import { Font, FontStyle, TextBaseline, TextAlign } from '../../../../partition_chart/layout/types/types';
import { colorIsDark, getTextColorIfTextInvertible } from '../../../../partition_chart/layout/utils/calcs';
import { getFillTextColor } from '../../../../partition_chart/layout/viewmodel/fill_text_layout';
import { renderText, wrapLines } from '../primitives/text';
import { renderDebugRect } from '../utils/debug';

interface BarValuesProps {
  theme: Theme;
  chartDimensions: Dimensions;
  chartRotation: Rotation;
  debug: boolean;
  bars: BarGeometry[];
}

/** @internal */
export function renderBarValues(ctx: CanvasRenderingContext2D, props: BarValuesProps) {
  const { bars, debug, chartRotation, chartDimensions, theme } = props;
  const { fontFamily, fontStyle, fill, fontSize } = theme.barSeriesStyle.displayValue;
  const barsLength = bars.length;
  for (let i = 0; i < barsLength; i++) {
    const { displayValue } = bars[i];
    if (!displayValue) {
      continue;
    }
    const { text } = displayValue;
    let textLines = {
      lines: [text],
      width: displayValue.width,
      height: displayValue.height,
    };
    const font: Font = {
      fontFamily,
      fontStyle: fontStyle ? (fontStyle as FontStyle) : 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textColor: 'black',
      textOpacity: 1,
    };

    const { x, y, align, baseline, rect } = positionText(
      bars[i],
      displayValue,
      chartRotation,
      theme.barSeriesStyle.displayValue,
    );

    if (displayValue.isValueContainedInElement) {
      const width = chartRotation === 0 || chartRotation === 180 ? bars[i].width : bars[i].height;
      textLines = wrapLines(ctx, textLines.lines[0], font, fontSize, width, 100);
    }
    if (displayValue.hideClippedValue && isOverflow(rect, chartDimensions, chartRotation)) {
      continue;
    }
    if (debug) {
      renderDebugRect(ctx, rect);
    }
    const { width, height } = textLines;
    const linesLength = textLines.lines.length;
    const shadowSize = getTextBorderSize(fill);
    const { fillColor, shadowColor } = getTextColors(fill, bars[i].color, shadowSize);

    for (let i = 0; i < linesLength; i++) {
      const text = textLines.lines[i];
      const origin = repositionTextLine({ x, y }, chartRotation, i, linesLength, { height, width });
      renderText(
        ctx,
        origin,
        text,
        {
          ...font,
          fill: fillColor,
          fontSize,
          align,
          baseline,
          shadow: shadowColor,
          shadowSize,
        },
        -chartRotation,
      );
    }
  }
}
function repositionTextLine(
  origin: Point,
  chartRotation: Rotation,
  i: number,
  max: number,
  box: { height: number; width: number },
) {
  const { x, y } = origin;
  const { width, height } = box;
  let lineX: number;
  let lineY: number;
  switch (chartRotation) {
    case 180:
      lineX = x;
      lineY = y - (i - max + 1) * height;
      break;
    case -90:
      lineX = x;
      lineY = y;
      break;
    case 90:
      lineX = x;
      lineY = y - (i - max + 1) * width;
      break;
    case 0:
    default:
      lineX = x;
      lineY = y + i * height;
  }

  return { x: lineX, y: lineY };
}

function positionText(
  geom: BarGeometry,
  valueBox: { width: number; height: number },
  chartRotation: Rotation,
  offsets: { offsetX: number; offsetY: number },
) {
  const { offsetX, offsetY } = offsets;
  let baseline: TextBaseline = 'top';
  let align: TextAlign = 'center';

  let x = geom.x + geom.width / 2 - offsetX;
  let y = geom.y - offsetY;
  const rect: Rect = {
    x: x - valueBox.width / 2,
    y,
    width: valueBox.width,
    height: valueBox.height,
  };
  if (chartRotation === 180) {
    baseline = 'bottom';
    x = geom.x + geom.width / 2 + offsetX;
    y = geom.y + offsetY;
    rect.x = x - valueBox.width / 2;
    rect.y = y;
  }
  if (chartRotation === 90) {
    x = geom.x - offsetY;
    y = geom.y + offsetX;
    align = 'right';
    rect.x = x;
    rect.y = y;
    rect.width = valueBox.height;
    rect.height = valueBox.width;
  }
  if (chartRotation === -90) {
    x = geom.x + geom.width + offsetY;
    y = geom.y - offsetX;
    align = 'left';
    rect.x = x - valueBox.height;
    rect.y = y;
    rect.width = valueBox.height;
    rect.height = valueBox.width;
  }
  return {
    x,
    y,
    align,
    baseline,
    rect,
  };
}
function isOverflow(rect: Rect, chartDimensions: Dimensions, chartRotation: Rotation) {
  let cWidth = chartDimensions.width;
  let cHeight = chartDimensions.height;
  if (chartRotation === 90 || chartRotation === -90) {
    cWidth = chartDimensions.height;
    cHeight = chartDimensions.width;
  }

  if (rect.x < 0 || rect.x + rect.width > cWidth) {
    return true;
  }
  if (rect.y < 0 || rect.y + rect.height > cHeight) {
    return true;
  }

  return false;
}

const DEFAULT_VALUE_COLOR = 'black';
// a little bit of alpha makes black font more readable
const DEFAULT_VALUE_BORDER_COLOR = 'rgba(255, 255, 255, 0.8)';
const DEFAULT_VALUE_BORDER_SOLID_COLOR = 'rgb(255, 255, 255)';
const TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
type ValueFillDefinition = Theme['barSeriesStyle']['displayValue']['fill'];

function getTextColors(
  fillDefinition: ValueFillDefinition,
  geometryColor: string,
  borderSize: number,
): { fillColor: string; shadowColor: string } {
  if (typeof fillDefinition === 'string') {
    return { fillColor: fillDefinition, shadowColor: TRANSPARENT_COLOR };
  }
  if ('color' in fillDefinition) {
    return {
      fillColor: fillDefinition.color,
      shadowColor: fillDefinition.borderColor || TRANSPARENT_COLOR,
    };
  }
  const fillColor =
    getFillTextColor(
      DEFAULT_VALUE_COLOR,
      fillDefinition.textInvertible,
      fillDefinition.textContrast || false,
      geometryColor,
      'white',
    ) || DEFAULT_VALUE_COLOR;

  // If the border is too wide it can overlap between a letter or another
  // therefore use a solid color for thinker borders
  const defaultBorderColor = borderSize < 2 ? DEFAULT_VALUE_BORDER_COLOR : DEFAULT_VALUE_BORDER_SOLID_COLOR;
  const shadowColor =
    'textBorder' in fillDefinition
      ? getTextColorIfTextInvertible(
          colorIsDark(fillColor),
          colorIsDark(defaultBorderColor),
          defaultBorderColor,
          false,
          geometryColor,
        ) || TRANSPARENT_COLOR
      : TRANSPARENT_COLOR;

  return {
    fillColor,
    shadowColor,
  };
}

const DEFAULT_BORDER_WIDTH = 1.5;
const MAX_BORDER_WIDTH = 8;

function getTextBorderSize(fill: ValueFillDefinition): number {
  if (typeof fill === 'string') {
    return DEFAULT_BORDER_WIDTH;
  }
  if ('borderWidth' in fill) {
    return Math.min(fill.borderWidth || DEFAULT_BORDER_WIDTH, MAX_BORDER_WIDTH);
  }
  const borderWidth =
    'textBorder' in fill && typeof fill.textBorder === 'number' ? fill.textBorder : DEFAULT_BORDER_WIDTH;
  return Math.min(borderWidth, MAX_BORDER_WIDTH);
}
