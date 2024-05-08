/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import euiDarkVars from '@elastic/eui/dist/eui_theme_dark.json';
import React from 'react';

import { LegendTableBody } from './legend_table_body';
import { LegendTableHeader } from './legend_table_header';
import { LegendItem } from '../../../common/legend';
import { SharedLegendItemProps } from '../legend_item';
import { LegendListStyle } from '../style_utils';

/** @internal */
export interface LegendTableProps extends SharedLegendItemProps {
  items: LegendItem[];
  listStyle: LegendListStyle;
}

/** @internal */
export function LegendTable({ items, listStyle, ...itemProps }: LegendTableProps) {
  const gridRowLength = (itemProps.action ? 1 : 0) + (items?.[0]?.values.length ?? 0);
  return (
    <div className="echLegend__tableContainer">
      <div
        className="echLegend__table"
        role="table"
        style={{
          ...listStyle,
          gridTemplateColumns: `${euiDarkVars.euiSizeM} minmax(100px, 1fr) repeat(${gridRowLength}, auto)`,
        }}
      >
        <LegendTableHeader hasAction={!!itemProps.action} legendValues={itemProps.legendValues} />
        <LegendTableBody items={items} {...itemProps} />
      </div>
    </div>
  );
}
