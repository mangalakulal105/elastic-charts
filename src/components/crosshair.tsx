import { inject, observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import { TooltipType } from '../types/xy_chart/utils/interactions';
import { ChartStore } from '../types/xy_chart/store/chart_state';
import { isHorizontalRotation } from '../types/xy_chart/store/utils';

interface CrosshairProps {
  chartStore?: ChartStore;
}

function canRenderBand(type: TooltipType, visible: boolean) {
  return visible && (type === TooltipType.Crosshairs || type === TooltipType.VerticalCursor);
}
function canRenderHelpLine(type: TooltipType, visible: boolean) {
  return visible && type === TooltipType.Crosshairs;
}

class CrosshairComponent extends React.Component<CrosshairProps> {
  static displayName = 'Crosshair';

  render() {
    const { isCrosshairVisible } = this.props.chartStore!;
    if (!isCrosshairVisible.get()) {
      return <div className="echCrosshair" />;
    }

    return (
      <div className="echCrosshair">
        {this.renderBand()}
        {this.renderLine()}
      </div>
    );
  }

  renderBand() {
    const {
      chartTheme: {
        crosshair: { band },
      },
      cursorBandPosition,
      tooltipType,
    } = this.props.chartStore!;

    if (!canRenderBand(tooltipType.get(), band.visible)) {
      return null;
    }
    const style: CSSProperties = {
      ...cursorBandPosition,
      background: band.fill,
    };

    return <div className="echCrosshair__band" style={style} />;
  }

  renderLine() {
    const {
      chartTheme: {
        crosshair: { line },
      },
      cursorLinePosition,
      tooltipType,
      chartRotation,
    } = this.props.chartStore!;

    if (!canRenderHelpLine(tooltipType.get(), line.visible)) {
      return null;
    }
    const isHorizontalRotated = isHorizontalRotation(chartRotation);
    let style: CSSProperties;
    if (isHorizontalRotated) {
      style = {
        ...cursorLinePosition,
        borderTopWidth: line.strokeWidth,
        borderTopColor: line.stroke,
        borderTopStyle: line.dash ? 'dashed' : 'solid',
      };
    } else {
      style = {
        ...cursorLinePosition,
        borderLeftWidth: line.strokeWidth,
        borderLeftColor: line.stroke,
        borderLeftStyle: line.dash ? 'dashed' : 'solid',
      };
    }
    return <div className="echCrosshair__line" style={style} />;
  }
}

export const Crosshair = inject('chartStore')(observer(CrosshairComponent));
