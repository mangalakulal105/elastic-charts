import { SPEC_PARSED, SPEC_UNMOUNTED, SPEC_PARSING, UPSERT_SPEC, REMOVE_SPEC } from './actions/specs';
import { interactionsReducer } from './reducers/interactions';
import { ChartTypes } from '../chart_types';
import { XYAxisChartState } from '../chart_types/xy_chart/state/chart_state';
import { DataSeriesColorsValues } from '../chart_types/xy_chart/utils/series';
import { Spec } from '../specs';
import { DEFAULT_SETTINGS_SPEC } from '../specs/settings';
import { Dimensions } from '../utils/dimensions';
import { Point } from '../utils/point';
import { LegendItem } from '../chart_types/xy_chart/legend/legend';
import { TooltipLegendValue } from '../chart_types/xy_chart/tooltip/tooltip';
import { StateActions } from './actions';
import { CHART_RENDERED } from './actions/chart';
import { UPDATE_PARENT_DIMENSION } from './actions/chart_settings';

export type BackwardRef = () => React.RefObject<HTMLDivElement>;

/**
 * A set of chart-type-dependant functions that are required and called
 * globally by the <ChartContainer> and
 */
export interface InternalChartState {
  // the chart type
  chartType: ChartType;
  // returns a JSX element with the chart rendered (lenged excluded)
  chartRenderer(containerRef: BackwardRef): JSX.Element | null;
  // true if the brush is available for this chart type
  isBrushAvailable(globalState: GlobalChartState): boolean;
  // true if the chart is empty (no data displayed)
  isChartEmpty(globalState: GlobalChartState): boolean;
  // return the list of legend items
  getLegendItems(globalState: GlobalChartState): Map<string, LegendItem>;
  // return the list of values for each legend item
  getLegendItemsValues(globalState: GlobalChartState): Map<string, TooltipLegendValue>;
  // return the CSS pointer cursor depending on the internal chart state
  getPointerCursor(globalState: GlobalChartState): string;
}

export interface SpecList {
  [specId: string]: Spec;
}

export interface PointerState {
  position: Point;
  time: number;
}
export interface DragState {
  start: PointerState;
  end: PointerState;
}
export interface PointerStates {
  dragging: boolean;
  current: PointerState;
  down: PointerState | null;
  up: PointerState | null;
  lastDrag: DragState | null;
  lastClick: PointerState | null;
}

export interface InteractionsState {
  pointer: PointerStates;
  highlightedLegendItemKey: string | null;
  legendCollapsed: boolean;
  invertDeselect: boolean;
  deselectedDataSeries: DataSeriesColorsValues[];
}

export interface GlobalChartState {
  // an unique ID for each chart used by re-reselect to memoize selector per chart
  chartId: string;
  // true when all all the specs are parsed ad stored into the specs object
  specsInitialized: boolean;
  // true if the chart is rendered on dom
  chartRendered: boolean;
  // incremental count of the chart rendering
  chartRenderedCount: number;
  // the map of parsed specs
  specs: SpecList;
  // the chart type depending on the used specs
  chartType: ChartType | null;
  // a chart-type-dependant class that is used to render and share chart-type dependant functions
  internalChartState: InternalChartState | null;
  // the dimensions of the parent container, including the legend
  parentDimensions: Dimensions;
  // the state of the interactions
  interactions: InteractionsState;
}

export type ChartType = typeof ChartTypes.Pie | typeof ChartTypes.XYAxis | typeof ChartTypes.Global;

export const getInitialState = (chartId: string): GlobalChartState => ({
  chartId,
  specsInitialized: false,
  chartRendered: false,
  chartRenderedCount: 0,
  specs: {
    [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC,
  },
  chartType: null,
  internalChartState: null,
  interactions: {
    pointer: {
      dragging: false,
      current: {
        position: {
          x: -1,
          y: -1,
        },
        time: 0,
      },
      down: null,
      up: null,
      lastDrag: null,
      lastClick: null,
    },
    legendCollapsed: false,
    highlightedLegendItemKey: null,
    deselectedDataSeries: [],
    invertDeselect: false,
  },
  parentDimensions: {
    height: 0,
    width: 0,
    left: 0,
    top: 0,
  },
});

export const chartStoreReducer = (chartId: string) => {
  const initialState = getInitialState(chartId);
  return (state = initialState, action: StateActions): GlobalChartState => {
    switch (action.type) {
      case SPEC_PARSING:
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
        };
      case SPEC_PARSED:
        const chartType = findMainChartType(state.specs);

        if (isChartTypeChanged(state, chartType)) {
          const internalChartState = initInternalChartState(chartType);
          return {
            ...state,
            specsInitialized: true,
            chartRendered: false,
            chartType,
            internalChartState,
          };
        } else {
          return {
            ...state,
            specsInitialized: true,
            chartRendered: false,
            chartType,
          };
        }
      case SPEC_UNMOUNTED:
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
        };
      case UPSERT_SPEC:
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
          specs: {
            ...state.specs,
            [action.spec.id]: action.spec,
          },
        };
      case REMOVE_SPEC:
        const { [action.id]: specToRemove, ...rest } = state.specs;
        return {
          ...state,
          specsInitialized: false,
          chartRendered: false,
          specs: {
            ...rest,
          },
        };
      case CHART_RENDERED:
        const count = state.chartRendered ? state.chartRenderedCount : state.chartRenderedCount + 1;
        return {
          ...state,
          chartRendered: true,
          chartRenderedCount: count,
        };
      case UPDATE_PARENT_DIMENSION:
        return {
          ...state,
          parentDimensions: action.dimensions,
        };
      default:
        return {
          ...state,
          interactions: interactionsReducer(state.interactions, action),
        };
    }
  };
};

function findMainChartType(specs: SpecList) {
  const types = Object.keys(specs).reduce<{
    [chartType: string]: number;
  }>((acc, specId) => {
    const { chartType } = specs[specId];
    if (!acc[chartType]) {
      acc[chartType] = 0;
    }
    acc[chartType] = acc[chartType] + 1;
    return acc;
  }, {});
  const chartTypes = Object.keys(types).filter((type) => type !== 'global');
  if (chartTypes.length > 1) {
    // eslint-disable-next-line no-console
    console.warn('Multiple chart type on the same configuration');
    return null;
  } else {
    return chartTypes[0] as ChartType;
  }
}

function initInternalChartState(chartType: ChartType | null): InternalChartState | null {
  switch (chartType) {
    case 'pie':
      return null; // TODO add pie chart state
    case 'xy_axis':
      return new XYAxisChartState();
    default:
      return null;
  }
}

function isChartTypeChanged(state: GlobalChartState, newChartType: ChartType | null) {
  return state.chartType !== newChartType;
}
