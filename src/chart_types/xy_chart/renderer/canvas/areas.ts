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

import { LegendItem } from '../../../../commons/legend';
import { Rect } from '../../../../geoms/types';
import { withClip, withContext } from '../../../../renderers/canvas';
import { Rotation } from '../../../../utils/commons';
import { Dimensions } from '../../../../utils/dimensions';
import { AreaGeometry, PerPanel } from '../../../../utils/geometry';
import { SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { getGeometryStateStyle } from '../../rendering/rendering';
import { renderPoints } from './points';
import { renderLinePaths, renderAreaPath } from './primitives/path';
import { buildAreaStyles } from './styles/area';
import { buildLineStyles } from './styles/line';
import { withPanelTransform } from './utils/panel_transform';

interface AreaGeometriesProps {
  areas: Array<PerPanel<AreaGeometry>>;
  sharedStyle: SharedGeometryStateStyle;
  rotation: Rotation;
  chartDimensions: Dimensions;
  highlightedLegendItem?: LegendItem;
  clippings: Rect;
}

/** @internal */
export function renderAreas(ctx: CanvasRenderingContext2D, props: AreaGeometriesProps) {
  const { sharedStyle, highlightedLegendItem, areas, clippings, rotation, chartDimensions } = props;

  withContext(ctx, (ctx) => {
    // withClip(ctx, clippings, (ctx: CanvasRenderingContext2D) => {
    //   ctx.save();

    // eslint-disable-next-line no-restricted-syntax
    areas.forEach(({ panel, value: area }) => {
      const { seriesAreaLineStyle, seriesAreaStyle } = area;
      if (seriesAreaStyle.visible) {
        withPanelTransform(ctx, panel, rotation, chartDimensions, (ctx) => {
          renderArea(ctx, area, sharedStyle, clippings, highlightedLegendItem);
        });
      }
      if (seriesAreaLineStyle.visible) {
        withPanelTransform(ctx, panel, rotation, chartDimensions, (ctx) => {
          renderAreaLines(ctx, area, sharedStyle, clippings, highlightedLegendItem);
        });
      }
    });
    //   ctx.rect(clippings.x, clippings.y, clippings.width, clippings.height);
    //   ctx.clip();
    //   ctx.restore();
    // });

    areas.forEach(({ panel, value: area }) => {
      const { seriesPointStyle, seriesIdentifier } = area;
      if (seriesPointStyle.visible) {
        return;
      }
      const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
      withPanelTransform(ctx, panel, rotation, chartDimensions, (ctx) => {
        withClip(
          ctx,
          clippings,
          (ctx) => {
            renderPoints(ctx, area.points, seriesPointStyle, geometryStateStyle);
          },
          // TODO: add padding over clipping
          area.points[0]?.value.mark !== null,
        );
      });
    });
  });
}

function renderArea(
  ctx: CanvasRenderingContext2D,
  glyph: AreaGeometry,
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const { area, color, transform, seriesIdentifier, seriesAreaStyle, clippedRanges, hideClippedRanges } = glyph;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const fill = buildAreaStyles(color, seriesAreaStyle, geometryStateStyle);
  renderAreaPath(ctx, transform, area, fill, clippedRanges, clippings, hideClippedRanges);
}

function renderAreaLines(
  ctx: CanvasRenderingContext2D,
  glyph: AreaGeometry,
  sharedStyle: SharedGeometryStateStyle,
  clippings: Rect,
  highlightedLegendItem?: LegendItem,
) {
  const { lines, color, seriesIdentifier, transform, seriesAreaLineStyle, clippedRanges, hideClippedRanges } = glyph;
  const geometryStateStyle = getGeometryStateStyle(seriesIdentifier, sharedStyle, highlightedLegendItem);
  const stroke = buildLineStyles(color, seriesAreaLineStyle, geometryStateStyle);
  renderLinePaths(ctx, transform, lines, stroke, clippedRanges, clippings, hideClippedRanges);
}
