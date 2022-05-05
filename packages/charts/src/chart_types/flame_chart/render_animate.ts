/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LabelAccessor } from '../../utils/common';
import { renderer } from './render_draw';
import { AnimationState, ContinuousDomainFocus, GLResources } from './types';

const linear = (x: number) => x;
const easeInOut = (alpha: number) => (x: number) => x ** alpha / (x ** alpha + (1 - x) ** alpha);

/** @internal */
export function webglRender(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  containerWidth: number,
  containerHeight: number,
  animationDuration: number,
  focus: ContinuousDomainFocus,
  hoverIndex: number,
  animationState: AnimationState,
  glResources: GLResources,
  inTween: boolean,
) {
  const { gl, columnarGeomData, roundedRectRenderer, pickTextureRenderer, pickTexture } = glResources;
  if (!gl || !pickTexture) return;
  const { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 } = focus;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const formatter: LabelAccessor = (v) => `${v}`; // todo add a proper formatter option to the APL
  const timeFunction = animationDuration > 0 ? easeInOut(Math.min(5, animationDuration / 100)) : linear;

  const render = renderer(
    ctx,
    gl,
    focus,
    containerWidth,
    containerHeight,
    dpr,
    columnarGeomData,
    formatter,
    pickTexture,
    pickTextureRenderer,
    roundedRectRenderer,
    hoverIndex,
  );

  window.cancelAnimationFrame(animationState.rafId); // todo consider deallocating/reallocating or ensuring resources upon cancellation
  if (animationDuration > 0 && inTween) {
    render(0);
    const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
    if (focusChanged) {
      animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
        const anim = (t: number) => {
          const unitNormalizedTime = Math.max(0, (t - epochStartTime) / animationDuration);
          render(timeFunction(Math.min(1, unitNormalizedTime)));
          if (unitNormalizedTime <= 1) {
            animationState.rafId = window.requestAnimationFrame(anim);
          }
        };
        animationState.rafId = window.requestAnimationFrame(anim);
      });
    }
  } else {
    render(1);
  }
}
