/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ConfigItem, configMap } from '../../../../common/config_objects';
import { TAU } from '../../../../common/constants';
import { Config } from '../types/config_types';

/** @internal */
export const configMetadata: Record<string, ConfigItem> = {
  angleStart: { dflt: Math.PI + Math.PI / 4, min: -TAU, max: TAU, type: 'number' },
  angleEnd: { dflt: -Math.PI / 4, min: -TAU, max: TAU, type: 'number' },

  // shape geometry
  width: { dflt: 300, min: 0, max: 1024, type: 'number', reconfigurable: false },
  height: { dflt: 150, min: 0, max: 1024, type: 'number', reconfigurable: false },
  margin: {
    type: 'group',
    values: {
      left: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
      right: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
      top: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
      bottom: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
    },
  },

  // general text config
  fontFamily: {
    dflt: 'Sans-Serif',
    type: 'string',
  },

  // fill text config
  minFontSize: { dflt: 8, min: 0.1, max: 8, type: 'number', reconfigurable: true },
  maxFontSize: { dflt: 64, min: 0.1, max: 64, type: 'number' },

  backgroundColor: { dflt: '#ffffff', type: 'color' },
  sectorLineWidth: { dflt: 1, min: 0, max: 4, type: 'number' },
};

/** @internal */
export const config: Config = configMap<Config>((item: ConfigItem) => item.dflt, configMetadata);
