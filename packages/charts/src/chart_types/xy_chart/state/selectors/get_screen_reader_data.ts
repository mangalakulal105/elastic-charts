/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesKey } from '../../../../common/series_id';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { Rotation } from '../../../../utils/common';
import { BandedAccessorType } from '../../../../utils/geometry';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../../xy_chart/state/selectors/get_specs';
import { getBandedLegendItemLabel, getPostfix } from '../../legend/legend';
import { getXScaleTypeFromSpec } from '../../scales/get_api_scales';
import { isHorizontalAxis } from '../../utils/axis_type_utils';
import { defaultTickFormatter } from '../../utils/axis_utils';
import { DataSeries, getSeriesKey, getSeriesName, isBandedSpec, XYChartSeriesIdentifier } from '../../utils/series';
import { AxisSpec, BasicSeriesSpec, StackMode, TickFormatter, TickFormatterOptions } from '../../utils/specs';
import { getLastValues } from '../utils/get_last_value';
import { getSpecsById, getAxesSpecForSpecId } from '../utils/spec';
import { LastValues } from '../utils/types';
import { computeSeriesDomainsSelector } from './compute_series_domains';

interface FormattedDefaultExtraValue {
  xValue?: number | string | null;
  smPanelTitle?: string | number;
  raw: number | null;
  formatted: string | number | null;
  legendSizingLabel: string | number | null;
}

/**@internal */
export interface CartesianData {
  isSmallMultiple: boolean;
  smallMultipleTitle: (string | number | undefined)[];
  xScaleType?: ScaleType;
  yScaleType?: ScaleType;
  hasAxes: boolean;
  numberOfItemsInGroup: number;
  data: any[];
  axesTitles?: string;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getSmallMultiplesSpec,
    getAxisSpecsSelector,
    computeSeriesDomainsSelector,
    getSettingsSpecSelector,
    getAxisSpecsSelector,
  ],
  (specs, isSmallMultiple, axis, { formattedDataSeries, xDomain }, { rotation }, axesTitles): CartesianData => {
    const allValues = getValues(formattedDataSeries);
    if (specs.length === 0) {
      return {
        isSmallMultiple: false,
        smallMultipleTitle: [],
        xScaleType: undefined,
        yScaleType: undefined,
        hasAxes: false,
        data: [],
        numberOfItemsInGroup: 0,
      };
    }
    return {
      isSmallMultiple: isSmallMultiple ? true : false,
      smallMultipleTitle: getSmallMultipleTitle(axis),
      data: computeScreenReaderValues(formattedDataSeries, allValues, specs, axis, rotation),
      numberOfItemsInGroup: getLastValues(formattedDataSeries, xDomain).size,
      xScaleType: specs[0].xScaleType,
      yScaleType: specs[0].yScaleType,
      hasAxes: axis.length > 0 ? true : false,
      axesTitles: getAxesDescription(axesTitles),
    };
  },
);

/**@internal */
function getValues(dataSeries: DataSeries[]): Map<SeriesKey, { y0: number | null; y1: number | null }[]> {
  const allValues: Map<SeriesKey, { y0: any; y1: number | null }[]> = new Map();
  dataSeries.forEach((series) => {
    const seriesLastValues: { y0: number | null; y1: number | null }[] = [];
    series.data.forEach((data) => {
      const { y0, y1, initialY0, initialY1 } = data;
      const seriesKey = getSeriesKey(series as XYChartSeriesIdentifier, series.groupId);

      if (series.stackMode === StackMode.Percentage && allValues.has(seriesKey)) {
        const y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
        seriesLastValues.push({ y0, y1: y1InPercentage });
        allValues.set(seriesKey, seriesLastValues);
      }
      if (initialY0 !== null || initialY1 !== null) {
        seriesLastValues.push({ y0: initialY0, y1: initialY1 });
        allValues.set(seriesKey, seriesLastValues);
      }
    });
  });
  return allValues;
}

/**
 * This is similar to the getLegendExtra function and should return the same values
 * @param xScaleType
 * @param formatter
 * @param key
 * @param lastValue
 * @param xValue
 * @param smPanelTitle
 * @returns formattedDefaultExtraValue interface with the value, xValue, small multiple title to pull off into a data table
 */
/** @internal */
function getValueData(
  xScaleType: ScaleType,
  formatter: (value: any, options?: TickFormatterOptions | undefined) => string,
  key: keyof LastValues,
  lastValue: LastValues,
  tickFormatter?: TickFormatter<any>,
  xValue?: string | number,
  smPanelTitle?: string | number,
): FormattedDefaultExtraValue {
  const rawValue = (lastValue && lastValue[key]) ?? null;
  const formattedValue = rawValue !== null ? formatter(rawValue) : null;
  const validXValue = typeof xValue === 'string' ? xValue : tickFormatter ? tickFormatter(xValue) : formatter(xValue);
  return {
    raw: rawValue !== null ? rawValue : null,
    formatted: xScaleType === ScaleType.Ordinal ? null : formattedValue,
    legendSizingLabel: formattedValue,
    xValue: validXValue,
    smPanelTitle: smPanelTitle ?? undefined,
  };
}

function computeScreenReaderValues(
  dataSeries: DataSeries[],
  values: Map<SeriesKey, LastValues[]>,
  specs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  chartRotation: Rotation,
) {
  const items: {
    label: string;
    values: FormattedDefaultExtraValue[];
  }[] = [];
  let seriesData: {
    label: string;
    values: FormattedDefaultExtraValue[];
  };
  values.forEach((lastValues, key) => {
    const [relevantDataSeries] = dataSeries.filter((series) => series.key === key);
    const { specId, data, smVerticalAccessorValue, smHorizontalAccessorValue } = relevantDataSeries;
    const banded = isBandedSpec((relevantDataSeries as unknown) as BasicSeriesSpec);
    const spec = getSpecsById<BasicSeriesSpec>(specs, specId);
    const hasSingleSeries = dataSeries.length === 1;
    const name = getSeriesName(relevantDataSeries, hasSingleSeries, false, spec);
    if (name === '' || !spec) return;
    const postFixes = getPostfix(spec);
    const labelY1 = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y1, postFixes) : name;

    // Use this to get axis spec w/ tick formatter
    const { yAxis, xAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, chartRotation);
    const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;

    const xScaleType = getXScaleTypeFromSpec(spec.xScaleType);
    const label = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y0, postFixes) : labelY1;
    const defaultExtraValuesBySeries = lastValues.map((lastValue, index) => {
      const defaultExtra = banded
        ? getValueData(
            xScaleType,
            formatter,
            'y0',
            lastValue,
            xAxis?.tickFormat,
            data[index] ? data[index].x : undefined,
            smVerticalAccessorValue ?? smHorizontalAccessorValue,
          )
        : getValueData(
            xScaleType,
            formatter,
            'y1',
            lastValue,
            xAxis?.tickFormat,
            data[index] ? data[index].x : undefined,
            smVerticalAccessorValue ?? smHorizontalAccessorValue,
          );

      return (
        defaultExtra ?? {
          xValue: data[index] ? data[index].x : undefined,
          raw: null,
          formatted: null,
          legendSizingLabel: null,
        }
      );
    });
    seriesData = { label, values: defaultExtraValuesBySeries };
    items.push(seriesData);
  });
  return items;
}

/**@internal */
function getSmallMultipleTitle(axis: AxisSpec[]) {
  if (axis.length === 0) return [];
  return axis.length > 2 ? [axis[0].title, axis[1].title] : [axis[0].title ?? undefined] ?? [];
}

/**@internal */
function getAxesTitles(axisSpecs: AxisSpec[]) {
  if (!axisSpecs) return [];
  return axisSpecs.map(({ title, position }) => {
    const horizontal = isHorizontalAxis(position);
    return { position, isHorizontalAxis: horizontal, title };
  });
}

/**@internal */
function getAxesDescription(axes: AxisSpec[]) {
  const axesTitles = getAxesTitles(axes);
  const hasTitles = axesTitles.filter(({ title }) => title !== undefined);
  const getTitles = hasTitles.map(({ position, title }) => {
    return ` the ${position} axis is titled ${title}`;
  });
  return `The chart has ${axesTitles.length} axes. ${hasTitles.length} axes have titles: ${getTitles}`;
}
