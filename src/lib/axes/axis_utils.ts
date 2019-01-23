
import { XDomain } from '../series/domains/x_domain';
import { YDomain } from '../series/domains/y_domain';
import { computeXScale, computeYScales } from '../series/scales';
import { AxisSpec, Position, Rotation, TickFormatter } from '../series/specs';
import { ChartConfig, LegendStyle } from '../themes/theme';
import { Dimensions, Margins } from '../utils/dimensions';
import { Domain } from '../utils/domain';
import { AxisId } from '../utils/ids';
import { Scale, ScaleType } from '../utils/scales/scales';
import { BBox, BBoxCalculator } from './bbox_calculator';

export interface AxisTick {
  value: number | string;
  label: string;
  position: number;
}

export interface AxisTicksDimensions {
  axisScaleType: ScaleType;
  axisScaleDomain: Domain;
  tickValues: string[] | number[];
  tickLabels: string[];
  maxLabelBboxWidth: number;
  maxLabelBboxHeight: number;
  maxLabelTextWidth: number;
  maxLabelTextHeight: number;
}

/**
 * Compute the ticks values and identify max width and height of the labels
 * so we can compute the max space occupied by the axis component.
 * @param axisSpec tbe spec of the axis
 * @param specDomains the domain associated
 * @param bboxCalculator an instance of the boundingbox calculator
 */
export function computeAxisTicksDimensions(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  totalGroupCount: number,
  bboxCalculator: BBoxCalculator,
  chartRotation: Rotation,
): AxisTicksDimensions | null {
  const scale = getScaleForAxisSpec(
    axisSpec,
    xDomain,
    yDomain,
    totalGroupCount,
    chartRotation,
    0,
    1,
  );
  if (!scale) {
    throw new Error(`Cannot compute scale for axis spec ${axisSpec.id}`);
  }
  const dimensions = computeTickDimensions(
    scale,
    axisSpec.tickFormat,
    bboxCalculator,
    axisSpec.tickLabelRotation,
  );

  return {
    axisScaleDomain: xDomain.domain,
    axisScaleType: xDomain.scaleType,
    ...dimensions,
  };
}
export function getScaleForAxisSpec(
  axisSpec: AxisSpec,
  xDomain: XDomain,
  yDomain: YDomain[],
  totalGroupCount: number,
  chartRotation: Rotation,
  minRange: number,
  maxRange: number,
): Scale | null {
  const axisDomain = getAxisDomain(axisSpec.position, xDomain, yDomain, chartRotation);
  if (axisDomain && Array.isArray(axisDomain)) {
    const yScales = computeYScales(yDomain, minRange, maxRange);
    if (yScales.has(axisSpec.groupId)) {
      return yScales.get(axisSpec.groupId)!;
    }
    return null;
  } else {
    return computeXScale(xDomain, totalGroupCount, minRange, maxRange);
  }
}

export function computeRotatedLabelDimensions(unrotatedDims: BBox, degreesRotation: number): BBox {
  const { width, height } = unrotatedDims;

  const radians = degreesRotation * Math.PI / 180;

  const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));

  return {
    width: rotatedWidth,
    height: rotatedHeight,
  };
}

function computeTickDimensions(
  scale: Scale,
  tickFormat: TickFormatter,
  bboxCalculator: BBoxCalculator,
  tickLabelRotation: number = 0,
) {
  const tickValues = scale.ticks();
  const tickLabels = tickValues.map(tickFormat);

  const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth, maxLabelTextHeight } = tickLabels
    .reduce((acc: { [key: string]: number }, tickLabel: string) => {
      const bbox = bboxCalculator.compute(tickLabel).getOrElse({
        width: 0,
        height: 0,
      });

      const rotatedBbox = computeRotatedLabelDimensions(bbox, tickLabelRotation);

      const width = Math.ceil(rotatedBbox.width);
      const height = Math.ceil(rotatedBbox.height);
      const labelWidth = Math.ceil(bbox.width);
      const labelHeight = Math.ceil(bbox.height);

      const prevWidth = acc.maxLabelBboxWidth;
      const prevHeight = acc.maxLabelBboxHeight;
      const prevLabelWidth = acc.maxLabelTextWidth;
      const prevLabelHeight = acc.maxLabelTextHeight;

      return {
        maxLabelBboxWidth: prevWidth > width ? prevWidth : width,
        maxLabelBboxHeight: prevHeight > height ? prevHeight : height,
        maxLabelTextWidth: prevLabelWidth > labelWidth ? prevLabelWidth : labelWidth,
        maxLabelTextHeight: prevLabelHeight > labelHeight ? prevLabelHeight : labelHeight,
      };
    }, { maxLabelBboxWidth: 0, maxLabelBboxHeight: 0, maxLabelTextWidth: 0, maxLabelTextHeight: 0 });

  return {
    tickValues,
    tickLabels,
    maxLabelBboxWidth,
    maxLabelBboxHeight,
    maxLabelTextWidth,
    maxLabelTextHeight,
  };
}

export interface TickLabelProps {
  x: number;
  y: number;
  align: string;
  verticalAlign: string;
}

/**
 * The Konva api sets the top right corner of a shape as the default origin of rotation.
 * In order to apply rotation to tick labels while preserving their relative position to the axis,
 * we compute offsets to apply to the Text element as well as adjust the x/y coordinates to adjust
 * for these offsets.
 */
export function centerRotationOrigin(
  axisTicksDimensions: {
    maxLabelBboxWidth: number,
    maxLabelBboxHeight: number,
    maxLabelTextWidth: number,
    maxLabelTextHeight: number,
  },
  coordinates: { x: number, y: number }): { x: number, y: number, offsetX: number, offsetY: number } {

  const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth, maxLabelTextHeight } = axisTicksDimensions;

  const offsetX = maxLabelTextWidth / 2;
  const offsetY = maxLabelTextHeight / 2;
  const x = coordinates.x + maxLabelBboxWidth / 2;
  const y = coordinates.y + maxLabelBboxHeight / 2;

  return { offsetX, offsetY, x, y };
}

export function getTickLabelProps(
  isVerticalAxis: boolean,
  tickLabelRotation: number,
  tickSize: number,
  tickPadding: number,
  tickPosition: number,
  labelPosition: Position,
  axisTicksDimensions: AxisTicksDimensions,
): TickLabelProps {
  const { maxLabelBboxWidth, maxLabelBboxHeight } = axisTicksDimensions;

  const isRotated = tickLabelRotation !== 0;
  let align = 'center';
  let verticalAlign = 'middle';

  if (isVerticalAxis) {
    const isAxisLeft = labelPosition === Position.Left;

    if (!isRotated) {
      align = isAxisLeft ? 'right' : 'left';
    }

    return {
      x: isAxisLeft ? - (maxLabelBboxWidth) : tickSize + tickPadding,
      y: tickPosition - maxLabelBboxHeight / 2,
      align,
      verticalAlign,
    };
  }

  const isAxisTop = labelPosition === Position.Top;

  if (!isRotated) {
    verticalAlign = isAxisTop ? 'bottom' : 'top';
  }

  return {
    x: tickPosition - maxLabelBboxWidth / 2,
    y: isAxisTop ? 0 : tickSize + tickPadding,
    align,
    verticalAlign,
  };
}

export function getMinMaxRange(
  axisPosition: Position,
  chartRotation: Rotation,
  chartDimensions: Dimensions,
): {
  minRange: number;
  maxRange: number;
} {
  const { width, height } = chartDimensions;
  switch (axisPosition) {
    case Position.Bottom:
    case Position.Top:
      return getBottomTopAxisMinMaxRange(chartRotation, width);
    case Position.Left:
    case Position.Right:
      return getLeftAxisMinMaxRange(chartRotation, height);
  }
}

export function getBottomTopAxisMinMaxRange(chartRotation: Rotation, width: number) {
  switch (chartRotation) {
    case 0:
      // dealing with x domain
      return { minRange: 0, maxRange: width };
    case 90:
      // dealing with y domain
      return { minRange: 0, maxRange: width };
    case -90:
      // dealing with y domain
      return { minRange: width, maxRange: 0 };
    case 180:
      // dealing with x domain
      return { minRange: width, maxRange: 0 };
  }
}
export function getLeftAxisMinMaxRange(chartRotation: Rotation, height: number) {
  switch (chartRotation) {
    case 0:
      // dealing with y domain
      return { minRange: height, maxRange: 0 };
    case 90:
      // dealing with x domain
      return { minRange: 0, maxRange: height };
    case -90:
      // dealing with x domain
      return { minRange: height, maxRange: 0 };
    case 180:
      // dealing with y domain
      return { minRange: 0, maxRange: height };
  }
}

export function getAvailableTicks(axisSpec: AxisSpec, scale: Scale, totalGroupCount: number) {
  const ticks = scale.ticks();
  const shift = totalGroupCount > 0 ? totalGroupCount : 1;
  const offset = (scale.bandwidth * shift) / 2;
  return ticks.map((tick) => {
    return {
      value: tick,
      label: axisSpec.tickFormat(tick),
      position: scale.scale(tick) + offset,
    };
  });
}
export function getVisibleTicks(
  allTicks: AxisTick[],
  axisSpec: AxisSpec,
  axisDim: AxisTicksDimensions,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
): AxisTick[] {
  const { showOverlappingTicks, showOverlappingLabels } = axisSpec;
  const { maxLabelBboxHeight, maxLabelBboxWidth } = axisDim;
  const { width, height } = chartDimensions;
  const requiredSpace = isVertical(axisSpec.position) ? maxLabelBboxHeight / 2 : maxLabelBboxWidth / 2;
  let firstTickPosition;

  firstTickPosition = 0;

  let previousOccupiedSpace = firstTickPosition;
  const visibleTicks = [];
  for (let i = 0; i < allTicks.length; i++) {
    const { position } = allTicks[i];

    let relativeTickPosition = 0;
    if (isVertical(axisSpec.position)) {
      if (chartRotation === 90 || chartRotation === 180) {
        relativeTickPosition = position;
      } else {
        relativeTickPosition = height - position;
      }
    } else {
      // horizontal axis
      if (chartRotation === 180 || chartRotation === -90) {
        relativeTickPosition = width - position;
      } else {
        relativeTickPosition = position;
      }
    }
    if (i === 0) {
      visibleTicks.push(allTicks[i]);
      previousOccupiedSpace = firstTickPosition + requiredSpace;
    } else if (relativeTickPosition - requiredSpace >= previousOccupiedSpace) {
      visibleTicks.push(allTicks[i]);
      previousOccupiedSpace = relativeTickPosition + requiredSpace;
    } else {
      // still add the tick but without a label
      if (showOverlappingTicks || showOverlappingLabels) {
        const overlappingTick = {
          ...allTicks[i],
          label: showOverlappingLabels ? allTicks[i].label : '',
        };
        visibleTicks.push(overlappingTick);
      }
    }
  }
  return visibleTicks;
}

export function getAxisPosition(
  chartDimensions: Dimensions,
  chartMargins: Margins,
  axisSpec: AxisSpec,
  axisDim: AxisTicksDimensions,
  cumTopSum: number,
  cumBottomSum: number,
  cumLeftSum: number,
  cumRightSum: number,
) {
  // TODO add title space
  const { position, tickSize, tickPadding } = axisSpec;
  const { maxLabelBboxHeight, maxLabelBboxWidth } = axisDim;
  const { top, left, height, width } = chartDimensions;
  const dimensions = {
    top,
    left,
    width,
    height,
  };
  let topIncrement = 0;
  let bottomIncrement = 0;
  let leftIncrement = 0;
  let rightIncrement = 0;

  if (isVertical(position)) {
    if (position === Position.Left) {
      leftIncrement = maxLabelBboxWidth + tickSize + tickPadding + chartMargins.left;
      dimensions.left = maxLabelBboxWidth + cumLeftSum + chartMargins.left;
    } else {
      rightIncrement = maxLabelBboxWidth + tickSize + tickPadding + chartMargins.right;
      dimensions.left = left + width + cumRightSum;
    }
    dimensions.width = maxLabelBboxWidth;
  } else {
    if (position === Position.Top) {
      topIncrement = maxLabelBboxHeight + tickSize + tickPadding + chartMargins.top;
      dimensions.top = cumTopSum + chartMargins.top;
    } else {
      bottomIncrement = maxLabelBboxHeight + tickSize + tickPadding + chartMargins.bottom;
      dimensions.top = top + height + cumBottomSum;
    }
    dimensions.height = maxLabelBboxHeight;
  }
  return { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement };
}

export function getAxisTicksPositions(
  chartDimensions: Dimensions,
  chartConfig: ChartConfig,
  chartRotation: Rotation,
  legendStyle: LegendStyle,
  showLegend: boolean,
  axisSpecs: Map<AxisId, AxisSpec>,
  axisDimensions: Map<AxisId, AxisTicksDimensions>,
  xDomain: XDomain,
  yDomain: YDomain[],
  totalGroupsCount: number,
  legendPosition?: Position,
) {
  const axisPositions: Map<AxisId, Dimensions> = new Map();
  const axisVisibleTicks: Map<AxisId, AxisTick[]> = new Map();
  const axisTicks: Map<AxisId, AxisTick[]> = new Map();
  let cumTopSum = 0;
  let cumBottomSum = chartConfig.paddings.bottom;
  let cumLeftSum = 0;
  let cumRightSum = chartConfig.paddings.right;
  if (showLegend) {
    switch (legendPosition) {
      case Position.Left:
        cumLeftSum += legendStyle.verticalWidth;
        break;
      // case Position.Right:
      //   cumRightSum += legendStyle.verticalWidth;
      //   break;
      // case Position.Bottom:
      //   cumBottomSum += legendStyle.horizontalHeight;
      //   break;
      case Position.Top:
        cumTopSum += legendStyle.horizontalHeight;
        break;
    }
  }
  // console.log({cumRightSum});
  // let cumTopSum = showLegend ? legendStyle.horizontalHeight : 0;
  // let cumBottomSum = chartConfig.paddings.bottom;
  // let cumLeftSum = showLegend ? legendStyle.verticalWidth : 0;
  // let cumRightSum = chartConfig.paddings.right;
  axisDimensions.forEach((axisDim, id) => {
    const axisSpec = axisSpecs.get(id);
    if (!axisSpec) {
      return;
    }
    const minMaxRanges = getMinMaxRange(axisSpec.position, chartRotation, chartDimensions);
    if (minMaxRanges === null) {
      throw new Error(`cannot comput min and max ranges for spec ${axisSpec.id}`);
    }
    const scale = getScaleForAxisSpec(
      axisSpec,
      xDomain,
      yDomain,
      totalGroupsCount,
      chartRotation,
      minMaxRanges.minRange,
      minMaxRanges.maxRange,
      // minRange,
      // maxRange,
    );
    if (!scale) {
      throw new Error(`cannot compute scale for spec ${axisSpec.id}`);
    }

    const allTicks = getAvailableTicks(axisSpec, scale, totalGroupsCount);
    const visibleTicks = getVisibleTicks(
      allTicks,
      axisSpec,
      axisDim,
      chartDimensions,
      chartRotation,
    );
    const axisPosition = getAxisPosition(
      chartDimensions,
      chartConfig.margins,
      axisSpec,
      axisDim,
      cumTopSum,
      cumBottomSum,
      cumLeftSum,
      cumRightSum,
    );
    cumTopSum += axisPosition.topIncrement;
    cumBottomSum += axisPosition.bottomIncrement;
    cumLeftSum += axisPosition.leftIncrement;
    cumRightSum += axisPosition.rightIncrement;
    axisPositions.set(id, axisPosition.dimensions);
    axisVisibleTicks.set(id, visibleTicks);
    axisTicks.set(id, allTicks);
  });
  return {
    axisPositions,
    axisTicks,
    axisVisibleTicks,
  };
}

function getVerticalDomain(
  xDomain: XDomain,
  yDomain: YDomain[],
  chartRotation: number,
): XDomain | YDomain[] {
  if (chartRotation === 0 || chartRotation === 180) {
    return yDomain;
  } else {
    return xDomain;
  }
}
function getHorizontalDomain(
  xDomain: XDomain,
  yDomain: YDomain[],
  chartRotation: number,
): XDomain | YDomain[] {
  if (chartRotation === 0 || chartRotation === 180) {
    return xDomain;
  } else {
    return yDomain;
  }
}

function getAxisDomain(
  position: Position,
  xDomain: XDomain,
  yDomain: YDomain[],
  chartRotation: number,
): XDomain | YDomain[] {
  if (!isHorizontal(position)) {
    return getVerticalDomain(xDomain, yDomain, chartRotation);
  } else {
    return getHorizontalDomain(xDomain, yDomain, chartRotation);
  }
}

export function isVertical(position: Position) {
  return position === Position.Left || position === Position.Right;
}

export function isHorizontal(position: Position) {
  return !isVertical(position);
}
