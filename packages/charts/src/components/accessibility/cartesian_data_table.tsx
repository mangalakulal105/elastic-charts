/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, memo, useState } from 'react';
import { connect } from 'react-redux';

import {
  getScreenReaderDataSelector,
  CartesianData,
} from '../../chart_types/xy_chart/state/selectors/get_screen_reader_data';
import { SettingsSpec } from '../../specs/settings';
import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { isNil } from '../../utils/common';

interface ScreenReaderCartesianTableProps {
  a11ySettings: A11ySettings;
  cartesianData: CartesianData;
  debug: SettingsSpec['debug'];
}

const ScreenReaderCartesianTableComponent = ({
  a11ySettings,
  cartesianData,
  debug,
}: ScreenReaderCartesianTableProps) => {
  const [count, setCount] = useState(1);
  const tableRowRef = createRef<HTMLTableRowElement>();
  const { tableCaption } = a11ySettings;

  const rowLimit = cartesianData.numberOfItemsInGroup * count;
  const handleMoreData = () => {
    setCount(count + 1);
    // generate the next group of data
    if (tableRowRef.current) {
      tableRowRef.current.focus();
    }
  };

  const { isSmallMultiple, data } = cartesianData;
  const tableLength = data[0].values.length;
  const showMoreRows = rowLimit < tableLength;
  let countOfCol: number = 3;
  const totalColumns: number = isSmallMultiple ? (countOfCol += 3) : countOfCol;

  return (
    <div className={`echScreenReaderOnly ${debug ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable`}>
      <table>
        <caption>
          {isNil(tableCaption)
            ? `The table ${
                showMoreRows
                  ? `represents only ${rowLimit} of the ${tableLength} data points`
                  : `fully represents the dataset of ${tableLength} data point${tableLength > 1 ? 's' : ''}`
              }`
            : tableCaption}
        </caption>
        <thead>
          <tr>
            {isSmallMultiple && <th scope="col">Small multiple title</th>}
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>

        <tbody>
          {cartesianData.data.map(({ label, values }, index) => {
            return (
              <tr key={Math.random()}>
                <th scope="row">{label}</th>
                <td>{values[index].formatted}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={totalColumns}>
              <button type="submit" onClick={() => handleMoreData()} tabIndex={-1}>
                Click to show more data
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  cartesianData: {
    isSmallMultiple: false,
    hasAxes: false,
    data: [],
    numberOfItemsInGroup: 0,
  },
  debug: false,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderCartesianTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    cartesianData: getScreenReaderDataSelector(state),
    debug: getSettingsSpecSelector(state).debug,
  };
};
/** @internal */
export const ScreenReaderCartesianTable = memo(connect(mapStateToProps)(ScreenReaderCartesianTableComponent));
