import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { TooltipValue, TooltipValueFormatter } from '../chart_types/xy_chart/utils/interactions';
import { ChartStore } from '../chart_types/xy_chart/store/chart_state';

interface TooltipProps {
  chartStore?: ChartStore;
}

class TooltipsComponent extends React.Component<TooltipProps> {
  static displayName = 'Tooltips';

  renderHeader(headerData?: TooltipValue, formatter?: TooltipValueFormatter) {
    if (!headerData) {
      return null;
    }

    return formatter ? formatter(headerData) : headerData.value;
  }

  render() {
    const { isTooltipVisible, tooltipData, tooltipPosition, tooltipHeaderFormatter } = this.props.chartStore!;

    if (!isTooltipVisible.get()) {
      return <div className="echTooltip echTooltip--hidden" />;
    }

    return (
      <div className="echTooltip" style={{ transform: tooltipPosition.transform }}>
        <div className="echTooltip__header">{this.renderHeader(tooltipData[0], tooltipHeaderFormatter)}</div>
        <div className="echTooltip__table">
          <table>
            <tbody>
              {tooltipData.slice(1).map(({ name, value, color, isHighlighted }, index) => {
                const classes = classNames({
                  /* eslint @typescript-eslint/camelcase:0 */
                  echTooltip__rowHighlighted: isHighlighted,
                });
                return (
                  <tr key={`row-${index}`} className={classes}>
                    <td
                      className="echTooltip__cell"
                      style={{
                        borderLeftColor: color,
                      }}
                    >
                      <span className="echTooltip__label">{name}</span>
                      <span className="echTooltip__value">{value}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export const Tooltips = inject('chartStore')(observer(TooltipsComponent));
