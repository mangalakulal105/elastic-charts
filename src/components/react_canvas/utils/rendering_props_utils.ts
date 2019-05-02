import { GeometryStyle } from '../../../lib/series/rendering';
import { Rotation } from '../../../lib/series/specs';
import { AreaStyle, DisplayValueStyle, LineStyle, PointStyle } from '../../../lib/themes/theme';
import { Dimensions } from '../../../lib/utils/dimensions';
import { GlobalKonvaElementProps } from '../globals';

export interface PointStyleProps {
  radius: number;
  strokeWidth: number;
  strokeEnabled: boolean;
  fill: string;
  opacity: number;
}

export function buildAreaPointProps({
  areaIndex,
  pointIndex,
  x,
  y,
  color,
  pointStyleProps,
}: {
  areaIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  color: string;
  pointStyleProps: PointStyleProps;
}) {
  return {
    key: `area-point-${areaIndex}-${pointIndex}`,
    x,
    y,
    stroke: color,
    ...pointStyleProps,
    ...GlobalKonvaElementProps,
  };
}

export function buildPointStyleProps({
  radius,
  strokeWidth,
  opacity,
  seriesPointStyle,
}: {
  radius: number;
  strokeWidth: number;
  opacity: number;
  seriesPointStyle?: PointStyle;
}): PointStyleProps {
  const pointStrokeWidth = seriesPointStyle ? seriesPointStyle.strokeWidth : strokeWidth;
  return {
    radius: seriesPointStyle ? seriesPointStyle.radius : radius,
    strokeWidth: pointStrokeWidth,
    strokeEnabled: pointStrokeWidth !== 0,
    fill: 'white',
    opacity: seriesPointStyle ? seriesPointStyle.opacity : opacity,
  };
}

export function buildAreaProps({
  index,
  areaPath,
  xTransform,
  color,
  opacity,
  seriesAreaStyle,
}: {
  index: number;
  areaPath: string;
  xTransform: number;
  color: string;
  opacity: number;
  seriesAreaStyle?: AreaStyle,
}) {
  return {
    key: `area-${index}`,
    data: areaPath,
    x: xTransform,
    fill: color,
    lineCap: 'round',
    lineJoin: 'round',
    opacity: seriesAreaStyle ? seriesAreaStyle.opacity : opacity,
    ...GlobalKonvaElementProps,
  };
}

export function buildAreaLineProps({
  areaIndex,
  lineIndex,
  xTransform,
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesAreaLineStyle,
}: {
  areaIndex: number;
  lineIndex: number;
  xTransform: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesAreaLineStyle?: LineStyle;
}) {
  return {
    key: `area-${areaIndex}-line-${lineIndex}`,
    data: linePath,
    x: xTransform,
    stroke: color,
    strokeWidth: seriesAreaLineStyle ? seriesAreaLineStyle.strokeWidth : strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}

export function buildBarProps({
  index,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  borderEnabled,
  geometryStyle,
}: {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderEnabled: boolean;
  geometryStyle: GeometryStyle;
}) {
  return {
    key: `bar-${index}`,
    x,
    y,
    width,
    height,
    fill,
    strokeWidth,
    stroke,
    strokeEnabled: borderEnabled,
    ...GlobalKonvaElementProps,
    ...geometryStyle,
  };
}

export function buildBarValueProps({
  x,
  y,
  barHeight,
  barWidth,
  displayValueStyle,
  displayValue,
  chartRotation,
  chartDimensions,
}: {
  x: number;
  y: number;
  barHeight: number;
  barWidth: number;
  displayValueStyle: DisplayValueStyle;
  displayValue: { text: string; width: number; height: number; hideClippedValue?: boolean; };
  chartRotation: Rotation;
  chartDimensions: Dimensions;
}): DisplayValueStyle & {
  x: number;
  y: number;
  align: string;
  text: string;
  width: number;
  height: number;
} {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const { fontSize, padding } = displayValueStyle;
  const displayValueHeight = displayValue.height + padding;
  const displayValueY = barHeight >= displayValueHeight ? y : y - displayValueHeight;

  // if padding is less than 0, then text will appear above bar
  // this checks if there is enough space above the bar to render the value
  // if not, render the value within the bar
  const textPadding = (padding < 0 && y < fontSize) ? -padding : padding;
  const displayValueWidth = displayValue.width;

  const displayValueX = displayValueWidth > barWidth ?
    x - Math.abs(barWidth - displayValueWidth) / 2
    : x + Math.abs(barWidth - displayValueWidth) / 2;

  const rotatedDisplayValueX = displayValueHeight > barWidth ?
    x - Math.abs(barWidth - displayValueHeight) / 2
    : x + Math.abs(barWidth - displayValueHeight) / 2;

  const displayValueOffsetY = displayValueStyle.offsetY || 0;

  const props = {
    align: 'center',
    ...displayValueStyle,
    padding: textPadding,
    text: displayValue.text,
    width: displayValueWidth,
    height: displayValueHeight,
    offsetY: displayValueOffsetY,
    x: displayValueX,
    y: displayValueY,
  };

  switch (chartRotation) {
    case 0:
      props.x = displayValueX;
      props.y = displayValueY;
      break;
    case 180:
      props.x = chartWidth - displayValueX - displayValueWidth;
      props.y = chartHeight - displayValueY - displayValueHeight;
      break;
    case 90:
      props.x = chartWidth - displayValueY - displayValueWidth;
      props.y = rotatedDisplayValueX;
      break;
    case -90:
      props.x = displayValueY;
      props.y = chartHeight - rotatedDisplayValueX - displayValueHeight;
      break;
  }

  const isOverflowX = props.x + props.width > chartWidth || props.x < 0;
  const isOverflowY = props.y + props.height > chartHeight || props.y < 0;

  if (displayValue.hideClippedValue && (isOverflowX || isOverflowY)) {
    props.width = 0;
    props.height = 0;
  }

  return props;
}

export function buildLinePointProps({
  lineIndex,
  pointIndex,
  x,
  y,
  color,
  pointStyleProps,
}: {
  lineIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  color: string;
  pointStyleProps: PointStyleProps;
}) {
  return {
    key: `line-point-${lineIndex}-${pointIndex}`,
    x,
    y,
    stroke: color,
    ...pointStyleProps,
    ...GlobalKonvaElementProps,
  };
}

export function buildLineProps({
  index,
  xTransform,
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesLineStyle,
}: {
  index: number;
  xTransform: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesLineStyle?: LineStyle;
}) {
  return {
    key: `line-${index}`,
    x: xTransform,
    data: linePath,
    stroke: color,
    strokeWidth: seriesLineStyle ? seriesLineStyle.strokeWidth : strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}
