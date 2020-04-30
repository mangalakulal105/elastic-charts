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

import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { isLineAnnotation, AnnotationSpec } from '../../../utils/specs';
import { AnnotationId } from '../../../../../utils/ids';
import { AnnotationDimensions, AnnotationTooltipState } from '../../../annotations/types';
import { Dimensions } from '../../../../../utils/dimensions';
import { GlobalChartState, BackwardRef } from '../../../../../state/chart_state';
import { isInitialized } from '../../../../../state/selectors/is_initialized';
import { computeAnnotationDimensionsSelector } from '../../../state/selectors/compute_annotations';
import { getAnnotationSpecsSelector } from '../../../state/selectors/get_specs';
import { getAnnotationTooltipStateSelector } from '../../../state/selectors/get_annotation_tooltip_state';
import { isChartEmptySelector } from '../../../state/selectors/is_chart_empty';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { computeChartDimensionsSelector } from '../../../state/selectors/compute_chart_dimensions';
import { getFinalAnnotationTooltipPosition } from '../../../annotations/tooltip';
import { getSpecsById } from '../../../state/utils';
import { AnnotationTooltiper } from './annotation_tooltip';

interface AnnotationTooltipStateProps {
  isChartEmpty: boolean;
  tooltipState: AnnotationTooltipState | null;
  chartDimensions: Dimensions;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
}

interface AnnotationTooltipOwnProps {
  getChartContainerRef: BackwardRef;
}

type AnnotationTooltipProps = AnnotationTooltipStateProps & AnnotationTooltipOwnProps;

const AnnotationTooltipComponent = ({
  tooltipState,
  isChartEmpty,
  chartDimensions,
  annotationSpecs,
  annotationDimensions,
  getChartContainerRef,
}: AnnotationTooltipProps) => {
  if (isChartEmpty) {
    return null;
  }

  const renderAnnotationLineMarkers = useCallback(
    (annotationLines: AnnotationLineProps[], id: AnnotationId) =>
      annotationLines.reduce<JSX.Element[]>((markers, { marker }: AnnotationLineProps, index: number) => {
        if (!marker) {
          return markers;
        }

        const { icon, color, position } = marker;
        const style = {
          color,
          top: chartDimensions.top + position.top,
          left: chartDimensions.left + position.left,
        };

        markers.push(
          <div className="echAnnotation" style={{ ...style }} key={`annotation-${id}-${index}`}>
            {icon}
          </div>,
        );

        return markers;
      }, []),
    [],
  );

  const renderAnnotationMarkers = useCallback((): JSX.Element[] => {
    const markers: JSX.Element[] = [];

    annotationDimensions.forEach((dimensions: AnnotationDimensions, id: AnnotationId) => {
      const annotationSpec = getSpecsById<AnnotationSpec>(annotationSpecs, id);
      if (!annotationSpec) {
        return;
      }

      if (isLineAnnotation(annotationSpec)) {
        const annotationLines = dimensions as AnnotationLineProps[];
        const lineMarkers = renderAnnotationLineMarkers(annotationLines, id);
        markers.push(...lineMarkers);
      }
    });

    return markers;
  }, [annotationDimensions, annotationSpecs]);

  return (
    <>
      {renderAnnotationMarkers()}
      <AnnotationTooltiper state={tooltipState} chartRef={getChartContainerRef().current} />
    </>
  );
};

AnnotationTooltipComponent.displayName = 'AnnotationTooltip';

const mapStateToProps = (state: GlobalChartState): AnnotationTooltipStateProps => {
  if (!isInitialized(state)) {
    return {
      isChartEmpty: true,
      chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
      annotationDimensions: new Map(),
      annotationSpecs: [],
      tooltipState: null,
    };
  }
  return {
    isChartEmpty: isChartEmptySelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    tooltipState: getAnnotationTooltipStateSelector(state),
  };
};

/** @internal */
export const AnnotationTooltip = connect(mapStateToProps)(AnnotationTooltipComponent);
