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

import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import React, { memo, useCallback, useMemo, useEffect } from 'react';

import { TooltipInfo, TooltipAnchorPosition } from './types';
import { TooltipValueFormatter, TooltipSettings, TooltipValue } from '../../specs';
import { Portal, PopperSettings, AnchorPosition } from '../portal';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getTooltipHeaderFormatterSelector } from '../../state/selectors/get_tooltip_header_formatter';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { GlobalChartState, BackwardRef } from '../../state/chart_state';
import { getInternalIsInitializedSelector } from '../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { onPointerMove } from '../../state/actions/mouse';

interface TooltipDispatchProps {
  onPointerMove: typeof onPointerMove;
}

interface TooltipStateProps {
  isVisible: boolean;
  position: TooltipAnchorPosition | null;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
  settings: TooltipSettings;
  chartId: string;
}

interface TooltipOwnProps {
  getChartContainerRef: BackwardRef;
}

type TooltipProps = TooltipDispatchProps & TooltipStateProps & TooltipOwnProps;

const TooltipComponent = ({
  info,
  headerFormatter,
  position,
  getChartContainerRef,
  settings,
  isVisible,
  chartId,
  onPointerMove,
}: TooltipProps) => {
  const chartRef = getChartContainerRef();

  const handleScroll = () => {
    // TODO: handle scroll cursor update
    onPointerMove({ x: -1, y: -1 }, new Date().getTime());
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const renderHeader = useCallback(
    (header: TooltipValue | null) => {
      if (!header || !header.isVisible) {
        return null;
      }

      return <div className="echTooltip__header">{headerFormatter ? headerFormatter(header) : header.value}</div>;
    },
    [info?.header?.value, info?.header?.isVisible],
  );

  const renderValues = (values: TooltipValue[]) => (
    <div className="echTooltip__list">
      {values.map(
        ({ seriesIdentifier, valueAccessor, label, value, markValue, color, isHighlighted, isVisible }, index) => {
          if (!isVisible) {
            return null;
          }
          const classes = classNames('echTooltip__item', {
            /* eslint @typescript-eslint/camelcase:0 */
            echTooltip__rowHighlighted: isHighlighted,
          });
          return (
            <div
              // NOTE: temporary to avoid errors
              key={`${seriesIdentifier.key}__${valueAccessor}__${index}`}
              className={classes}
              style={{
                borderLeftColor: color,
              }}
            >
              <span className="echTooltip__label">{label}</span>
              <span className="echTooltip__value">{value}</span>
              {markValue && <span className="echTooltip__markValue">&nbsp;({markValue})</span>}
            </div>
          );
        },
      )}
    </div>
  );

  const renderTooltip = () => {
    if (!info || !isVisible) {
      return null;
    }

    if (typeof settings !== 'string' && settings?.customTooltip) {
      const CustomTooltip = settings.customTooltip;
      return <CustomTooltip {...info} />;
    }

    return (
      <div className="echTooltip">
        {renderHeader(info.header)}
        {renderValues(info.values)}
      </div>
    );
  };

  const anchorPosition = useMemo((): AnchorPosition | null => {
    if (!isVisible) return null;
    const { x0, x1, y0, y1 } = position!;
    const width = x0 !== undefined ? x1 - x0 : 0;
    const height = y0 !== undefined ? y1 - y0 : 0;
    return {
      left: x1 - width,
      width: width,
      top: y1 - height,
      height: height,
    };
  }, [position?.x0, position?.x1, position?.y0, position?.y1]);

  const popperSettings = useMemo((): Partial<PopperSettings> | undefined => {
    if (typeof settings === 'string') {
      return;
    }

    return {
      ...settings,
      boundary: settings.boundary === 'chart' && chartRef.current ? chartRef.current : undefined,
    };
  }, [settings, chartRef.current]);

  return (
    <Portal
      scope="MainTooltip"
      anchor={{
        position: anchorPosition,
        ref: chartRef.current,
      }}
      settings={popperSettings}
      chartId={chartId}
      visible={isVisible}
    >
      {renderTooltip()}
    </Portal>
  );
};

TooltipComponent.displayName = 'Tooltip';

const HIDDEN_TOOLTIP_PROPS = {
  isVisible: false,
  info: undefined,
  position: null,
  headerFormatter: undefined,
  settings: {},
  chartId: '',
};

const mapDispatchToProps = (dispatch: Dispatch): TooltipDispatchProps =>
  bindActionCreators({ onPointerMove }, dispatch);

const mapStateToProps = (state: GlobalChartState): TooltipStateProps => {
  if (!getInternalIsInitializedSelector(state)) {
    return HIDDEN_TOOLTIP_PROPS;
  }
  return {
    isVisible: getInternalIsTooltipVisibleSelector(state),
    info: getInternalTooltipInfoSelector(state),
    position: getInternalTooltipAnchorPositionSelector(state),
    headerFormatter: getTooltipHeaderFormatterSelector(state),
    settings: getSettingsSpecSelector(state).tooltip,
    chartId: state.chartId,
  };
};

/** @internal */
export const Tooltip = memo(connect(mapStateToProps, mapDispatchToProps)(TooltipComponent));
