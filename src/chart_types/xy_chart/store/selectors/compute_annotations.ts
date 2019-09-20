import createCachedSelector from 're-reselect';
import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import { getAxisSpecsSelector, getAnnotationSpecsSelector } from './get_specs';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import { computeAnnotationDimensions, AnnotationDimensions } from '../../annotations/annotation_utils';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { AnnotationId } from '../../../../utils/ids';
import { IChartState } from '../../../../store/chart_store';
const getChartId = (state: IChartState) => state.chartId;
export const computeAnnotationDimensionsSelector = createCachedSelector(
  [
    getChartId,
    getAnnotationSpecsSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
    computeSeriesGeometriesSelector,
    getAxisSpecsSelector,
    countBarsInClusterSelector,
    isHistogramModeEnabledSelector,
    getAxisSpecsSelector,
  ],
  (
    chartId,
    annotationSpecs,
    chartDimensions,
    settingsSpec,
    seriesGeometries,
    axesSpecs,
    totalBarsInCluster,
    isHistogramMode,
  ): Map<AnnotationId, AnnotationDimensions> => {
    console.log('--- 11 computeAnnotationDimensionsSelector ---', annotationSpecs);
    const { yScales, xScale } = seriesGeometries.scales;
    return computeAnnotationDimensions(
      annotationSpecs,
      chartDimensions.chartDimensions,
      settingsSpec.rotation,
      yScales,
      xScale,
      axesSpecs,
      totalBarsInCluster,
      isHistogramMode,
    );
  },
)((state) => state.chartId);
