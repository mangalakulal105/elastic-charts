/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Render, Texture } from '../../../common/kingly';
import { ColumnarViewModel } from '../flame_api';
import { roundUpSize } from './common';
import { drawRect, drawCanvas2d } from './draw_canvas';
import { drawWebgl } from './draw_webgl';

const CHART_BOX_LINE_WIDTH = 0.5;
const MINIMAP_SIZE_RATIO_X = 3;
const MINIMAP_SIZE_RATIO_Y = 3;
const MINIMAP_FOCUS_BOX_LINE_WIDTH = 1;
const MINIMAP_BOX_LINE_WIDTH = 1;
const PADDING_TOP = 16; // for the UI controls and the minimap protrusion
const PADDING_BOTTOM = 24; // for the UI controls and the minimap protrusion
const PADDING_LEFT = 16; // for the location indicator or edge zoom
const PADDING_RIGHT = 16; // for aesthetic purposes or edge zoom
const FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH = 0.5;
const MINIMUM_FOCUS_INDICATOR_LENGTH = 4;

/** @internal */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  gl: WebGL2RenderingContext,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  columnarGeomData: ColumnarViewModel,
  pickTexture: Texture,
  pickTextureRenderer: Render,
  roundedRectRenderer: Render,
  hoverIndex: number,
  unitRowHeight: number,
  currentColor: Float32Array,
) => (currentFocus: [number, number, number, number]) => {
  const canvasHeightExcess = (roundUpSize(cssHeight) - cssHeight) * dpr;
  const minimapHeight = cssHeight / MINIMAP_SIZE_RATIO_Y;
  const minimapWidth = cssWidth / MINIMAP_SIZE_RATIO_X;
  const minimapLeft = cssWidth - minimapWidth;
  const fullFocus: [number, number, number, number] = [0, 1, 0, 1];

  const drawnCssWidth = cssWidth;
  const drawnCanvasWidth = drawnCssWidth * dpr;
  const focusLayerCssWidth = drawnCssWidth - PADDING_LEFT - PADDING_RIGHT;
  const focusLayerCanvasWidth = focusLayerCssWidth * dpr;
  const focusLayerCanvasOffsetX = PADDING_LEFT * dpr;

  const focusLayerCssHeight = cssHeight - PADDING_TOP - PADDING_BOTTOM;

  const drawFocusLayer = (pickLayer: boolean) =>
    drawWebgl(
      gl,
      1,
      focusLayerCanvasWidth,
      focusLayerCssHeight * dpr,
      focusLayerCanvasOffsetX,
      (pickLayer ? 0 : canvasHeightExcess) + dpr * PADDING_BOTTOM,
      pickTexture,
      pickLayer ? pickTextureRenderer : roundedRectRenderer,
      hoverIndex,
      unitRowHeight,
      currentFocus,
      columnarGeomData.label.length,
      true,
      pickLayer,
    );

  const drawContextLayer = (pickLayer: boolean) =>
    drawWebgl(
      gl,
      1,
      drawnCanvasWidth / MINIMAP_SIZE_RATIO_X,
      (cssHeight * dpr) / MINIMAP_SIZE_RATIO_Y,
      drawnCanvasWidth * (1 - 1 / MINIMAP_SIZE_RATIO_X),
      pickLayer ? 0 : canvasHeightExcess,
      pickTexture,
      pickLayer ? pickTextureRenderer : roundedRectRenderer,
      hoverIndex,
      unitRowHeight,
      fullFocus,
      columnarGeomData.label.length,
      false,
      pickLayer,
    );

  // base (focus) layer
  drawFocusLayer(false);

  drawCanvas2d(
    ctx,
    1,
    focusLayerCssWidth,
    focusLayerCssHeight,
    PADDING_LEFT,
    PADDING_TOP,
    dpr,
    columnarGeomData,
    unitRowHeight,
    currentFocus,
    currentColor,
  );

  // minimap geoms
  drawContextLayer(false);

  // base (focus) pick layer
  drawFocusLayer(true);

  // minimap pick layer
  drawContextLayer(true);

  // focus chart border
  drawRect(
    ctx,
    focusLayerCssWidth,
    focusLayerCssHeight,
    PADDING_LEFT,
    focusLayerCssHeight + PADDING_TOP,
    dpr,
    fullFocus,
    '',
    'black',
    CHART_BOX_LINE_WIDTH,
  );

  // focus chart horizontal placeholder
  drawRect(
    ctx,
    focusLayerCssWidth,
    0,
    PADDING_LEFT,
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
    dpr,
    fullFocus,
    '',
    'lightgrey',
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
  );

  // focus chart horizontal focus indicator
  drawRect(
    ctx,
    Math.max(MINIMUM_FOCUS_INDICATOR_LENGTH, focusLayerCssWidth * (currentFocus[1] - currentFocus[0])),
    0,
    PADDING_LEFT + focusLayerCssWidth * currentFocus[0],
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
    dpr,
    fullFocus,
    '',
    'black',
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
  );

  // focus chart vertical placeholder
  drawRect(
    ctx,
    0,
    focusLayerCssHeight,
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
    focusLayerCssHeight + PADDING_TOP,
    dpr,
    fullFocus,
    '',
    'lightgrey',
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
  );

  // focus chart vertical focus indicator
  drawRect(
    ctx,
    0,
    Math.max(MINIMUM_FOCUS_INDICATOR_LENGTH, focusLayerCssHeight * (currentFocus[3] - currentFocus[2])),
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH / 2,
    focusLayerCssHeight * (1 - currentFocus[2]) + PADDING_TOP,
    dpr,
    fullFocus,
    '',
    'black',
    FOCUS_INDICATOR_PLACEHOLDER_LINE_WIDTH,
  );

  // minimap box - erase Canvas2d text from the main chart that falls within the minimap area
  drawRect(ctx, minimapWidth, minimapHeight, minimapLeft, cssHeight, dpr, fullFocus, 'rgba(255,255,255,1)', '', 0);

  // minimap box - make the Canvas2d transparent, so that the webgl layer underneath (minimap geoms) show up
  drawRect(ctx, minimapWidth, minimapHeight, minimapLeft, cssHeight, dpr, fullFocus, 'transparent', '', 0);

  // minimap focus border
  drawRect(
    ctx,
    minimapWidth,
    minimapHeight,
    minimapLeft,
    cssHeight,
    dpr,
    currentFocus,
    '',
    'magenta',
    MINIMAP_FOCUS_BOX_LINE_WIDTH,
  );

  // minimap box rectangle
  drawRect(
    ctx,
    minimapWidth,
    minimapHeight,
    minimapLeft,
    cssHeight,
    dpr,
    fullFocus,
    '',
    'black',
    MINIMAP_BOX_LINE_WIDTH,
  );
};
