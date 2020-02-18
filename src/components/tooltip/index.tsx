import classNames from 'classnames';
import React from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { TooltipValueFormatter, TooltipValue } from '../../specs';
import { GlobalChartState, BackwardRef } from '../../state/chart_state';
import { isInitialized } from '../../state/selectors/is_initialized';
import { getTooltipHeaderFormatterSelector } from '../../state/selectors/get_tooltip_header_formatter';
import { isTooltipVisibleSelector } from '../../chart_types/xy_chart/state/selectors/is_tooltip_visible';
import { getTooltipPositionSelector } from '../../chart_types/xy_chart/state/selectors/get_tooltip_position';
import { getTooltipValuesSelector } from '../../chart_types/xy_chart/state/selectors/get_tooltip_values_highlighted_geoms';
import { getFinalTooltipPosition, TooltipPosition } from '../../chart_types/xy_chart/crosshair/crosshair_utils';
import { TooltipData } from './types';

interface TooltipStateProps {
  isTooltipVisible: boolean;
  tooltip: TooltipData;
  tooltipPosition: TooltipPosition | null;
  tooltipHeaderFormatter?: TooltipValueFormatter;
}
interface TooltipOwnProps {
  getChartContainerRef: BackwardRef;
}
type TooltipProps = TooltipStateProps & TooltipOwnProps;

class TooltipComponent extends React.Component<TooltipProps> {
  static displayName = 'Tooltip';
  portalNode: HTMLDivElement | null = null;
  tooltipRef: React.RefObject<HTMLDivElement>;

  constructor(props: TooltipProps) {
    super(props);
    this.tooltipRef = React.createRef();
  }
  createPortalNode() {
    const container = document.getElementById('echTooltipContainerPortal');
    if (container) {
      this.portalNode = container as HTMLDivElement;
    } else {
      this.portalNode = document.createElement('div');
      this.portalNode.id = 'echTooltipContainerPortal';
      document.body.appendChild(this.portalNode);
    }
  }
  componentDidMount() {
    this.createPortalNode();
  }

  componentDidUpdate() {
    this.createPortalNode();
    const { getChartContainerRef, tooltipPosition } = this.props;
    const chartContainerRef = getChartContainerRef();

    if (!this.tooltipRef.current || !chartContainerRef.current || !this.portalNode || !tooltipPosition) {
      return;
    }

    const chartContainerBBox = chartContainerRef.current.getBoundingClientRect();
    const tooltipBBox = this.tooltipRef.current.getBoundingClientRect();
    const tooltipStyle = getFinalTooltipPosition(chartContainerBBox, tooltipBBox, tooltipPosition);

    if (tooltipStyle.left) {
      this.portalNode.style.left = tooltipStyle.left;
    }
    if (tooltipStyle.top) {
      this.portalNode.style.top = tooltipStyle.top;
    }
  }

  componentWillUnmount() {
    if (this.portalNode && this.portalNode.parentNode) {
      this.portalNode.parentNode.removeChild(this.portalNode);
    }
  }

  renderHeader(headerData: TooltipValue | null, formatter?: TooltipValueFormatter) {
    if (!headerData) {
      return null;
    }

    return formatter ? formatter(headerData) : headerData.value;
  }

  render() {
    const { isTooltipVisible, tooltip, tooltipHeaderFormatter } = this.props;
    if (!this.portalNode) {
      return null;
    }
    const { getChartContainerRef } = this.props;
    const chartContainerRef = getChartContainerRef();
    let tooltipComponent;
    if (chartContainerRef.current === null || !isTooltipVisible) {
      return null;
    } else {
      tooltipComponent = (
        <div className="echTooltip" ref={this.tooltipRef}>
          <div className="echTooltip__header">{this.renderHeader(tooltip.header, tooltipHeaderFormatter)}</div>
          <div className="echTooltip__list">
            {tooltip.values.map(
              ({ seriesIdentifier, valueAccessor, label, value, color, isHighlighted, isVisible }) => {
                if (!isVisible) {
                  return null;
                }
                const classes = classNames('echTooltip__item', {
                  /* eslint @typescript-eslint/camelcase:0 */
                  echTooltip__rowHighlighted: isHighlighted,
                });
                return (
                  <div
                    key={`${seriesIdentifier.key}__${valueAccessor}`}
                    className={classes}
                    style={{
                      borderLeftColor: color,
                    }}
                  >
                    <span className="echTooltip__label">{label}</span>
                    <span className="echTooltip__value">{value}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      );
    }
    return createPortal(tooltipComponent, this.portalNode);
  }
}

const mapStateToProps = (state: GlobalChartState): TooltipStateProps => {
  if (!isInitialized(state)) {
    return {
      isTooltipVisible: false,
      tooltip: {
        header: null,
        values: [],
      },
      tooltipPosition: null,
      tooltipHeaderFormatter: undefined,
    };
  }
  return {
    isTooltipVisible: isTooltipVisibleSelector(state),
    tooltip: getTooltipValuesSelector(state),
    tooltipPosition: getTooltipPositionSelector(state),
    tooltipHeaderFormatter: getTooltipHeaderFormatterSelector(state),
  };
};

export const Tooltip = connect(mapStateToProps)(TooltipComponent);
