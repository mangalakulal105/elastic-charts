/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartId } from '../../../../state/chart_state';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { ContinuousDomainFocus } from './partition';

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);

const MAX_PADDING_RATIO = 0.25;

const latestRafs: Map<ChartId, number> = new Map();

/** @internal */
export function renderLinearPartitionCanvas2d(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  {
    config: { sectorLineWidth: padding, width: containerWidth, height: containerHeight, animation },
    quadViewModel,
    diskCenter,
    width: panelWidth,
    height: panelHeight,
    layers,
  }: ShapeViewModel,
  { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 }: ContinuousDomainFocus,
  chartId: ChartId,
) {
  if (animation?.duration) {
    const latestRaf = latestRafs.get(chartId);
    if (latestRaf !== undefined) {
      window.cancelAnimationFrame(latestRaf);
    }
    render(0);
    const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
    if (focusChanged) {
      latestRafs.set(
        chartId,
        window.requestAnimationFrame((epochStartTime) => {
          const anim = (t: number) => {
            const unitNormalizedTime = Math.max(0, Math.min(1, (t - epochStartTime) / animation.duration));
            render(unitNormalizedTime);
            if (unitNormalizedTime < 1) {
              latestRafs.set(chartId, window.requestAnimationFrame(anim));
            }
          };
          latestRafs.set(chartId, window.requestAnimationFrame(anim));
        }),
      );
    }
  } else {
    render(1);
  }

  function render(
    logicalTime: number,
    timeFunction: (time: number) => number = animation.duration
      ? easeInOut(Math.min(5, animation.duration / 100))
      : linear,
  ) {
    const width = containerWidth * panelWidth;
    const height = containerHeight * panelHeight;
    const t = timeFunction(logicalTime);
    const focusX0 = t * currentFocusX0 + (1 - t) * prevFocusX0 || 0;
    const focusX1 = t * currentFocusX1 + (1 - t) * prevFocusX1 || 0;
    const scale = containerWidth / (focusX1 - focusX0);

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.scale(dpr, dpr);
    ctx.translate(diskCenter.x, diskCenter.y);
    ctx.clearRect(0, 0, width, height);

    quadViewModel.forEach(({ fillColor, x0, x1, y0px: y0, y1px: y1, dataName, textColor, depth }) => {
      if (y1 - y0 <= padding) return;

      const fx0 = Math.max((x0 - focusX0) * scale, 0);
      const fx1 = Math.min((x1 - focusX0) * scale, width);

      if (fx1 < 0 || fx0 > width) return;

      const formatter = layers[depth]?.nodeLabel ?? String;
      const label = formatter(dataName);
      const fWidth = fx1 - fx0;
      const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.rect(fx0 + fPadding, y0 + padding / 2, fWidth - fPadding, y1 - y0 - padding);
      ctx.fill();
      if (textColor === 'transparent' || label === '' || fWidth < 4) return;
      ctx.fillStyle = textColor;
      ctx.save();
      ctx.clip(); // undoing a clip needs context save/restore, which is why it's wrapped in a save/restore
      ctx.fillText(label, fx0 + 3 * fPadding, (y0 + y1) / 2);
      ctx.restore();
    });

    ctx.restore();
  }
}
