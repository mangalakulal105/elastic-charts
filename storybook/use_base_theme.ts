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

import { EUI_CHARTS_THEME_DARK, EUI_CHARTS_THEME_LIGHT } from '@elastic/eui/dist/eui_charts_theme';
import { createContext, useContext } from 'react';
import { $Values } from 'utility-types';

import { Theme, LIGHT_THEME, DARK_THEME } from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';

/**
 * Available themes
 * @internal
 */
export const ThemeName = Object.freeze({
  Light: 'Light' as const,
  Dark: 'Dark' as const,
  EUILight: 'EUI Light' as const,
  EUIDark: 'EUI Dark' as const,
});
/** @internal */
export type ThemeName = $Values<typeof ThemeName>;

const ThemeContext = createContext<ThemeName>(ThemeName.Light);
const BackgroundContext = createContext<string | undefined>(undefined);

export const ThemeProvider = ThemeContext.Provider;
export const BackgroundProvider = BackgroundContext.Provider;

const themeMap = {
  [ThemeName.Light]: LIGHT_THEME,
  [ThemeName.Dark]: DARK_THEME,
  [ThemeName.EUILight]: mergePartial(LIGHT_THEME, EUI_CHARTS_THEME_LIGHT.theme, { mergeOptionalPartialValues: true }),
  [ThemeName.EUIDark]: mergePartial(DARK_THEME, EUI_CHARTS_THEME_DARK.theme, { mergeOptionalPartialValues: true }),
};

export const useBaseTheme = (): Theme => {
  const themeName = useContext(ThemeContext);
  const background = useContext(BackgroundContext);

  return background
    ? mergePartial(
        themeMap[themeName],
        {
          background: {
            color: background,
          },
        },
        { mergeOptionalPartialValues: true },
      )
    : themeMap[themeName];
};
