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

import { Rect } from '../../../../geoms/types';
import { withContext, renderLayers, clearCanvas } from '../../../../renderers/canvas';
import { stringToRGB } from '../../../partition_chart/layout/utils/color_library_wrappers';
import { renderAnnotations } from './annotations';
import { renderAreas } from './areas';
import { renderAxes } from './axes';
import { renderBars } from './bars';
import { renderBubbles } from './bubbles';
import { renderGrids } from './grids';
import { renderLines } from './lines';
import { renderGridPanels } from './panels/panels';
import { renderDebugRect } from './utils/debug';
import { renderBarValues } from './values/bar';
import { ReactiveChartStateProps } from './xy_chart';

/** @internal */
export function renderXYChartCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  clippings: Rect,
  props: ReactiveChartStateProps,
) {
  withContext(ctx, (ctx) => {
    // let's set the devicePixelRatio once and for all; then we'll never worry about it again
    ctx.scale(dpr, dpr);
    const {
      chartDimensions,
      chartTransform,
      chartRotation,
      geometries,
      geometriesIndex,
      theme,
      highlightedLegendItem,
      annotationDimensions,
      annotationSpecs,
      perPanelAxisGeoms,
      perPanelGridLines,
      axesSpecs,
      axesStyles,
      debug,
      panelGeoms,
    } = props;
    const transform = {
      x: chartDimensions.left + chartTransform.x,
      y: chartDimensions.top + chartTransform.y,
    };
    // painter's algorithm, like that of SVG: the sequence determines what overdraws what; first element of the array is drawn first
    // (of course, with SVG, it's for ambiguous situations only, eg. when 3D transforms with different Z values aren't used, but
    // unlike SVG and esp. WebGL, Canvas2d doesn't support the 3rd dimension well, see ctx.transform / ctx.setTransform).
    // The layers are callbacks, because of the need to not bake in the `ctx`, it feels more composable and uncoupled this way.
    renderLayers(ctx, [
      // clear the canvas
      (ctx: CanvasRenderingContext2D) => clearCanvas(ctx, 200000, 200000),
      // render panel grid
      (ctx: CanvasRenderingContext2D) => {
        if (debug) {
          renderGridPanels(ctx, transform, panelGeoms);
        }
      },
      (ctx: CanvasRenderingContext2D) => {
        renderAxes(ctx, {
          axesSpecs,
          perPanelAxisGeoms,
          chartDimensions,
          debug,
          axesStyles,
          sharedAxesStyle: theme.axes,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        renderGrids(ctx, {
          axesSpecs,
          chartDimensions,
          perPanelGridLines,
          axesStyles,
          sharedAxesStyle: theme.axes,
        });
      },
      // rendering background annotations
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          renderAnnotations(
            ctx,
            {
              rotation: chartRotation,
              renderingArea: chartDimensions,
              annotationDimensions,
              annotationSpecs,
            },
            true,
          );
        });
      },

      // rendering bars
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          renderBars(
            ctx,
            geometries.bars,
            theme.sharedStyle,
            clippings,
            chartDimensions,
            highlightedLegendItem,
            chartRotation,
          );
        });
      },
      // rendering areas
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          renderAreas(ctx, {
            areas: geometries.areas,
            clippings,
            chartDimensions,
            rotation: chartRotation,
            highlightedLegendItem,
            sharedStyle: theme.sharedStyle,
          });
        });
      },
      // rendering lines
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          renderLines(ctx, {
            lines: geometries.lines,
            clippings,
            chartDimensions,
            rotation: chartRotation,
            highlightedLegendItem,
            sharedStyle: theme.sharedStyle,
          });
        });
      },
      // rendering bubbles
      (ctx: CanvasRenderingContext2D) => {
        renderBubbles(ctx, {
          bubbles: geometries.bubbles,
          clippings,
          highlightedLegendItem,
          sharedStyle: theme.sharedStyle,
          rotation: chartRotation,
          renderingArea: chartDimensions,
        });
      },
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          ctx.translate(transform.x, transform.y);
          ctx.rotate((chartRotation * Math.PI) / 180);
          renderBarValues(ctx, {
            bars: geometries.bars.flatMap(({ value }) => value),
            chartDimensions,
            chartRotation,
            debug,
            theme,
          });
        });
      },
      // rendering foreground annotations
      (ctx: CanvasRenderingContext2D) => {
        withContext(ctx, (ctx) => {
          renderAnnotations(
            ctx,
            {
              annotationDimensions,
              annotationSpecs,
              rotation: chartRotation,
              renderingArea: chartDimensions,
            },
            false,
          );
        });
      },
      // rendering debugger
      (ctx: CanvasRenderingContext2D) => {
        if (!debug) {
          return;
        }
        withContext(ctx, (ctx) => {
          const { left, top, width, height } = chartDimensions;

          renderDebugRect(
            ctx,
            {
              x: left,
              y: top,
              width,
              height,
            },
            {
              color: stringToRGB('transparent'),
            },
            {
              color: stringToRGB('red'),
              width: 4,
              dash: [4, 4],
            },
          );

          const triangulation = geometriesIndex.triangulation([0, 0, width, height]);

          if (triangulation) {
            ctx.beginPath();
            ctx.translate(left, top);
            ctx.setLineDash([5, 5]);
            triangulation.render(ctx);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
          }
        });
      },
    ]);
  });
}
