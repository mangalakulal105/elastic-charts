export const CHART_RENDERED = 'CHART_RENDERED';

export interface ChartRenderedAction {
  type: typeof CHART_RENDERED;
}

export function onChartRendered(): ChartRenderedAction {
  return { type: CHART_RENDERED };
}

export type ChartActions = ChartRenderedAction;
