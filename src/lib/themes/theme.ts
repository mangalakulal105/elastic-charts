import { GeometryStyle } from '../series/rendering';
import { Margins } from '../utils/dimensions';
import { LIGHT_THEME } from './light_theme';

interface Visible {
  visible: boolean;
}
interface Radius {
  radius: number;
}
export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontStyle?: string;
  fill: string;
  padding: number;
}
export interface GeometryStyle {
  stroke: string;
  strokeWidth: number;
  fill?: string;
  opacity?: number;
}

export interface SharedGeometryStyle {
  [key: string]: GeometryStyle;
}

export interface StrokeStyle {
  stroke: string;
  strokeWidth: number;
}
export interface FillStyle {
  fill: string;
}

export interface AxisConfig {
  axisTitleStyle: TextStyle;
  axisLineStyle: StrokeStyle;
  tickLabelStyle: TextStyle;
  tickLineStyle: StrokeStyle;
}
export interface GridLineConfig {
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  dash?: number[];
}
export interface ScalesConfig {
  ordinal: {
    padding: number;
  };
}
export interface ColorConfig {
  vizColors: string[];
  defaultVizColor: string;
}
export interface InteractionConfig {
  dimmingOpacity: number;
}
export interface LegendStyle {
  verticalWidth: number;
  horizontalHeight: number;
}
export interface Theme {
  /**
   * Space btw parent DOM element and first available element of the chart (axis if exists, else the chart itself)
   */
  chartMargins: Margins;
  /**
   * Space btw the chart geometries and axis; if no axis, pads space btw chart & container
   */
  chartPaddings: Margins;
  lineSeriesStyle: LineSeriesStyle;
  areaSeriesStyle: AreaSeriesStyle;
  barSeriesStyle: BarSeriesStyle;
  sharedStyle: SharedGeometryStyle;
  axes: AxisConfig;
  scales: ScalesConfig;
  colors: ColorConfig;
  interactions: InteractionConfig;
  legend: LegendStyle;
}
export interface BarSeriesStyle {
  border: StrokeStyle & Visible;
}
export interface LineSeriesStyle {
  line: StrokeStyle & Visible;
  border: StrokeStyle & Visible;
  point: StrokeStyle & Visible & Radius;
}
export interface AreaSeriesStyle {
  area: FillStyle & Visible;
  line: StrokeStyle & Visible;
  border: StrokeStyle & Visible;
  point: StrokeStyle & Visible & Radius;
}
export interface PartialTheme {
  chartMargins?: Margins;
  chartPaddings?: Margins;
  lineSeriesStyle?: LineSeriesStyle;
  areaSeriesStyle?: AreaSeriesStyle;
  barSeriesStyle?: BarSeriesStyle;
  axes?: Partial<AxisConfig>;
  scales?: Partial<ScalesConfig>;
  colors?: Partial<ColorConfig>;
  interactions?: Partial<InteractionConfig>;
  legend?: Partial<LegendStyle>;
}

export const DEFAULT_GRID_LINE_CONFIG: GridLineConfig = {
  stroke: 'red',
  strokeWidth: 1,
  opacity: 1,
};

export function mergeWithDefaultTheme(
  theme: PartialTheme,
  defaultTheme: Theme = LIGHT_THEME,
): Theme {
  const customTheme: Theme = {
    ...defaultTheme,
  };
  if (theme.chartMargins) {
    customTheme.chartMargins = {
      ...defaultTheme.chartMargins,
      ...theme.chartMargins,
    };
  }
  if (theme.chartPaddings) {
    customTheme.chartPaddings = {
      ...defaultTheme.chartPaddings,
      ...theme.chartPaddings,
    };
  }
  if (theme.areaSeriesStyle) {
    customTheme.areaSeriesStyle = {
      ...defaultTheme.areaSeriesStyle,
      ...theme.areaSeriesStyle,
    };
  }
  if (theme.lineSeriesStyle) {
    customTheme.lineSeriesStyle = {
      ...defaultTheme.lineSeriesStyle,
      ...theme.lineSeriesStyle,
    };
  }
  if (theme.scales) {
    customTheme.scales.ordinal = {
      ...defaultTheme.scales.ordinal,
      ...theme.scales.ordinal,
    };
  }
  if (theme.axes) {
    customTheme.axes = {
      ...defaultTheme.axes,
      ...theme.axes,
    };
  }
  if (theme.colors) {
    if (theme.colors.defaultVizColor) {
      customTheme.colors.defaultVizColor = theme.colors.defaultVizColor;
    }
    if (theme.colors.vizColors) {
      customTheme.colors.vizColors = theme.colors.vizColors;
    }
  }
  if (theme.interactions) {
    customTheme.interactions = {
      ...defaultTheme.interactions,
      ...theme.interactions,
    };
  }
  if (theme.legend) {
    customTheme.legend = {
      ...defaultTheme.legend,
      ...theme.legend,
    };
  }
  return customTheme;
}
