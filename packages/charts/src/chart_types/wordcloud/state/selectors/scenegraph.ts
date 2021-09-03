/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Theme } from '../../../..';
import { Dimensions } from '../../../../utils/dimensions';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { WordcloudSpec } from '../../specs';

/** @internal */
export function render(spec: WordcloudSpec, theme: Theme, parentDimensions: Dimensions): ShapeViewModel {
  return shapeViewModel(spec, theme, parentDimensions);
}
