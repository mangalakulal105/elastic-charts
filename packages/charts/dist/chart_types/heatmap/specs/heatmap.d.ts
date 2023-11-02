import { ComponentProps } from 'react';
import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { SmallMultiplesDatum } from '../../../common/panel_utils';
import { Predicate } from '../../../common/predicate';
import { ScaleType } from '../../../scales/constants';
import { BaseDatum, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { SFProps } from '../../../state/spec_factory';
import { Accessor, AccessorFn } from '../../../utils/accessor';
import { ESCalendarInterval, ESFixedInterval } from '../../../utils/chrono/elasticsearch';
import { Datum, LabelAccessor, ValueFormatter } from '../../../utils/common';
import { Cell } from '../layout/types/viewmodel_types';
/** @public */
export type HeatmapScaleType = typeof ScaleType.Linear | typeof ScaleType.Quantile | typeof ScaleType.Quantize | typeof ScaleType.Threshold;
/** @alpha */
export type ColorBand = {
    start: number;
    end: number;
    color: Color;
    label?: string;
};
/** @alpha */
export interface HeatmapBandsColorScale {
    type: 'bands';
    bands: Array<ColorBand>;
    /** called on ColorBands without a provided label */
    labelFormatter?: (start: number, end: number) => string;
}
/** @public */
export type HeatmapBrushEvent = HeatmapHighlightedData & {
    cells: Cell[];
};
/** @public */
export interface TimeScale {
    type: typeof ScaleType.Time;
}
/** @public */
export interface RasterTimeScale extends TimeScale {
    interval: ESCalendarInterval | ESFixedInterval;
}
/** @public */
export interface LinearScale {
    type: typeof ScaleType.Linear;
}
/** @public */
export interface OrdinalScale {
    type: typeof ScaleType.Ordinal;
}
/**
 * @public
 */
export interface HeatmapHighlightedData extends SmallMultiplesDatum {
    x: Array<string | number>;
    y: Array<string | number>;
}
/** @alpha */
export interface HeatmapSpec<D extends BaseDatum = Datum> extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Heatmap;
    data: D[];
    colorScale: HeatmapBandsColorScale;
    xAccessor: Accessor<D> | AccessorFn<D>;
    yAccessor: Accessor<D> | AccessorFn<D>;
    valueAccessor: Accessor<never> | AccessorFn;
    valueFormatter: ValueFormatter;
    xSortPredicate: Predicate;
    ySortPredicate: Predicate;
    xScale: RasterTimeScale | OrdinalScale | LinearScale;
    highlightedData?: HeatmapHighlightedData;
    name?: string;
    timeZone: string;
    xAxisTitle: string;
    xAxisLabelName: string;
    xAxisLabelFormatter: LabelAccessor<string | number>;
    yAxisTitle: string;
    yAxisLabelName: string;
    yAxisLabelFormatter: LabelAccessor<string | number>;
}
/**
 * Adds heatmap spec to chart specs
 * @alpha
 */
export declare const Heatmap: <D extends BaseDatum = any>(props: SFProps<HeatmapSpec<D>, "chartType" | "specType", "data" | "timeZone" | "valueFormatter" | "valueAccessor" | "xAccessor" | "yAccessor" | "xScale" | "xSortPredicate" | "ySortPredicate" | "xAxisTitle" | "xAxisLabelName" | "xAxisLabelFormatter" | "yAxisTitle" | "yAxisLabelName" | "yAxisLabelFormatter", "name" | "highlightedData", "id" | "colorScale">) => null;
/** @public */
export type HeatmapProps = ComponentProps<typeof Heatmap>;
//# sourceMappingURL=heatmap.d.ts.map