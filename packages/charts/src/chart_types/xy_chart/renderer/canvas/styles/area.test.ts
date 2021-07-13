/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { Fill } from '../../../../../geoms/types';
import { getMockCanvas, getMockCanvasContext2D, MockStyles } from '../../../../../mocks';
import * as common from '../../../../../utils/common';
import { getTextureStyles } from '../../../utils/texture';
import { buildAreaStyles } from './area';

import 'jest-canvas-mock';

jest.mock('../../../../../common/color_library_wrappers');
jest.mock('../../../utils/texture');
jest.spyOn(common, 'getColorFromVariant');

const COLOR = 'aquamarine';

describe('Area styles', () => {
  let ctx: CanvasRenderingContext2D;
  let imgCanvas: HTMLCanvasElement;

  beforeEach(() => {
    ctx = getMockCanvasContext2D();
    imgCanvas = getMockCanvas();
  });

  describe('#buildAreaStyles', () => {
    let result: Fill;
    let baseColor = COLOR;
    let themeAreaStyle = MockStyles.area();
    let geometryStateStyle = MockStyles.geometryState();

    function setDefaults() {
      baseColor = COLOR;
      themeAreaStyle = MockStyles.area();
      geometryStateStyle = MockStyles.geometryState();
    }

    beforeEach(() => {
      result = buildAreaStyles(ctx, imgCanvas, baseColor, themeAreaStyle, geometryStateStyle);
    });

    it('should call getColorFromVariant with correct args for fill', () => {
      expect(common.getColorFromVariant).nthCalledWith(1, baseColor, themeAreaStyle.fill);
    });

    describe('Colors', () => {
      const fillColor = '#4aefb8';

      beforeAll(() => {
        setDefaults();
        (common.getColorFromVariant as jest.Mock).mockReturnValue(fillColor);
      });

      it('should call stringToRGB with values from getColorFromVariant', () => {
        expect(stringToRGB).nthCalledWith(1, fillColor, expect.any(Function));
      });

      it('should return fill with color', () => {
        expect(result.color).toEqual(stringToRGB(fillColor));
      });
    });

    describe('Opacity', () => {
      const fillColorOpacity = 0.5;
      const fillColor = `rgba(10,10,10,${fillColorOpacity})`;
      const fillOpacity = 0.6;
      const geoOpacity = 0.75;

      beforeAll(() => {
        setDefaults();
        themeAreaStyle = MockStyles.area({ opacity: fillOpacity });
        geometryStateStyle = MockStyles.geometryState({ opacity: geoOpacity });
        (common.getColorFromVariant as jest.Mock).mockReturnValue(fillColor);
      });

      it('should return correct fill opacity', () => {
        const expected = fillColorOpacity * fillOpacity * geoOpacity;
        expect(result.color.opacity).toEqual(expected);
      });
    });

    describe('Texture', () => {
      const texture = {};
      const mockTexture = {};

      beforeAll(() => {
        setDefaults();
        themeAreaStyle = MockStyles.area({ texture });
        (getTextureStyles as jest.Mock).mockReturnValue(mockTexture);
      });

      it('should return correct texture', () => {
        expect(result.texture).toEqual(mockTexture);
      });

      it('should call getTextureStyles with params', () => {
        expect(getTextureStyles).toBeCalledTimes(1);
        expect(getTextureStyles).toBeCalledWith(ctx, imgCanvas, baseColor, expect.anything(), texture);
      });
    });
  });
});
