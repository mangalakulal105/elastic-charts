/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useState } from 'react';

import { BackgroundParameter } from '../../../storybook/node_modules/storybook-addon-background-toggle';
import { ThemeParameter } from '../../../storybook/node_modules/storybook-addon-theme-toggle';
import { parameters as globalParams } from '../../../storybook/preview';
import { ThemeId } from '../../../storybook/use_base_theme';

interface Globals {
  theme?: string;
  background?: string;
}

type Parameters = BackgroundParameter & ThemeParameter;

const themeParams = globalParams.theme!;
const backgroundParams = globalParams.background!;

const combineClasses = (classes: string | string[]) => (typeof classes === 'string' ? [classes] : classes);
const getThemeAllClasses = ({ themes }: Required<ThemeParameter>['theme']) =>
  themes.reduce<string[]>((acc, t) => {
    if (!t.class) return acc;
    return [...acc, ...(typeof t.class === 'string' ? [t.class] : t.class)];
  }, []);
const getTargetSelector = ({ selector }: Required<ThemeParameter>['theme']) =>
  (Array.isArray(selector) ? selector.join(', ') : selector) ?? 'body';

function setTheme(themeId: string) {
  const theme = themeParams.themes.find((t) => t.id === themeId);
  const selector = getTargetSelector(themeParams);
  const targets = selector ? document.querySelectorAll<HTMLElement>(selector) : null;

  if (targets) {
    const all = getThemeAllClasses(themeParams);
    const classes = theme?.class ? combineClasses(theme.class) : null;

    targets.forEach((e) => {
      all.forEach((c) => e.classList.remove(c));
      if (classes) classes.forEach((c) => e.classList.add(c));
    });
  }
}

function getBackground(backgroundId?: string) {
  if (!backgroundId) return '';

  const option = (backgroundParams.options ?? []).find(({ id }) => id === backgroundId);

  return option ? option.background ?? option.color : '';
}

export function useGlobalsParameters() {
  const [themeName, setThemeName] = useState<string>(ThemeId.Light);
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>('white');

  /**
   * Handles setting global context values. Stub for theme and background addons
   */
  function setParams(params: URLSearchParams, parameters?: Parameters) {
    const globals = getGlobalParams(params) as Globals;
    const themeId = globals.theme ?? parameters?.theme?.default ?? themeParams.default ?? ThemeId.Light;
    const backgroundId = globals.background ?? parameters?.background?.default ?? backgroundParams.default;
    setThemeName(themeId);
    setTheme(themeId);
    setBackgroundColor(getBackground(backgroundId));
  }

  return {
    themeName,
    backgroundColor,
    setParams,
  };
}

function getGlobalParams(params: URLSearchParams) {
  const globals = params.get('globals') ?? '';
  return Object.fromEntries(globals.split(';').map((pair: string) => pair.split(':')));
}
