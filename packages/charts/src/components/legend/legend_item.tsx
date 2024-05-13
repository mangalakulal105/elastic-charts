/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { Component, CSSProperties } from 'react';

import { LegendTableCell } from './components/legend_table_cell';
import { LegendTableRow } from './components/legend_table_row';
import { Label as ItemLabel } from './label';
import { LegendColorPicker as LegendColorPickerComponent } from './legend_color_picker';
import { getExtra } from './utils';
import { nonNullable } from '../../chart_types/xy_chart/state/utils/get_legend_values';
import { LegendItem, LegendItemExtraValues, LegendItemValue, LegendValue } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import {
  LegendItemListener,
  BasicListener,
  LegendAction,
  LegendPositionConfig,
  LegendColorPicker,
} from '../../specs/settings';
import {
  clearTemporaryColors as clearTemporaryColorsAction,
  setTemporaryColor as setTemporaryColorAction,
  setPersistedColor as setPersistedColorAction,
} from '../../state/actions/colors';
import {
  onLegendItemOutAction,
  onLegendItemOverAction,
  onToggleDeselectSeriesAction,
} from '../../state/actions/legend';
import { LayoutDirection } from '../../utils/common';
import { deepEqual } from '../../utils/fast_deep_equal';
import { LegendLabelOptions } from '../../utils/themes/theme';

/** @internal */
export const LEGEND_HIERARCHY_MARGIN = 10;

/** @internal */
export interface SharedLegendItemProps {
  flatLegend: boolean;
  totalItems: number;
  positionConfig: LegendPositionConfig;
  extraValues: Map<string, LegendItemExtraValues>;
  legendValues: Array<LegendValue>;
  isMostlyRTL: boolean;
  labelOptions: LegendLabelOptions;
  colorPicker?: LegendColorPicker;
  action?: LegendAction;
  onClick?: LegendItemListener;
  onMouseOut?: BasicListener;
  onMouseOver?: LegendItemListener;
  mouseOutAction: typeof onLegendItemOutAction;
  mouseOverAction: typeof onLegendItemOverAction;
  clearTemporaryColorsAction: typeof clearTemporaryColorsAction;
  setTemporaryColorAction: typeof setTemporaryColorAction;
  setPersistedColorAction: typeof setPersistedColorAction;
  toggleDeselectSeriesAction: typeof onToggleDeselectSeriesAction;
}

/** @internal */
export interface LegendItemProps extends SharedLegendItemProps {
  item: LegendItem;
}

/** @internal */
export class LegendListItem extends Component<LegendItemProps> {
  static displayName = 'LegendItem';

  shouldComponentUpdate(nextProps: LegendItemProps) {
    return !deepEqual(this.props, nextProps);
  }

  onLegendItemMouseOver = () => {
    const { onMouseOver, mouseOverAction, item } = this.props;
    // call the settings listener directly if available
    if (onMouseOver) {
      onMouseOver(item.seriesIdentifiers);
    }
    mouseOverAction(item.path);
  };

  onLegendItemMouseOut = () => {
    const { onMouseOut, mouseOutAction } = this.props;
    // call the settings listener directly if available
    if (onMouseOut) {
      onMouseOut();
    }
    mouseOutAction();
  };

  /**
   * Returns click function only if toggleable or click listener is provided
   */
  onLabelToggle = (legendItemId: SeriesIdentifier[]): ((negate: boolean) => void) | undefined => {
    const { item, onClick, toggleDeselectSeriesAction, totalItems } = this.props;
    if (totalItems <= 1 || (!item.isToggleable && !onClick)) {
      return;
    }

    return (negate) => {
      if (onClick) {
        onClick(legendItemId);
      }

      if (item.isToggleable) {
        toggleDeselectSeriesAction(legendItemId, negate);
      }
    };
  };

  render() {
    const {
      extraValues,
      item,
      totalItems,
      action: Action,
      positionConfig,
      labelOptions,
      isMostlyRTL,
      flatLegend,
    } = this.props;
    const { color, isSeriesHidden, isItemHidden, seriesIdentifiers, label } = item;

    if (isItemHidden) return null;

    const itemClassNames = classNames('echLegendItem', 'echLegendItem--highlightable', {
      'echLegendItem--hidden': isSeriesHidden,
      'echLegendItem--vertical': positionConfig.direction === LayoutDirection.Vertical,
    });

    const legendValueItems = item.values
      .map((v) => {
        if (v.type === LegendValue.CurrentAndLastValue || (v && !v.type)) {
          return getExtra(extraValues, item, totalItems);
        }
        return v;
      })
      .filter(nonNullable);

    const style: CSSProperties = flatLegend
      ? {}
      : {
          [isMostlyRTL ? 'marginRight' : 'marginLeft']: LEGEND_HIERARCHY_MARGIN * (item.depth ?? 0),
        };

    return (
      <LegendTableRow
        className={itemClassNames}
        onMouseEnter={this.onLegendItemMouseOver}
        onMouseLeave={this.onLegendItemMouseOut}
        style={style}
        dir={isMostlyRTL ? 'rtl' : 'ltr'}
        data-ech-series-name={label}
      >
        <LegendTableCell className="colorWrapper">
          <LegendColorPickerComponent {...this.props} />
        </LegendTableCell>
        <LegendTableCell>
          <ItemLabel
            label={label}
            options={labelOptions}
            isToggleable={totalItems > 1 && item.isToggleable}
            onToggle={this.onLabelToggle(seriesIdentifiers)}
            isSeriesHidden={isSeriesHidden}
          />
        </LegendTableCell>

        {legendValueItems?.map((l, i) => {
          console.log(l, 'legendValueItems');
          return (
            <LegendTableCell key={l?.type || i}>
              <LegendValueComponent {...l} />
            </LegendTableCell>
          );
        })}
        <ActionComponent Action={Action} series={seriesIdentifiers} color={color} label={label} />
      </LegendTableRow>
    );
  }
}

const LegendValueComponent = ({ label }: LegendItemValue) => {
  return (
    <div className="echLegendItem__legendValue" title={`${label}`}>
      {label}
    </div>
  );
};

const ActionComponent = ({
  Action,
  series,
  color,
  label,
}: {
  Action?: LegendAction;
  series: SeriesIdentifier[];
  color: string;
  label: string;
}) => {
  if (!Action) {
    return null;
  }
  return (
    <LegendTableCell>
      <div className="echLegendItem__action">
        <Action series={series} color={color} label={label} />
      </div>
    </LegendTableCell>
  );
};
