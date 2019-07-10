import { DataSeries, DataSeriesDatum, RawDataSeries } from './series';

interface StackedValues {
  values: number[];
  percent: number[];
  total: number;
}

/**
 * Map each y value from a RawDataSeries on it's specific x value into,
 * ordering the stack based on the dataseries index.
 * @param dataseries
 */
export function getYValueStackMap(dataseries: RawDataSeries[]): Map<any, number[]> {
  const stackMap = new Map<any, number[]>();
  dataseries.forEach((ds, index) => {
    for (const [, data] of ds.data) {
      data.forEach((datum) => {
        const stack = stackMap.get(datum.x) || new Array(dataseries.length).fill(0);
        stack[index] = datum.y1;
        stackMap.set(datum.x, stack);
      });
    }
  });
  return stackMap;
}

/**
 * For each key of the yValueStackMap, it stacks the values one after the other,
 * summing the previous value to the next one.
 * @param yValueStackMap
 * @param scaleToExtent
 */
export function computeYStackedMapValues(
  yValueStackMap: Map<any, number[]>,
  scaleToExtent: boolean,
): Map<any, StackedValues> {
  const stackedValues = new Map<any, StackedValues>();

  yValueStackMap.forEach((yStackArray, xValue) => {
    const stackArray = yStackArray.reduce(
      (acc, currentValue, index) => {
        if (acc.values.length === 0) {
          if (scaleToExtent) {
            return {
              values: [currentValue, currentValue],
              total: currentValue,
            };
          }
          return {
            values: [0, currentValue],
            total: currentValue,
          };
        }
        return {
          values: [...acc.values, acc.values[index] + currentValue],
          total: acc.total + currentValue,
        };
      },
      {
        values: [] as number[],
        total: 0,
      },
    );
    const percent = stackArray.values.map((value) => {
      return value / stackArray.total;
    });
    stackedValues.set(xValue, {
      values: stackArray.values,
      percent,
      total: stackArray.total,
    });
  });
  return stackedValues;
}

export function formatStackedDataSeriesValues(
  dataseries: RawDataSeries[],
  scaleToExtent: boolean,
  isPercentageMode: boolean = false,
): DataSeries[] {
  const yValueStackMap = getYValueStackMap(dataseries);

  const stackedValues = computeYStackedMapValues(yValueStackMap, scaleToExtent);

  const stackedDataSeries: DataSeries[] = dataseries.map((ds, seriesIndex) => {
    const newData = new Map<string, DataSeriesDatum[]>();
    for (const [group, series] of ds.data) {
      series.forEach((data) => {
        const { x, y1, y0, datum, xAccessor, yAccessor } = data;
        if (stackedValues.get(x) === undefined) {
          return;
        }

        let computedY0: number | null;
        if (scaleToExtent) {
          computedY0 = y0 ? y0 : y1;
        } else {
          computedY0 = y0 ? y0 : 0;
        }
        const initialY0 = y0 == null ? null : y0;
        if (seriesIndex === 0) {
          if (!newData.has(group)) {
            newData.set(group, []);
          }

          newData.get(group)!.push({
            x,
            y1,
            xAccessor,
            yAccessor,
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
          const stackY = isPercentageMode ? stack.percent[seriesIndex] : stack.values[seriesIndex];
          let stackedY1: number | null = null;
          let stackedY0: number | null = null;
          if (isPercentageMode) {
            stackedY1 = y1 !== null ? stackY + y1 : null;
            stackedY0 = y0 != null ? stackY + y0 : stackY;
          } else {
            stackedY1 = y1 !== null ? stackY + y1 : null;
            stackedY0 = y0 != null ? stackY + y0 : stackY;
            // configure null y0 if y1 is null
            // it's semantically right to say y0 is null if y1 is null
            if (stackedY1 === null) {
              stackedY0 = null;
            }
          }

          if (!newData.has(group)) {
            newData.set(group, []);
          }

          newData.get(group)!.push({
            x,
            xAccessor,
            yAccessor,
            y1: stackedY1,
            y0: stackedY0,
            initialY1: y1,
            initialY0,
            datum,
          });
        }
      });
    }

    return {
      specId: ds.specId,
      keys: ds.keys,
      seriesKey: ds.seriesKey,
      data: newData,
    };
  });

  return stackedDataSeries;
}
