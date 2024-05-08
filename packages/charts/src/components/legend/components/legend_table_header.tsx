/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LegendTableCell } from './legend_table_cell';
import { LegendTableRow } from './legend_table_row';
import { legendValueTitlesMap } from '../../../chart_types/xy_chart/state/utils/get_legend_values';
import { LegendValue } from '../../../common/legend';

/** @internal */
export interface LegendHeaderProps {
  legendValues: Array<LegendValue>;
  hasAction?: boolean;
}

/** @internal */
export const LegendTableHeader = ({ hasAction, legendValues }: { legendValues: LegendValue[]; hasAction: boolean }) => {
  const filteredLegendValues = legendValues.filter((v) => v !== LegendValue.CurrentAndLastValue);
  if (filteredLegendValues.length === 0) {
    return null;
  }

  return (
    <div role="rowgroup" className="echLegend__tableRowgroup echLegendHeader">
      <LegendTableRow className="echLegendItem echLegendItem--vertical">
        <LegendTableCell className="colorWrapper">{/* Color dot */}</LegendTableCell>
        <LegendTableCell>Legend</LegendTableCell>

        {legendValues.map((l) => (
          <LegendTableCell className="echLegendItem__legendValue" key={l}>
            {legendValueTitlesMap[l]}
          </LegendTableCell>
        ))}
        {hasAction && <LegendTableCell />}
      </LegendTableRow>
    </div>
  );
};
