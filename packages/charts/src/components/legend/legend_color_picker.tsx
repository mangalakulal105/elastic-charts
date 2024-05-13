/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Color as ItemColor } from './color';
import { LegendItemProps } from './legend_item';
import { Color } from '../../common/colors';

/** @internal */
export const LEGEND_HIERARCHY_MARGIN = 10;

/** @internal */
export const LegendColorPicker = ({
  item: { color, isSeriesHidden, label, pointStyle, seriesIdentifiers },
  colorPicker: ColorPickerRenderer,
  clearTemporaryColorsAction,
  setTemporaryColorAction,
  setPersistedColorAction,
}: LegendItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const colorRef = React.useRef<HTMLButtonElement>(null);

  const shouldClearPersistedColor = React.useRef(false);

  const handleColorClick = (changeable: boolean) =>
    changeable
      ? (event: React.MouseEvent) => {
          event.stopPropagation();
          toggleIsOpen();
        }
      : undefined;

  const toggleIsOpen = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleColorPickerClose = () => {
    const seriesKeys = seriesIdentifiers.map(({ key }) => key);
    setPersistedColorAction(seriesKeys, shouldClearPersistedColor.current ? null : color);
    clearTemporaryColorsAction();
    requestAnimationFrame(() => colorRef.current?.focus());
    toggleIsOpen();
  };

  const handleColorPickerChange = (c: Color | null) => {
    const seriesKeys = seriesIdentifiers.map(({ key }) => key);
    shouldClearPersistedColor.current = c === null;
    setTemporaryColorAction(seriesKeys, c);
  };

  const hasColorPicker = Boolean(ColorPickerRenderer);

  return (
    <>
      <ItemColor
        ref={colorRef}
        color={color}
        seriesName={label}
        isSeriesHidden={isSeriesHidden}
        hasColorPicker={hasColorPicker}
        onClick={handleColorClick(hasColorPicker)}
        pointStyle={pointStyle}
      />
      {ColorPickerRenderer && isOpen && colorRef.current && (
        <ColorPickerRenderer
          anchor={colorRef.current}
          color={color}
          onClose={handleColorPickerClose}
          onChange={handleColorPickerChange}
          seriesIdentifiers={seriesIdentifiers}
        />
      )}
    </>
  );
};
