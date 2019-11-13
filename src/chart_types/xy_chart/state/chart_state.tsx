import React from 'react';
import { InternalChartState, GlobalChartState, BackwardRef } from '../../../state/chart_state';
import { ChartTypes } from '../..';
import { Tooltips } from '../renderer/dom/tooltips';
import { htmlIdGenerator } from '../../../utils/commons';
import { Highlighter } from '../renderer/dom/highlighter';
import { Crosshair } from '../renderer/dom/crosshair';
import { AnnotationTooltip } from '../renderer/dom/annotation_tooltips';
import { isBrushAvailableSelector } from './selectors/is_brush_available';
import { BrushTool } from '../renderer/dom/brush';
import { isChartEmptySelector } from './selectors/is_chart_empty';
import { ReactiveChart } from '../renderer/canvas/reactive_chart';
import { computeLegendSelector } from './selectors/compute_legend';
import { getLegendTooltipValuesSelector } from './selectors/get_legend_tooltip_values';
import { TooltipLegendValue } from '../tooltip/tooltip';
import { getCursorPointerSelector } from './selectors/get_cursor_pointer';

export class XYAxisChartState implements InternalChartState {
  chartType = ChartTypes.XYAxis;
  legendId: string = htmlIdGenerator()('legend');
  isBrushAvailable(globalState: GlobalChartState) {
    return isBrushAvailableSelector(globalState);
  }
  isChartEmpty(globalState: GlobalChartState) {
    return isChartEmptySelector(globalState);
  }
  getLegendItems(globalState: GlobalChartState) {
    return computeLegendSelector(globalState);
  }
  getLegendItemsValues(globalState: GlobalChartState): Map<string, TooltipLegendValue> {
    return getLegendTooltipValuesSelector(globalState);
  }
  chartRenderer(containerRef: BackwardRef) {
    return (
      <React.Fragment>
        <Crosshair />
        <ReactiveChart />
        <Tooltips getChartContainerRef={containerRef} />
        <AnnotationTooltip getChartContainerRef={containerRef} />
        <Highlighter />
        <BrushTool />
      </React.Fragment>
    );
  }
  getCursorPointer(globalState: GlobalChartState) {
    return getCursorPointerSelector(globalState);
  }
}
