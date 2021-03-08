/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { connect } from 'react-redux';

import { ComputedScales } from '../../chart_types/xy_chart/state/utils/types';
import { Scale } from '../../scales';
import { ScaleType } from '../../scales/constants';
import { SeriesName, SeriesNameConfigOptions, SeriesNameFn, SeriesTypes } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderDataSelector } from '../../state/selectors/get_screen_reader_data';

export interface ScreenReaderData {
  seriesName: SeriesName | SeriesNameFn | undefined | SeriesNameConfigOptions;
  seriesType: SeriesTypes;
  splitAccessor: boolean;
  dataKey: string[];
  dataValue: any[];
  scales: ComputedScales;
  axesTitles: (string | undefined)[][];
}

export interface ScreenReaderDataTableStateProps {
  data: ScreenReaderData[];
}

/** helper function to read out each number  and type of series */
const readOutSeriesCountandType = (s: { [s: string]: number } | ArrayLike<number>) => {
  let returnString = '';
  for (let i = 0; i < Object.entries(s).length; i++) {
    const seriesT = Object.entries(s)[i][0];
    const seriesC = Object.entries(s)[i][1];
    returnString +=
      seriesC === 1 ? `There is ${seriesC} ${seriesT} series. ` : `There are ${seriesC} ${seriesT} series. `;
  }
  return returnString;
};

/** helper function to read out each title of the axes */
const axesWithTitles = (titles: (undefined | string)[][], scales: ComputedScales) => {
  let titleDomain = `There are ${scales.yScales.size} y-axes. `;

  for (let i = 1; i < scales.yScales.size + 1; i++) {
    const axisTitle = titles[i][0];
    const axisDomain =
      scales.yScales.get(titles[i][1]!)!.domain === undefined
        ? 'The axis does not have a defined domain'
        : `${scales.yScales.get(titles[i][1]!)!.domain}`;
    titleDomain +=
      scales.yScales.size === 1
        ? `The y-axis has the title ${axisTitle} with the domain ${axisDomain}. `
        : `${i}. A y-axis is named ${axisTitle} with the domain ${axisDomain}. `;
  }

  return titleDomain;
};

/** helper function to read out each title for the axes if present */
const getAxesTitlesAndDomains = (d: ScreenReaderData[]) => {
  const {
    axesTitles,
    scales: { xScale, yScales },
  } = d[0];
  const firstXAxisTitle =
    axesTitles[0][0] === undefined ? 'The x axis is not titled' : `The x axis is titled ${axesTitles[0][0]}`;
  const firstXAxisGroupId = axesTitles[0][1];
  const multipleTitles = Object.entries(d[0].axesTitles).length >= 2;
  const yAxisGroupId = axesTitles[1][1] ?? '__global__';
  return multipleTitles
    ? `This chart has multiple axes. The x-axis is ${xScale.type} with a domain of ${xScale.domain}. The y-axes are ${
        yScales.get(yAxisGroupId)?.type
      }. ${axesWithTitles(d[0].axesTitles, d[0].scales)}`
    : `${firstXAxisTitle}. ${
        firstXAxisGroupId === undefined
          ? `Its y axis does not have a defined domain.`
          : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `The y axis domain is ${yScales.get(yAxisGroupId)?.domain}`
      }`;
};

const formatForTimeOrOrdinalXAxis = (xScale: Scale) => {
  if (xScale.domain === undefined) return 'is undefined';
  if (xScale.type === 'ordinal') return `has an ordinal scale. The domain is ${xScale.domain.toString()}`;
  const [startDomain, endDomain] = xScale.domain;
  return xScale.type !== ScaleType.Time
    ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      ` is ${xScale.type}. The domain is ${startDomain} to ${endDomain}`
    : `scale type is time with the domain ${new Date(startDomain).toTimeString()} to ${new Date(
        endDomain,
      ).toTimeString()}`;
};

/** @internal */
export const computeAlternativeChartText = (d: ScreenReaderData[]): string => {
  const { seriesName, axesTitles, splitAccessor, seriesType, scales } = d[0];
  const numberOfSeriesByType: { [key: string]: number } = {};
  d.forEach(() => {
    if (numberOfSeriesByType[seriesType]) {
      numberOfSeriesByType[seriesType]++;
    } else {
      numberOfSeriesByType[seriesType] = 1;
    }
  });

  const namedSeries = seriesName !== undefined ? `The chart is named ${seriesName}. ` : '';

  const mixedSeriesChart =
    Object.keys(numberOfSeriesByType).length > 1 ? `This chart has different series types in it.` : '';

  const yAxisGroupId = axesTitles[1][1] ?? '__global__';
  const stackedSeries = splitAccessor
    ? `This chart has stacked series in it. The scale type of the y axes are ${
        scales.yScales.get(yAxisGroupId)?.type
      }. `
    : '';

  const multipleSeries = d.length > 1;
  const typesOfSeries = multipleSeries
    ? readOutSeriesCountandType(numberOfSeriesByType)
    : `There is one ${seriesType} series in this chart.`;

  const chartHasAxes =
    axesTitles.length === 0
      ? 'This chart does not have axes.'
      : `The x axis ${formatForTimeOrOrdinalXAxis(scales.xScale)}. ${getAxesTitlesAndDomains(d)}`;

  return `${namedSeries}${mixedSeriesChart} ${stackedSeries} ${
    mixedSeriesChart !== '' || stackedSeries !== '' ? `It` : `The  chart`
  } has ${d.length} series in it. ${typesOfSeries} ${chartHasAxes}`;
};

/** @internal */
export const ScreenReaderDataTableComponent = (props: ScreenReaderDataTableStateProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }
};

const DEFAULT_PROPS = {
  data: [],
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderDataTableStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    data: getScreenReaderDataSelector(state),
  };
};

/** @internal */
export const ScreenReaderDataTable = connect(mapStateToProps)(
  // @ts-ignore
  ScreenReaderDataTableComponent,
);
