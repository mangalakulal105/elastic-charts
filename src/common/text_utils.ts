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

import { $Values as Values } from 'utility-types';

import { ArrayEntry } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { Datum } from '../utils/common';
import { Pixels } from './geometry';
import { integerSnap, monotonicHillClimb } from './optimize';

export const FONT_VARIANTS = Object.freeze(['normal', 'small-caps'] as const);
export type FontVariant = typeof FONT_VARIANTS[number];
export const FONT_WEIGHTS = Object.freeze([
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
  'normal',
  'bold',
  'lighter',
  'bolder',
  'inherit',
  'initial',
  'unset',
] as const);
export type FontWeight = typeof FONT_WEIGHTS[number];
export type NumericFontWeight = number & typeof FONT_WEIGHTS[number];
export const FONT_STYLES = Object.freeze(['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset'] as const);
export type FontStyle = typeof FONT_STYLES[number];

// this doesn't include the font size, so it's more like a font face (?) - unfortunately all vague terms
export interface Font {
  fontStyle: FontStyle;
  fontVariant: FontVariant;
  fontWeight: FontWeight;
  fontFamily: FontFamily;
  textColor: string;
  textOpacity: number;
}

export type PartialFont = Partial<Font>;
export const TEXT_ALIGNS = Object.freeze(['start', 'end', 'left', 'right', 'center'] as const);
export type TextAlign = typeof TEXT_ALIGNS[number];
export const TEXT_BASELINE = Object.freeze([
  'top',
  'hanging',
  'middle',
  'alphabetic',
  'ideographic',
  'bottom',
] as const);
export type TextBaseline = typeof TEXT_BASELINE[number];

/** potential internal */
export interface Box extends Font {
  text: string;
}

export type Relation = Array<Datum>;

export interface Origin {
  x0: number;
  y0: number;
}

export interface Rectangle extends Origin {
  x1: number;
  y1: number;
}

export interface Part extends Rectangle {
  node: ArrayEntry;
}

/** potential internal */
export type TextMeasure = (fontSize: number, boxes: Box[]) => TextMetrics[];

/** @internal */
export function cssFontShorthand({ fontStyle, fontVariant, fontWeight, fontFamily }: Font, fontSize: Pixels) {
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

/** @internal */
export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  return (fontSize: number, boxes: Box[]): TextMetrics[] =>
    boxes.map((box: Box) => {
      ctx.font = cssFontShorthand(box, fontSize);
      return ctx.measureText(box.text);
    });
}

/**
 * todo consider doing tighter control for permissible font families, eg. as in Kibana Canvas - expression language
 *  - though the same applies for permissible (eg. known available or loaded) font weights, styles, variants...
 */
export type FontFamily = string;

/** potential internal */
export type TextContrast = boolean | number;

export const VerticalAlignments = Object.freeze({
  top: 'top' as const,
  middle: 'middle' as const,
  bottom: 'bottom' as const,
  alphabetic: 'alphabetic' as const,
  hanging: 'hanging' as const,
  ideographic: 'ideographic' as const,
});

export type VerticalAlignments = Values<typeof VerticalAlignments>;

/** internal */
export function measureOneBoxWidth(measure: TextMeasure, fontSize: number, box: Box) {
  return measure(fontSize, [box])[0].width;
}

/** internal */
export function cutToLength(s: string, maxLength: number) {
  return s.length <= maxLength ? s : `${s.slice(0, Math.max(0, maxLength - 1))}…`; // ellipsis is one char
}

/** internal */
export function fitText(
  measure: TextMeasure,
  desiredText: string,
  allottedWidth: number,
  fontSize: number,
  font: Font,
) {
  const desiredLength = desiredText.length;
  const response = (v: number) => measure(fontSize, [{ ...font, text: desiredText.slice(0, Math.max(0, v)) }])[0].width;
  const visibleLength = monotonicHillClimb(response, desiredLength, allottedWidth, integerSnap);
  const text = visibleLength < 2 && desiredLength >= 2 ? '' : cutToLength(desiredText, visibleLength);
  const { width, emHeightAscent, emHeightDescent } = measure(fontSize, [{ ...font, text }])[0];
  return {
    width,
    verticalOffset: -(emHeightDescent + emHeightAscent) / 2, // meaning, `middle`
    text,
  };
}
