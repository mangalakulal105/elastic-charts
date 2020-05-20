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
 * under the License. */

import { Ratio } from '../types/geometry_types';
import { RgbTuple, RGBATupleToString } from './d3_utils';
import { Color } from '../../../../utils/commons';
import chroma from 'chroma-js';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => {
    const index = Math.round(d * 255);
    const [r, g, b, a] = colors[index];
    return colors[index].length === 3 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
  };
}

/** @internal */
export function addOpacity(hexColorString: string, opacity: Ratio) {
  // this is a super imperfect multiplicative alpha blender that assumes a "#rrggbb" or "#rrggbbaa" hexColorString
  // todo roll some proper utility that can handle "rgb(...)", "rgba(...)", "red", {r, g, b} etc.
  return opacity === 1
    ? hexColorString
    : hexColorString.slice(0, 7) +
        (hexColorString.slice(7).length === 0 || parseInt(hexColorString.slice(7, 2), 16) === 255
          ? `00${Math.round(opacity * 255).toString(16)}`.substr(-2) // color was of full opacity
          : `00${Math.round((parseInt(hexColorString.slice(7, 2), 16) / 255) * opacity * 255).toString(16)}`.substr(
              -2,
            ));
}

/** @internal */
export function arrayToLookup(keyFun: Function, array: Array<any>) {
  return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}

/** If the user specifies the background of the container in which the chart will be on, we can use that color
 * and make sure to provide optimal contrast
/** @internal */
export function combineColors(foregroundColor: Color, backgroundColor: Color) {
  const [red1, green1, blue1, alpha1] = chroma(foregroundColor).rgba();
  const [red2, green2, blue2, alpha2] = chroma(backgroundColor).rgba();

  // For reference on alpha calculations:
  // https://en.wikipedia.org/wiki/Alpha_compositing
  const combinedAlpha = alpha1 + alpha2 * (1 - alpha1);
  const combinedRed = Math.round((red1 * alpha1 + red2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedGreen = Math.round((green1 * alpha1 + green2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  const combinedBlue = Math.round((blue1 * alpha1 + blue2 * alpha2 * (1 - alpha1)) / combinedAlpha);
  return RGBATupleToString([combinedRed, combinedGreen, combinedBlue, combinedAlpha] as RgbTuple);
}

/**
 * Adjust the text color in cases black and white can't reach ideal 4.5 ratio
 * @internal
 */
export function makeHighContrastColor(foreground: Color, background: Color, ratio = 4.5) {
  // determine the lightness factor of the background color to determine whether to lighten or darken the foreground
  const lightness = chroma(background).get('hsl.l');
  let highContrastTextColor = foreground;
  const isBackgroundDark = colorIsDark(background);
  // determine whether white or black text is ideal contrast vs a grey that just passes 4.5 ratio
  if (isBackgroundDark && chroma.deltaE('black', foreground) === 0) {
    highContrastTextColor = '#fff';
  } else if (lightness > 0.5 && chroma.deltaE('white', foreground) === 0) {
    highContrastTextColor = '#000';
  }
  const precision = Math.pow(10, 8);
  let contrast = getContrast(highContrastTextColor, background);
  // adjust the highContrastTextColor for shades of grey
  while (contrast < ratio) {
    if (isBackgroundDark) {
      highContrastTextColor = chroma(highContrastTextColor)
        .brighten()
        .toString();
    } else {
      highContrastTextColor = chroma(highContrastTextColor)
        .darken()
        .toString();
    }
    const scaledOldContrast = Math.round(contrast * precision) / precision;
    contrast = getContrast(highContrastTextColor, background);
    const scaledContrast = Math.round(contrast * precision) / precision;
    // ideal contrast may not be possible in some cases
    if (scaledOldContrast === scaledContrast) {
      break;
    }
  }
  return highContrastTextColor.toString();
}

/**
 * show contrast amount
 * @internal
 */
export function getContrast(foregroundColor: string | chroma.Color, backgroundColor: string | chroma.Color) {
  return chroma.contrast(foregroundColor, backgroundColor);
}

/**
 * determines if the color is dark based on the luminance
 * @internal
 */
export function colorIsDark(color: Color) {
  const luminance = chroma(color).luminance();
  return luminance < 0.2;
}
