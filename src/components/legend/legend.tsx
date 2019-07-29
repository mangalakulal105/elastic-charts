import React, { createRef } from 'react';
import classNames from 'classnames';

import { isVerticalAxis, isHorizontalAxis } from '../../chart_types/xy_chart/utils/axis_utils';
import { connect } from 'react-redux';
import { LegendItem as SeriesLegendItem } from '../../chart_types/xy_chart/legend/legend';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { IChartState } from '../../store/chart_store';
import { isInitialized } from '../../store/selectors/is_initialized';
import { computeLegendSelector } from '../../chart_types/xy_chart/store/selectors/compute_legend';
import { getSettingsSpecSelector } from '../../store/selectors/get_settings_specs';
import { getChartThemeSelector } from '../../store/selectors/get_chart_theme';
import { isLegendInitializedSelector } from '../../chart_types/xy_chart/store/selectors/is_legend_initialized';
import { getLegendTooltipValuesSelector } from '../../chart_types/xy_chart/store/selectors/get_legend_tooltip_values';
import { onToggleLegend, onLegendItemOver, onLegendItemOut, onLegendRendered } from '../../store/actions/legend';
import { Dispatch, bindActionCreators } from 'redux';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { LegendItem } from './legend_item';
import { Theme } from '../../utils/themes/theme';
import { TooltipLegendValue } from '../../chart_types/xy_chart/tooltip/tooltip';
import { AccessorType } from 'utils/geometry';

interface LegendProps {
  initialized: boolean;
  legendInitialized: boolean;
  isCursorOnChart: boolean; //TODO
  legendItems: Map<string, SeriesLegendItem>;
  legendPosition: Position;
  legendItemTooltipValues: Map<string, TooltipLegendValue>;
  showLegend: boolean;
  legendCollapsed: boolean;
  debug: boolean;
  chartTheme: Theme;
  toggleLegend: () => void;
  onLegendItemOut: () => void;
  onLegendItemOver: (legendItem: string) => void;
  onLegendRendered: () => void;
}

interface LegendState {
  width?: number;
}

interface LegendStyle {
  maxHeight?: string;
  maxWidth?: string;
  width?: string;
}

interface LegendListStyle {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  gridTemplateColumns?: string;
}

class LegendComponent extends React.Component<LegendProps, LegendState> {
  static displayName = 'Legend';
  legendItemCount = 0;

  state = {
    width: undefined,
  };

  private echLegend = createRef<HTMLDivElement>();
  componentDidMount() {
    const { legendInitialized, showLegend } = this.props;
    if (showLegend && legendInitialized) {
      this.props.onLegendRendered();
    }
  }
  componentDidUpdate() {
    this.tryLegendResize();
  }

  render() {
    const { legendInitialized, legendItems, legendPosition, showLegend, debug, chartTheme } = this.props;

    if (!showLegend || !legendInitialized || legendItems.size === 0) {
      return null;
    }

    const legendContainerStyle = this.getLegendStyle(legendPosition, chartTheme);
    const legendListStyle = this.getLegendListStyle(legendPosition, chartTheme);
    const legendClasses = classNames('echLegend', `echLegend--${legendPosition}`, {
      'echLegend--debug': debug,
      invisible: !legendInitialized,
    });

    return (
      <div ref={this.echLegend} className={legendClasses}>
        <div style={legendContainerStyle} className="echLegendListContainer">
          <div style={legendListStyle} className="echLegendList">
            {[...legendItems.values()].map(this.renderLegendElement)}
          </div>
        </div>
      </div>
    );
  }

  tryLegendResize = () => {
    const { legendInitialized, chartTheme, legendPosition, legendItems } = this.props;
    const { width } = this.state;

    if (
      this.echLegend.current &&
      isVerticalAxis(legendPosition) &&
      !legendInitialized &&
      width === undefined &&
      this.echLegend.current.offsetWidth > 0
    ) {
      const buffer = chartTheme.legend.spacingBuffer;
      this.legendItemCount = legendItems.size;

      return this.setState({
        width: this.echLegend.current.offsetWidth + buffer,
      });
      this.props.onLegendRendered();
    }

    // Need to reset width to enable downsizing of width
    if (width !== undefined && legendItems.size !== this.legendItemCount) {
      this.legendItemCount = legendItems.size;

      this.setState({
        width: undefined,
      });
    }
  };

  getLegendListStyle = (position: Position, { chartMargins, legend }: Theme): LegendListStyle => {
    const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = chartMargins;

    if (isHorizontalAxis(position)) {
      return {
        paddingLeft,
        paddingRight,
        gridTemplateColumns: `repeat(auto-fill, minmax(${legend.verticalWidth}px, 1fr))`,
      };
    }

    return {
      paddingTop,
      paddingBottom,
    };
  };

  getLegendStyle = (position: Position, { legend }: Theme): LegendStyle => {
    if (isVerticalAxis(position)) {
      if (this.state.width !== undefined) {
        const threshold = Math.min(this.state.width!, legend.verticalWidth);
        const width = `${threshold}px`;

        return {
          width,
          maxWidth: width,
        };
      }

      return {
        maxWidth: `${legend.verticalWidth}px`,
      };
    }

    return {
      maxHeight: `${legend.horizontalHeight}px`,
    };
  };

  onLegendItemMouseover = (legendItemKey: string) => () => {
    this.props.onLegendItemOver(legendItemKey);
  };

  onLegendItemMouseout = () => {
    this.props.onLegendItemOut();
  };

  private getLegendValues(
    tooltipValues: Map<string, TooltipLegendValue> | undefined,
    key: string,
    banded: boolean = false,
  ): any[] {
    const values = tooltipValues && tooltipValues.get(key);
    if (values === null || values === undefined) {
      return banded ? ['', ''] : [''];
    }

    const { y0, y1 } = values;
    return banded ? [y1, y0] : [y1];
  }

  private getItemLabel(
    { banded, label, y1AccessorFormat, y0AccessorFormat }: SeriesLegendItem,
    yAccessor: AccessorType,
  ) {
    if (!banded) {
      return label;
    }

    return yAccessor === AccessorType.Y1 ? `${label}${y1AccessorFormat}` : `${label}${y0AccessorFormat}`;
  }

  private renderLegendElement = (item: SeriesLegendItem) => {
    const { key, displayValue, banded } = item;
    const { isCursorOnChart, legendItemTooltipValues } = this.props;
    const legendValues = this.getLegendValues(legendItemTooltipValues, key, banded);

    return legendValues.map((value, index) => {
      const yAccessor: AccessorType = index === 0 ? AccessorType.Y1 : AccessorType.Y0;
      return (
        <LegendItem
          {...item}
          label={this.getItemLabel(item, yAccessor)}
          key={`${key}-${yAccessor}`}
          legendItem={item}
          displayValue={isCursorOnChart ? value : displayValue.formatted[yAccessor]}
          onMouseEnter={this.onLegendItemMouseover(key)}
          onMouseLeave={this.onLegendItemMouseout}
        />
      );
    });
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleLegend: onToggleLegend,
      onLegendItemOut,
      onLegendItemOver,
      onLegendRendered,
    },
    dispatch,
  );

const mapStateToProps = (state: IChartState) => {
  if (!isInitialized(state)) {
    return {
      legendInitialized: false, //TODO
      isCursorOnChart: false, //TODO
      initialized: false,
      legendItems: new Map(),
      legendPosition: Position.Right,
      showLegend: false,
      legendCollapsed: false,
      legendItemTooltipValues: new Map(),
      debug: false,
      chartTheme: LIGHT_THEME,
    };
  }
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    legendInitialized: isLegendInitializedSelector(state),
    isCursorOnChart: false, //TODO
    initialized: isInitialized(state),
    legendItems: computeLegendSelector(state),
    legendPosition: settingsSpec.legendPosition,
    showLegend: settingsSpec.showLegend,
    legendCollapsed: state.interactions.legendCollapsed,
    legendItemTooltipValues: getLegendTooltipValuesSelector(state),
    debug: settingsSpec.debug,
    chartTheme: getChartThemeSelector(state),
  };
};

export const Legend = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LegendComponent);
