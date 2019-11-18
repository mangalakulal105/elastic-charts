import createCachedSelector from 're-reselect';
import { TooltipValue, isFollowTooltipType, TooltipType, TooltipValueFormatter } from '../../utils/interactions';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { Point } from '../../../../utils/point';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { ComputedScales, getAxesSpecForSpecId } from '../utils';
import { getComputedScalesSelector } from './get_computed_scales';
import { getElementAtCursorPositionSelector } from './get_elements_at_cursor_pos';
import { IndexedGeometry } from '../../../../utils/geometry';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { BasicSeriesSpec, AxisSpec, Rotation } from '../../utils/specs';
import { getTooltipTypeSelector } from './get_tooltip_type';
import { formatTooltip } from '../../tooltip/tooltip';
import { getTooltipHeaderFormatterSelector } from './get_tooltip_header_formatter';
import { isPointOnGeometry } from '../../rendering/rendering';
import { GlobalChartState } from '../../../../state/chart_state';
import { CursorEvent } from '../../../../specs';
import { isValidExternalPointerEvent } from '../../../../utils/events';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';

const EMPTY_VALUES = Object.freeze({
  tooltipValues: [],
  highlightedGeometries: [],
});

export interface TooltipAndHighlightedGeoms {
  tooltipValues: TooltipValue[];
  highlightedGeometries: IndexedGeometry[];
}

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

export const getTooltipValuesAndGeometriesSelector = createCachedSelector(
  [
    getSeriesSpecsSelector,
    getAxisSpecsSelector,
    getProjectedPointerPositionSelector,
    getOrientedProjectedPointerPositionSelector,
    getChartRotationSelector,
    getComputedScalesSelector,
    getElementAtCursorPositionSelector,
    getTooltipTypeSelector,
    getExternalPointerEventStateSelector,
    getTooltipHeaderFormatterSelector,
  ],
  getTooltipValues,
)((state: GlobalChartState) => {
  return state.chartId;
});

function getTooltipValues(
  seriesSpecs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  projectedPointerPosition: Point,
  orientedProjectedPointerPosition: Point,
  chartRotation: Rotation,
  scales: ComputedScales,
  xMatchingGeoms: IndexedGeometry[],
  tooltipType: TooltipType,
  externalPointerEvent: CursorEvent | null,
  tooltipHeaderFormatter?: TooltipValueFormatter,
): TooltipAndHighlightedGeoms {
  if (!scales.xScale || !scales.yScales) {
    return EMPTY_VALUES;
  }
  let x = orientedProjectedPointerPosition.x;
  let y = orientedProjectedPointerPosition.y;
  if (externalPointerEvent && isValidExternalPointerEvent(externalPointerEvent, scales.xScale)) {
    x = scales.xScale.pureScale(externalPointerEvent.value);
    y = 0;
  } else if (projectedPointerPosition.x === -1 || projectedPointerPosition.y === -1) {
    return EMPTY_VALUES;
  }

  if (xMatchingGeoms.length === 0) {
    return EMPTY_VALUES;
  }

  // build the tooltip value list
  let xValueInfo: TooltipValue | null = null;
  const highlightedGeometries: IndexedGeometry[] = [];
  const tooltipValues = xMatchingGeoms.reduce<TooltipValue[]>((acc, indexedGeometry) => {
    const {
      geometryId: { specId },
    } = indexedGeometry;
    const spec = seriesSpecs.find((spec) => spec.id === specId);

    // safe guard check
    if (!spec) {
      return acc;
    }
    const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);

    // yScales is ensured by the enclosing if
    const yScale = scales.yScales.get(spec.groupId);
    if (!yScale) {
      return acc;
    }

    // check if the pointer is on the geometry
    let isHighlighted = false;
    // avoid checking if using external pointer event
    if (!externalPointerEvent && isPointOnGeometry(x, y, indexedGeometry)) {
      isHighlighted = true;
      highlightedGeometries.push(indexedGeometry);
    }

    // if it's a follow tooltip, and no element is highlighted
    // not add that element into the tooltip list
    if (!isHighlighted && isFollowTooltipType(tooltipType)) {
      return acc;
    }

    // format the tooltip values
    const yAxisFormatSpec = [0, 180].includes(chartRotation) ? yAxis : xAxis;
    const formattedTooltip = formatTooltip(indexedGeometry, spec, false, isHighlighted, yAxisFormatSpec);

    // format only one time the x value
    if (!xValueInfo) {
      // if we have a tooltipHeaderFormatter, then don't pass in the xAxis as the user will define a formatter
      const xAxisFormatSpec = [0, 180].includes(chartRotation) ? xAxis : yAxis;
      const formatterAxis = tooltipHeaderFormatter ? undefined : xAxisFormatSpec;
      xValueInfo = formatTooltip(indexedGeometry, spec, true, false, formatterAxis);
      return [xValueInfo, ...acc, formattedTooltip];
    }

    return [...acc, formattedTooltip];
  }, []);

  return {
    tooltipValues,
    highlightedGeometries,
  };
}

export const getTooltipValuesSelector = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector],
  (values): TooltipValue[] => {
    return values.tooltipValues;
  },
)((state) => state.chartId);

export const getHighlightedGeomsSelector = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector],
  (values): IndexedGeometry[] => {
    return values.highlightedGeometries;
  },
)((state) => state.chartId);
