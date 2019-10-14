import { getSpecId } from '../../../utils/ids';
import {
  BarGeometry,
  getGeometryStyle,
  isPointOnGeometry,
  PointGeometry,
  getBarStyleOverrides,
  getPointStyleOverrides,
} from './rendering';
import { BarSeriesStyle, SharedGeometryStyle, PointStyle } from '../../../utils/themes/theme';
import { DataSeriesDatum, SeriesIdentifier } from '../utils/series';
import { RecursivePartial, mergePartial } from '../../../utils/commons';

describe('Rendering utils', () => {
  test('check if point is in geometry', () => {
    const seriesStyle = {
      rect: {
        opacity: 1,
      },
      rectBorder: {
        strokeWidth: 1,
        visible: false,
      },
      displayValue: {
        fill: 'black',
        fontFamily: '',
        fontSize: 2,
        offsetX: 0,
        offsetY: 0,
        padding: 2,
      },
    };

    const geometry: BarGeometry = {
      color: 'red',
      seriesIdentifier: {
        specId: getSpecId('id'),
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: [],
      },
      value: {
        accessor: 'y1',
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      seriesStyle,
    };
    expect(isPointOnGeometry(0, 0, geometry)).toBe(true);
    expect(isPointOnGeometry(10, 10, geometry)).toBe(true);
    expect(isPointOnGeometry(0, 10, geometry)).toBe(true);
    expect(isPointOnGeometry(10, 0, geometry)).toBe(true);
    expect(isPointOnGeometry(-10, 0, geometry)).toBe(false);
    expect(isPointOnGeometry(-11, 0, geometry)).toBe(false);
    expect(isPointOnGeometry(11, 11, geometry)).toBe(false);
  });
  test('check if point is in point geometry', () => {
    const geometry: PointGeometry = {
      color: 'red',
      seriesIdentifier: {
        specId: getSpecId('id'),
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: [],
      },
      value: {
        accessor: 'y1',
        x: 0,
        y: 0,
      },
      transform: {
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
      radius: 10,
    };
    expect(isPointOnGeometry(0, 0, geometry)).toBe(true);
    expect(isPointOnGeometry(10, 10, geometry)).toBe(true);
    expect(isPointOnGeometry(0, 10, geometry)).toBe(true);
    expect(isPointOnGeometry(10, 0, geometry)).toBe(true);
    expect(isPointOnGeometry(11, 11, geometry)).toBe(false);
    expect(isPointOnGeometry(-10, 0, geometry)).toBe(true);
    expect(isPointOnGeometry(-11, 0, geometry)).toBe(false);
    expect(isPointOnGeometry(11, 11, geometry)).toBe(false);
  });

  test('should get common geometry style dependent on legend item highlight state', () => {
    const seriesIdentifier = {
      specId: getSpecId('id'),
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: [],
    };
    const highlightedLegendItem = {
      key: '',
      color: '',
      label: '',
      value: {
        colorValues: [],
        specId: getSpecId('id'),
      },
      isSeriesVisible: true,
      isLegendItemVisible: true,
      displayValue: {
        raw: '',
        formatted: '',
      },
    };

    const unhighlightedLegendItem = {
      ...highlightedLegendItem,
      value: {
        colorValues: [],
        specId: getSpecId('foo'),
      },
    };

    const sharedThemeStyle: SharedGeometryStyle = {
      default: {
        opacity: 1,
      },
      highlighted: {
        opacity: 0.5,
      },
      unhighlighted: {
        opacity: 0.25,
      },
    };

    // no highlighted elements
    const defaultStyle = getGeometryStyle(seriesIdentifier, null, sharedThemeStyle);
    expect(defaultStyle).toBe(sharedThemeStyle.default);

    // should equal highlighted opacity
    const highlightedStyle = getGeometryStyle(seriesIdentifier, highlightedLegendItem, sharedThemeStyle);
    expect(highlightedStyle).toBe(sharedThemeStyle.highlighted);

    // should equal unhighlighted opacity
    const unhighlightedStyle = getGeometryStyle(seriesIdentifier, unhighlightedLegendItem, sharedThemeStyle);
    expect(unhighlightedStyle).toBe(sharedThemeStyle.unhighlighted);

    // should equal custom spec highlighted opacity
    const customHighlightedStyle = getGeometryStyle(seriesIdentifier, highlightedLegendItem, sharedThemeStyle);
    expect(customHighlightedStyle).toBe(sharedThemeStyle.highlighted);

    // unhighlighted elements remain unchanged with custom opacity
    const customUnhighlightedStyle = getGeometryStyle(seriesIdentifier, unhighlightedLegendItem, sharedThemeStyle);
    expect(customUnhighlightedStyle).toBe(sharedThemeStyle.unhighlighted);

    // has individual highlight
    const hasIndividualHighlight = getGeometryStyle(seriesIdentifier, null, sharedThemeStyle, {
      hasHighlight: true,
      hasGeometryHover: true,
    });
    expect(hasIndividualHighlight).toBe(sharedThemeStyle.highlighted);

    // no highlight
    const noHighlight = getGeometryStyle(seriesIdentifier, null, sharedThemeStyle, {
      hasHighlight: false,
      hasGeometryHover: true,
    });
    expect(noHighlight).toBe(sharedThemeStyle.unhighlighted);

    // no geometry hover
    const noHover = getGeometryStyle(seriesIdentifier, null, sharedThemeStyle, {
      hasHighlight: true,
      hasGeometryHover: false,
    });
    expect(noHover).toBe(sharedThemeStyle.highlighted);
  });

  describe('getBarStyleOverrides', () => {
    let mockAccessor: jest.Mock;

    const sampleSeriesStyle: BarSeriesStyle = {
      rect: {
        opacity: 1,
      },
      rectBorder: {
        visible: true,
        strokeWidth: 1,
      },
      displayValue: {
        fontSize: 10,
        fontFamily: 'helvetica',
        fill: 'blue',
        padding: 1,
        offsetX: 1,
        offsetY: 1,
      },
    };
    const datum: DataSeriesDatum = {
      x: 1,
      y1: 2,
      y0: 3,
      initialY1: 4,
      initialY0: 5,
    };
    const seriesIdentifier: SeriesIdentifier = {
      specId: getSpecId('test'),
      yAccessor: 'test',
      splitAccessors: new Map(),
      seriesKeys: ['test'],
    };

    beforeEach(() => {
      mockAccessor = jest.fn();
    });

    it('should return input seriesStyle if no barStyleAccessor is passed', () => {
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle);

      expect(styleOverrides).toBe(sampleSeriesStyle);
    });

    it('should return input seriesStyle if barStyleAccessor returns null', () => {
      mockAccessor.mockReturnValue(null);
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);

      expect(styleOverrides).toBe(sampleSeriesStyle);
    });

    it('should call barStyleAccessor with datum and seriesIdentifier', () => {
      getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);

      expect(mockAccessor).toBeCalledWith(datum, seriesIdentifier);
    });

    it('should return seriesStyle with updated fill color', () => {
      const color = 'blue';
      mockAccessor.mockReturnValue(color);
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);
      const expectedStyles: BarSeriesStyle = {
        ...sampleSeriesStyle,
        rect: {
          ...sampleSeriesStyle.rect,
          fill: color,
        },
      };
      expect(styleOverrides).toEqual(expectedStyles);
    });

    it('should return a new seriesStyle object with color', () => {
      mockAccessor.mockReturnValue('blue');
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);

      expect(styleOverrides).not.toBe(sampleSeriesStyle);
    });

    it('should return seriesStyle with updated partial style', () => {
      const partialStyle: RecursivePartial<BarSeriesStyle> = {
        rect: {
          fill: 'blue',
        },
        rectBorder: {
          strokeWidth: 10,
        },
      };
      mockAccessor.mockReturnValue(partialStyle);
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);
      const expectedStyles = mergePartial(sampleSeriesStyle, partialStyle, {
        mergeOptionalPartialValues: true,
      });

      expect(styleOverrides).toEqual(expectedStyles);
    });

    it('should return a new seriesStyle object with partial styles', () => {
      mockAccessor.mockReturnValue({
        rect: {
          fill: 'blue',
        },
      });
      const styleOverrides = getBarStyleOverrides(datum, seriesIdentifier, sampleSeriesStyle, mockAccessor);

      expect(styleOverrides).not.toBe(sampleSeriesStyle);
    });
  });

  describe('getPointStyleOverrides', () => {
    let mockAccessor: jest.Mock;

    const datum: DataSeriesDatum = {
      x: 1,
      y1: 2,
      y0: 3,
      initialY1: 4,
      initialY0: 5,
    };
    const seriesIdentifier: SeriesIdentifier = {
      specId: getSpecId('test'),
      yAccessor: 'test',
      splitAccessors: new Map(),
      seriesKeys: ['test'],
    };

    beforeEach(() => {
      mockAccessor = jest.fn();
    });

    it('should return undefined if no pointStyleAccessor is passed', () => {
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier);

      expect(styleOverrides).toBeUndefined();
    });

    it('should return undefined if pointStyleAccessor returns null', () => {
      mockAccessor.mockReturnValue(null);
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, mockAccessor);

      expect(styleOverrides).toBeUndefined();
    });

    it('should call pointStyleAccessor with datum and seriesIdentifier', () => {
      getPointStyleOverrides(datum, seriesIdentifier, mockAccessor);

      expect(mockAccessor).toBeCalledWith(datum, seriesIdentifier);
    });

    it('should return seriesStyle with updated stroke color', () => {
      const stroke = 'blue';
      mockAccessor.mockReturnValue(stroke);
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, mockAccessor);
      const expectedStyles: Partial<PointStyle> = {
        stroke,
      };
      expect(styleOverrides).toEqual(expectedStyles);
    });
  });
});
