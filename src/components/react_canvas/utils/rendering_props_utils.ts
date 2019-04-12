import { GeometryStyle } from '../../../lib/series/rendering';
import { AreaStyle, LineStyle, PointStyle } from '../../../lib/themes/theme';
import { GlobalKonvaElementProps } from '../globals';

export function buildAreaPointProps({
  areaIndex,
  pointIndex,
  x,
  y,
  radius,
  strokeWidth,
  color,
  opacity,
  seriesPointStyle,
}: {
  areaIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  radius: number;
  strokeWidth: number;
  color: string;
  opacity: number;
  seriesPointStyle?: PointStyle;
}) {
  const pointStrokeWidth = seriesPointStyle ? seriesPointStyle.strokeWidth : strokeWidth;
  return {
    key: `area-point-${areaIndex}-${pointIndex}`,
    x,
    y,
    radius: seriesPointStyle ? seriesPointStyle.radius : radius,
    strokeWidth: pointStrokeWidth,
    strokeEnabled: pointStrokeWidth !== 0,
    stroke: color,
    fill: 'white',
    opacity: seriesPointStyle ? seriesPointStyle.opacity : opacity,
    ...GlobalKonvaElementProps,
  };
}

export function buildAreaProps({
  index,
  areaPath,
  color,
  opacity,
  seriesAreaStyle,
}: {
  index: number;
  areaPath: string;
  color: string;
  opacity: number;
  seriesAreaStyle?: AreaStyle,
}) {
  return {
    key: `area-${index}`,
    data: areaPath,
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
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesAreaLineStyle,
}: {
  areaIndex: number;
  lineIndex: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesAreaLineStyle?: LineStyle;
}) {
  return {
    key: `area-${areaIndex}-line-${lineIndex}`,
    data: linePath,
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

export function buildLinePointProps({
  lineIndex,
  pointIndex,
  x,
  y,
  radius,
  strokeWidth,
  color,
  opacity,
  seriesPointStyle,
}: {
  lineIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  radius: number;
  strokeWidth: number;
  color: string;
  opacity: number;
  seriesPointStyle?: PointStyle;
}) {
  return {
    key: `line-point-${lineIndex}-${pointIndex}`,
    x,
    y,
    radius: seriesPointStyle ? seriesPointStyle.radius : radius,
    stroke: color,
    strokeWidth,
    strokeEnabled: strokeWidth !== 0,
    fill: 'white',
    opacity: seriesPointStyle ? seriesPointStyle.opacity : opacity,
    ...GlobalKonvaElementProps,
  };
}

export function buildLineProps({
  index,
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesLineStyle,
}: {
  index: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesLineStyle?: LineStyle;
}) {
  return {
    key: `line-${index}`,
    data: linePath,
    stroke: color,
    strokeWidth: seriesLineStyle ? seriesLineStyle.strokeWidth : strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}
