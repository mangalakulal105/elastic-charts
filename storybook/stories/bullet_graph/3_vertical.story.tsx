/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example = () => {
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.horizontal);

  return (
    <div
      style={{
        padding: '0px',
        width: 500,
        height: 375,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
      className="resizable"
    >
      <Chart>
        <Settings baseTheme={useBaseTheme()} />
        <BulletGraph
          id="bubbles"
          subtype={subtype}
          data={[
            [
              {
                ticks: 'auto',
                value: 1320,
                title: 'Total requests',
                domain: { min: 0, max: 2000, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
            ],
            [
              {
                ticks: 'auto',
                target: 150,
                value: 483,
                title: 'Erroring Request duration millis',
                subtitle: '90th percentile',
                domain: { min: 0, max: 500, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
            ],
            [
              {
                ticks: 'auto',
                value: 12,
                title: 'Error rate',
                subtitle: 'percentage',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}%`,
                tickFormatter: (d) => `${d}%`,
              },
            ],
          ]}
        />
      </Chart>
    </div>
  );
};
