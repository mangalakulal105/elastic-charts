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
import React, { FC } from 'react';

import { Dimensions } from '../../../../utils/dimensions';
import { DragShape, nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';

/** @internal */
export interface HighlighterCellsProps {
  chartId: string;
  initialized: boolean;
  canvasDimension: Dimensions;
  geometries: ShapeViewModel;
  dragShape: DragShape;
}

/**
 * @internal
 *
 * Component for highlighting selected cells
 */
export const HighlighterCellsComponent: FC<HighlighterCellsProps> = ({
  initialized,
  dragShape,
  chartId,
  canvasDimension,
}) => {
  if (!initialized || dragShape === null) return null;

  const maskId = `echHighlighterMask__${chartId}`;

  return (
    <svg className="echHighlighter" width="100%" height="100%">
      <defs>
        <mask id={maskId}>
          <rect x={0} y={0} width={canvasDimension.width} height={canvasDimension.height} fill="#eee" />
          <rect x={dragShape.x} y={dragShape.y} width={dragShape.width} height={dragShape.height} fill="black" />
          <rect x={0} y={dragShape.y} width={canvasDimension.left} height={dragShape.height} fill="black" />
        </mask>
      </defs>
      <g>
        <rect
          x={0}
          y={0}
          width={canvasDimension.width}
          height={canvasDimension.height}
          mask={`url(#${maskId})`}
          className="echHighlighter__mask"
        />
      </g>
    </svg>
  );
};

/** @internal */
export const DEFAULT_PROPS: HighlighterCellsProps = {
  chartId: 'empty',
  initialized: false,
  canvasDimension: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  geometries: nullShapeViewModel(),
  dragShape: { x: 0, y: 0, height: 0, width: 0 },
};
