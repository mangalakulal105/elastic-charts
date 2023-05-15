/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../common/colors';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { Pixels } from '../../common/geometry';
import { Font } from '../../common/text_utils';

/** @public */
export interface BulletGraphStyle {
  textColor: Color;
  border: Color;
  background: Color;
  barBackground: Color;
  nonFiniteText: string;
  minHeight: Pixels;
}

/** @internal */
export const LIGHT_THEME_BULLET_STYLE: BulletGraphStyle = {
  textColor: '#343741',
  border: '#EDF0F5',
  barBackground: '#343741',
  background: '#FFFFFF',
  nonFiniteText: 'N/A',
  minHeight: 64,
};

/** @internal */
export const DARK_THEME_BULLET_STYLE: BulletGraphStyle = {
  textColor: '#E0E5EE',
  border: '#343741',
  barBackground: '#FFF',
  background: '#1D1E23',
  nonFiniteText: 'N/A',
  minHeight: 64,
};

/** @internal */
export const TITLE_FONT: Font = {
  fontStyle: 'normal',
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 'bold',
  textColor: 'black',
};
/** @internal */
export const TITLE_FONT_SIZE = 16;
/** @internal */
export const TITLE_LINE_HEIGHT = 19;

/** @internal */
export const SUBTITLE_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};
/** @internal */
export const SUBTITLE_FONT_SIZE = 14;
/** @internal */
export const SUBTITLE_LINE_HEIGHT = 16;

/** @internal */
export const VALUE_FONT: Font = {
  ...TITLE_FONT,
};
/** @internal */
export const VALUE_FONT_SIZE = 22;
/** @internal */
export const VALUE_LINE_HEIGHT = 22;

/** @internal */
export const TARGET_FONT: Font = {
  ...SUBTITLE_FONT,
};
/** @internal */
export const TARGET_FONT_SIZE = 16;
/** @internal */
export const TARGET_LINE_HEIGHT = 16;

/** @internal */
export const TICK_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};
/** @internal */
export const TICK_FONT_SIZE = 10;

/** @internal */
export const HEADER_PADDING: [number, number, number, number] = [8, 8, 8, 8];
/** @internal */
export const GRAPH_PADDING: [number, number, number, number] = [8, 8, 8, 8];
