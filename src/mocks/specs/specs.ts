import { mergePartial } from '../../utils/commons';
import {
  SeriesSpecs,
  DEFAULT_GLOBAL_ID,
  BarSeriesSpec,
  AreaSeriesSpec,
  HistogramModeAlignments,
  HistogramBarSeriesSpec,
  LineSeriesSpec,
  BasicSeriesSpec,
} from '../../chart_types/xy_chart/utils/specs';
import { getSpecId, getGroupId } from '../../utils/ids';
import { ScaleType } from '../../utils/scales/scales';

export class MockSeriesSpec {
  private static readonly barBase: BarSeriesSpec = {
    chartType: 'xy_axis',
    specType: 'series',
    id: getSpecId('spec1'),
    seriesType: 'bar',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    enableHistogramMode: false,
    stackAsPercentage: false,
    data: [] as any[],
  };

  private static readonly histogramBarBase: HistogramBarSeriesSpec = {
    chartType: 'xy_axis',
    specType: 'series',
    id: getSpecId('spec1'),
    seriesType: 'bar',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    enableHistogramMode: true,
    data: [],
  };

  private static readonly areaBase: AreaSeriesSpec = {
    chartType: 'xy_axis',
    specType: 'series',
    id: getSpecId('spec1'),
    seriesType: 'area',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  private static readonly lineBase: LineSeriesSpec = {
    chartType: 'xy_axis',
    specType: 'series',
    id: getSpecId('spec1'),
    seriesType: 'line',
    groupId: getGroupId(DEFAULT_GLOBAL_ID),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
    histogramModeAlignment: HistogramModeAlignments.Center,
    data: [],
  };

  static bar(partial?: Partial<BarSeriesSpec>): BarSeriesSpec {
    return mergePartial<BarSeriesSpec>(MockSeriesSpec.barBase, partial, { mergeOptionalPartialValues: true });
  }

  static histogramBar(partial?: Partial<HistogramBarSeriesSpec>): HistogramBarSeriesSpec {
    return mergePartial<HistogramBarSeriesSpec>(MockSeriesSpec.histogramBarBase, partial, {
      mergeOptionalPartialValues: true,
    });
  }

  static area(partial?: Partial<AreaSeriesSpec>): AreaSeriesSpec {
    return mergePartial<AreaSeriesSpec>(MockSeriesSpec.areaBase, partial, { mergeOptionalPartialValues: true });
  }

  static line(partial?: Partial<LineSeriesSpec>): LineSeriesSpec {
    return mergePartial<LineSeriesSpec>(MockSeriesSpec.lineBase, partial, { mergeOptionalPartialValues: true });
  }
}

export class MockSeriesSpecs {
  static fromSpecs(specs: BasicSeriesSpec[]): SeriesSpecs {
    return specs;
  }

  static empty(): SeriesSpecs {
    return [];
  }
}
