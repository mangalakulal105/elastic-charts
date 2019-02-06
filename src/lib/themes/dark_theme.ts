import { palettes } from '@elastic/eui';
import { Theme } from './theme';

import {
  DEFAULT_CHART_MARGINS,
  DEFAULT_CHART_PADDING,
  DEFAULT_GEOMETRY_STYLES,
  DEFAULT_MISSING_COLOR,
} from './theme_commons';

export const DARK_THEME: Theme = {
  chartPaddings: DEFAULT_CHART_PADDING,
  chartMargins: DEFAULT_CHART_MARGINS,
  lineSeriesStyle: {
    line: {
      stroke: DEFAULT_MISSING_COLOR,
      strokeWidth: 1,
      visible: true,
    },
    border: {
      stroke: 'white',
      strokeWidth: 2,
      visible: false,
    },
    point: {
      visible: false,
      radius: 5,
      stroke: 'white',
      strokeWidth: 1,
    },
  },
  areaSeriesStyle: {
    area: {
      fill: DEFAULT_MISSING_COLOR,
      visible: true,
    },
    line: {
      stroke: DEFAULT_MISSING_COLOR,
      strokeWidth: 1,
      visible: true,
    },
    border: {
      stroke: 'white',
      strokeWidth: 2,
      visible: false,
    },
    point: {
      visible: false,
      radius: 4,
      stroke: 'white',
      strokeWidth: 1,
    },
  },
  barSeriesStyle: {
    border: {
      stroke: 'white',
      strokeWidth: 2,
      visible: false,
    },
  },
  sharedStyle: DEFAULT_GEOMETRY_STYLES,
  scales: {
    ordinal: {
      padding: 0.25,
    },
  },
  axes: {
    axisTitleStyle: {
      fontSize: 12,
      fontStyle: 'bold',
      fontFamily: `'Open Sans', Helvetica, Arial, sans-serif`,
      padding: 5,
      fill: 'white',
    },
    axisLineStyle: {
      stroke: 'white',
      strokeWidth: 1,
    },
    tickLabelStyle: {
      fontSize: 10,
      fontFamily: `'Open Sans', Helvetica, Arial, sans-serif`,
      fontStyle: 'normal',
      fill: 'white',
      padding: 0,
    },
    tickLineStyle: {
      stroke: 'white',
      strokeWidth: 1,
    },
  },
  colors: {
    vizColors: palettes.euiPaletteColorBlind.colors,
    defaultVizColor: DEFAULT_MISSING_COLOR,
  },
  interactions: {
    dimmingOpacity: 0.1,
  },
  legend: {
    verticalWidth: 150,
    horizontalHeight: 50,
  },
};
