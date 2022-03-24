/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Rotation } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { AnnotationId } from '../../../../../utils/ids';
import {
  mergeWithDefaultAnnotationLine,
  mergeWithDefaultAnnotationRect,
} from '../../../../../utils/themes/merge_utils';
import { SharedGeometryStateStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnnotationRectProps } from '../../../annotations/rect/types';
import { AnnotationDimensions } from '../../../annotations/types';
import { getSpecsById } from '../../../state/utils/spec';
import { AnnotationSpec, isLineAnnotation, isRectAnnotation } from '../../../utils/specs';
import { getAnnotationHoverStylesFn } from '../../common/utils';
import { AnimationContext } from '../animations';
import { renderLineAnnotations } from './lines';
import { renderRectAnnotations } from './rect';

interface AnnotationProps {
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  rotation: Rotation;
  renderingArea: Dimensions;
  sharedStyle: SharedGeometryStateStyle;
  hoveredAnnotationIds: string[];
}

/** @internal */
export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  aCtx: AnimationContext,
  {
    annotationDimensions,
    annotationSpecs,
    rotation,
    renderingArea,
    sharedStyle,
    hoveredAnnotationIds,
  }: AnnotationProps,
  renderOnBackground: boolean = true,
) {
  const getHoverStyle = getAnnotationHoverStylesFn(hoveredAnnotationIds, sharedStyle);
  annotationDimensions.forEach((annotation, id) => {
    const spec = getSpecsById<AnnotationSpec>(annotationSpecs, id);
    const isBackground = (spec?.zIndex ?? 0) <= 0;
    if (spec && isBackground === renderOnBackground) {
      if (isLineAnnotation(spec)) {
        const lineStyle = mergeWithDefaultAnnotationLine(spec.style);
        renderLineAnnotations(
          ctx,
          aCtx,
          annotation as AnnotationLineProps[],
          lineStyle,
          getHoverStyle,
          rotation,
          renderingArea,
        );
      } else if (isRectAnnotation(spec)) {
        const rectStyle = mergeWithDefaultAnnotationRect(spec.style);
        renderRectAnnotations(
          ctx,
          aCtx,
          annotation as AnnotationRectProps[],
          rectStyle,
          getHoverStyle,
          rotation,
          renderingArea,
        );
      }
    }
  });
}
