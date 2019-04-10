import { findDataSeriesByColorValues } from '../../state/utils';
import { ColorConfig } from '../themes/theme';
import { Accessor } from '../utils/accessor';
import { GroupId, SpecId } from '../utils/ids';
import { splitSpecsByGroupId, YBasicSeriesSpec } from './domains/y_domain';
import { BasicSeriesSpec, Datum, SeriesAccessors } from './specs';
import { computeYStackedMapValues, getYValueStackMap } from './stacked_series_utils';

export interface RawDataSeriesDatum {
  /** the x value */
  x: number | string;
  /** the main y metric */
  y1: number | null;
  /** the optional y0 metric, used for bars or area with a lower bound */
  y0?: number | null;
  /** the datum */
  datum?: any;
}

export interface DataSeriesDatum {
  x: number | string;
  /** the max y value */
  y1: number | null;
  /** the minimum y value */
  y0: number | null;
  /** initial y1 value, non stacked */
  initialY1: number | null;
  /** initial y0 value, non stacked */
  initialY0: number | null;
  /** the datum */
  datum?: any;
}

export interface DataSeries {
  specId: SpecId;
  key: any[];
  seriesColorKey: string;
  data: DataSeriesDatum[];
}
export interface RawDataSeries {
  specId: SpecId;
  key: any[];
  seriesColorKey: string;
  data: RawDataSeriesDatum[];
}

export interface FormattedDataSeries {
  groupId: GroupId;
  dataSeries: DataSeries[];
  counts: DataSeriesCounts;
}

export interface DataSeriesCounts {
  barSeries: number;
  lineSeries: number;
  areaSeries: number;
  basicSeries: number;
}

export interface DataSeriesColorsValues {
  specId: SpecId;
  colorValues: any[];
  lastValue?: any;
  specSortIndex?: number;
}

/**
 * Split a dataset into multiple series, each having a key with the relative
 * series configuration
 */
export function splitSeries(
  data: Datum[],
  accessors: SeriesAccessors,
  specId: SpecId,
): {
  rawDataSeries: RawDataSeries[];
  colorsValues: Map<string, any[]>;
  xValues: Set<any>;
  splitSeriesLastValues: Map<string, any>;
} {
  const { xAccessor, yAccessors, y0Accessors, splitSeriesAccessors = [] } = accessors;
  const colorAccessors = accessors.colorAccessors ? accessors.colorAccessors : splitSeriesAccessors;
  const isMultipleY = yAccessors && yAccessors.length > 1;
  const series = new Map<string, RawDataSeries>();
  const colorsValues = new Map<string, any[]>();
  const xValues = new Set<any>();
  const splitSeriesLastValues = new Map<string, any>();

  data.forEach((datum) => {
    const seriesKey = getAccessorsValues(datum, splitSeriesAccessors);
    if (isMultipleY) {
      yAccessors.forEach((accessor, index) => {
        const colorValues = getColorValues(datum, colorAccessors, accessor);
        const colorValuesKey = getColorValuesAsString(colorValues, specId);
        colorsValues.set(colorValuesKey, colorValues);
        const cleanedDatum = cleanDatum(
          datum,
          xAccessor,
          accessor,
          y0Accessors && y0Accessors[index],
        );
        splitSeriesLastValues.set(colorValuesKey, cleanedDatum.y1);
        xValues.add(cleanedDatum.x);
        updateSeriesMap(series, [...seriesKey, accessor], cleanedDatum, specId, colorValuesKey);
      }, {});
    } else {
      const colorValues = getColorValues(datum, colorAccessors);
      const colorValuesKey = getColorValuesAsString(colorValues, specId);
      colorsValues.set(colorValuesKey, colorValues);
      const cleanedDatum = cleanDatum(
        datum,
        xAccessor,
        yAccessors[0],
        y0Accessors && y0Accessors[0],
      );
      splitSeriesLastValues.set(colorValuesKey, cleanedDatum.y1);
      xValues.add(cleanedDatum.x);
      updateSeriesMap(series, [...seriesKey], cleanedDatum, specId, colorValuesKey);
    }
  }, {});

  return {
    rawDataSeries: [...series.values()],
    colorsValues,
    xValues,
    splitSeriesLastValues,
  };
}

/**
 * Mutate the passed map adding or updating the DataSeries stored
 * along with the series key
 */
function updateSeriesMap(
  seriesMap: Map<string, RawDataSeries>,
  seriesKey: any[],
  datum: RawDataSeriesDatum,
  specId: SpecId,
  seriesColorKey: string,
): Map<string, RawDataSeries> {
  const seriesKeyString = seriesKey.join('___');
  const series = seriesMap.get(seriesKeyString);
  if (series) {
    series.data.push(datum);
  } else {
    seriesMap.set(seriesKeyString, {
      specId,
      seriesColorKey,
      key: seriesKey,
      data: [datum],
    });
  }
  return seriesMap;
}

/**
 * Get the array of values that forms a series key
 */
function getAccessorsValues(datum: Datum, accessors: Accessor[] = []): any[] {
  return accessors
    .map((accessor) => {
      return datum[accessor];
    })
    .filter((value) => value !== undefined);
}

/**
 * Get the array of values that forms a series key
 */
function getColorValues(
  datum: Datum,
  colorAccessors: Accessor[] = [],
  yAccessorValue?: any,
): any[] {
  const colorValues = getAccessorsValues(datum, colorAccessors);
  if (yAccessorValue) {
    return [...colorValues, yAccessorValue];
  }
  return colorValues;
}
/**
 * Get the array of values that forms a series key
 */
export function getColorValuesAsString(colorValues: any[], specId: SpecId): string {
  return `specId:{${specId}},colors:{${colorValues}}`;
}

/**
 * Reformat the datum having only the required x and y property.
 */
function cleanDatum(
  datum: Datum,
  xAccessor: Accessor,
  yAccessor: Accessor,
  y0Accessor?: Accessor,
): RawDataSeriesDatum {
  const x = datum[xAccessor];
  const y1 = datum[yAccessor];
  const cleanedDatum: RawDataSeriesDatum = { x, y1, datum, y0: null };
  if (y0Accessor) {
    cleanedDatum.y0 = datum[y0Accessor];
  }
  return cleanedDatum;
}

export function getFormattedDataseries(
  specs: YBasicSeriesSpec[],
  dataSeries: Map<SpecId, RawDataSeries[]>,
): {
  stacked: FormattedDataSeries[];
  nonStacked: FormattedDataSeries[];
} {
  const specsByGroupIds = splitSpecsByGroupId(specs);
  const specsByGroupIdsEntries = [...specsByGroupIds.entries()];

  const stackedFormattedDataSeries: Array<{
    groupId: GroupId;
    dataSeries: DataSeries[];
    counts: DataSeriesCounts;
  }> = [];
  const nonStackedFormattedDataSeries: Array<{
    groupId: GroupId;
    dataSeries: DataSeries[];
    counts: DataSeriesCounts;
  }> = [];

  specsByGroupIdsEntries.forEach(([groupId, groupSpecs]) => {
    // format stacked data series
    const stackedDataSeries = getRawDataSeries(groupSpecs.stacked, dataSeries);
    stackedFormattedDataSeries.push({
      groupId,
      counts: stackedDataSeries.counts,
      dataSeries: formatStackedDataSeriesValues(stackedDataSeries.rawDataSeries, false),
    });

    // format non stacked data series
    const nonStackedDataSeries = getRawDataSeries(groupSpecs.nonStacked, dataSeries);
    nonStackedFormattedDataSeries.push({
      groupId,
      counts: nonStackedDataSeries.counts,
      dataSeries: formatNonStackedDataSeriesValues(nonStackedDataSeries.rawDataSeries, false),
    });
  });
  return {
    stacked: stackedFormattedDataSeries.filter((ds) => ds.dataSeries.length > 0),
    nonStacked: nonStackedFormattedDataSeries.filter((ds) => ds.dataSeries.length > 0),
  };
}

export function getRawDataSeries(
  seriesSpecs: YBasicSeriesSpec[],
  dataSeries: Map<SpecId, RawDataSeries[]>,
): {
  rawDataSeries: RawDataSeries[];
  counts: DataSeriesCounts;
} {
  const rawDataSeries: RawDataSeries[] = [];
  const counts = {
    barSeries: 0,
    lineSeries: 0,
    areaSeries: 0,
    basicSeries: 0,
  };
  const seriesSpecsCount = seriesSpecs.length;
  let i;
  for (i = 0; i < seriesSpecsCount; i++) {
    const spec = seriesSpecs[i];
    const { id, seriesType } = spec;
    const ds = dataSeries.get(id);
    switch (seriesType) {
      case 'bar':
        counts.barSeries += ds ? ds.length : 0;
        break;
      case 'line':
        counts.lineSeries += ds ? ds.length : 0;
        break;
      case 'area':
        counts.areaSeries += ds ? ds.length : 0;
        break;
      case 'basic':
        counts.basicSeries += ds ? ds.length : 0;
        break;
    }

    if (ds) {
      rawDataSeries.push(...ds);
    }
  }
  return {
    rawDataSeries,
    counts,
  };
}

export function formatNonStackedDataSeriesValues(
  dataseries: RawDataSeries[],
  scaleToExtent: boolean,
): DataSeries[] {
  const len = dataseries.length;
  let i;
  const formattedValues: DataSeries[] = [];
  for (i = 0; i < len; i++) {
    const formattedValue = formatNonStackedDataValues(dataseries[i], scaleToExtent);
    formattedValues.push(formattedValue);
  }
  return formattedValues;
}

export function formatNonStackedDataValues(
  dataSeries: RawDataSeries,
  scaleToExtent: boolean,
): DataSeries {
  const len = dataSeries.data.length;
  let i;
  const formattedValues: DataSeries = {
    key: dataSeries.key,
    specId: dataSeries.specId,
    seriesColorKey: dataSeries.seriesColorKey,
    data: [],
  };
  for (i = 0; i < len; i++) {
    const data = dataSeries.data[i];
    const { x, y1, datum } = data;
    let y0: number | null;
    if (scaleToExtent) {
      y0 = data.y0 ? data.y0 : y1;
    } else {
      y0 = data.y0 ? data.y0 : 0;
    }
    const formattedValue: DataSeriesDatum = {
      x,
      y1,
      y0,
      initialY1: y1,
      initialY0: y0,
      datum,
    };
    formattedValues.data.push(formattedValue);
  }
  return formattedValues;
}

export function formatStackedDataSeriesValues(
  dataseries: RawDataSeries[],
  scaleToExtent: boolean,
): DataSeries[] {
  const yValueStackMap: Map<any, number[]> = getYValueStackMap(dataseries);

  const stackedValues = computeYStackedMapValues(yValueStackMap, scaleToExtent);

  const stackedDataSeries: DataSeries[] = dataseries.map((ds, seriesIndex) => {
    const newData: DataSeriesDatum[] = [];
    ds.data.forEach((data) => {
      const { x, y1, datum } = data;
      if (stackedValues.get(x) === undefined) {
        return;
      }
      let computedY0: number | null;
      if (scaleToExtent) {
        computedY0 = data.y0 ? data.y0 : y1;
      } else {
        computedY0 = data.y0 ? data.y0 : 0;
      }
      const initialY0 = data.y0 == null ? null : data.y0;
      if (seriesIndex === 0) {
        newData.push({
          x,
          y1,
          y0: computedY0,
          initialY1: y1,
          initialY0,
          datum,
        });
      } else {
        const stack = stackedValues.get(x);
        if (!stack) {
          return;
        }
        const stackY = stack[seriesIndex];
        const stackedY1 = y1 !== null ? stackY + y1 : null;
        let stackedY0: number | null = data.y0 == null ? stackY : stackY + data.y0;
        // configure null y0 if y1 is null
        // it's semantically right to say y0 is null if y1 is null
        if (stackedY1 === null) {
          stackedY0 = null;
        }
        newData.push({
          x,
          y1: stackedY1,
          y0: stackedY0,
          initialY1: y1,
          initialY0: data.y0 === undefined ? null : data.y0,
          datum,
        });
      }
    });
    return {
      specId: ds.specId,
      key: ds.key,
      seriesColorKey: ds.seriesColorKey,
      data: newData,
    };
  });

  return stackedDataSeries;
}

export function getSplittedSeries(
  seriesSpecs: Map<SpecId, BasicSeriesSpec>,
  deselectedDataSeries?: DataSeriesColorsValues[] | null,
): {
  splittedSeries: Map<SpecId, RawDataSeries[]>;
  seriesColors: Map<string, DataSeriesColorsValues>;
  xValues: Set<any>;
} {
  const splittedSeries = new Map<SpecId, RawDataSeries[]>();
  const seriesColors = new Map<string, DataSeriesColorsValues>();
  const xValues: Set<any> = new Set();
  for (const [specId, spec] of seriesSpecs) {
    const dataSeries = splitSeries(spec.data, spec, specId);
    let currentRawDataSeries = dataSeries.rawDataSeries;
    if (deselectedDataSeries) {
      currentRawDataSeries = dataSeries.rawDataSeries.filter(
        (series): boolean => {
          const seriesValues = {
            specId,
            colorValues: series.key,
          };

          return findDataSeriesByColorValues(deselectedDataSeries, seriesValues) < 0;
        },
      );
    }

    splittedSeries.set(specId, currentRawDataSeries);

    dataSeries.colorsValues.forEach((colorValues, key) => {
      const lastValue = dataSeries.splitSeriesLastValues.get(key);

      seriesColors.set(key, {
        specId,
        specSortIndex: spec.sortIndex,
        colorValues,
        lastValue,
      });
    });

    for (const xValue of dataSeries.xValues) {
      xValues.add(xValue);
    }
  }
  return {
    splittedSeries,
    seriesColors,
    xValues,
  };
}

export function getSortedDataSeriesColorsValuesMap(
  colorValuesMap: Map<string, DataSeriesColorsValues>,
): Map<string, DataSeriesColorsValues> {
  const seriesColorsArray = [...colorValuesMap];
  seriesColorsArray.sort((seriesA, seriesB) => {
    const [, colorValuesA] = seriesA;
    const [, colorValuesB] = seriesB;

    const specAIndex =
      colorValuesA.specSortIndex != null ? colorValuesA.specSortIndex : colorValuesMap.size;
    const specBIndex =
      colorValuesB.specSortIndex != null ? colorValuesB.specSortIndex : colorValuesMap.size;

    return specAIndex - specBIndex;
  });

  return new Map([...seriesColorsArray]);
}

export function getSeriesColorMap(
  seriesColors: Map<string, DataSeriesColorsValues>,
  chartColors: ColorConfig,
  customColors: Map<string, string>,
): Map<string, string> {
  const seriesColorMap = new Map<string, string>();
  let counter = 0;

  seriesColors.forEach((value: DataSeriesColorsValues, seriesColorKey: string) => {
    const customSeriesColor: string | undefined = customColors.get(seriesColorKey);
    const color =
      customSeriesColor || chartColors.vizColors[counter % chartColors.vizColors.length];

    seriesColorMap.set(seriesColorKey, color);
    counter++;
  });
  return seriesColorMap;
}
