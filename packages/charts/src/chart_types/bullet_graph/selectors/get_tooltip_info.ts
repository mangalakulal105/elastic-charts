/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActiveValue } from './get_active_value';
import { TooltipInfo } from '../../../components/tooltip';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { clamp, isBetween } from '../../../utils/common';

/** @internal */
export const getTooltipInfo = createCustomCachedSelector([getActiveValue], (activeValue): TooltipInfo | undefined => {
  if (!activeValue) return;

  const showActive = true;
  const useHighlighter = false;
  const highlightMargin = 2;

  const activeDatum = activeValue.panel.datum;
  const tooltipInfo: TooltipInfo = {
    header: null,
    values: [],
  };

  if (showActive) {
    tooltipInfo.values.push({
      label: 'Active',
      value: activeValue.value,
      color: activeValue.color,
      isHighlighted: false,
      seriesIdentifier: {
        specId: 'bullet',
        key: 'active',
      },
      isVisible: true,
      formattedValue: activeDatum.valueFormatter(activeValue.snapValue),
    });
  }

  const isHighlighted = useHighlighter
    ? isBetween(activeValue.pixelValue - highlightMargin, activeValue.pixelValue + highlightMargin)
    : () => false;
  const scaledValue = activeValue.panel.scale(clamp(activeDatum.value, activeDatum.domain.min, activeDatum.domain.max));
  tooltipInfo.values.push({
    label: 'Value',
    value: activeDatum.value,
    color: `${activeValue.panel.colorScale(scaledValue)}`,
    isHighlighted: isHighlighted(activeValue.panel.scale(activeDatum.value)),
    seriesIdentifier: {
      specId: 'bullet',
      key: 'value',
    },
    isVisible: true,
    formattedValue: activeDatum.valueFormatter(activeDatum.value),
  });

  if (activeDatum.target) {
    const scaledTarget = activeValue.panel.scale(
      clamp(activeDatum.target, activeDatum.domain.min, activeDatum.domain.max),
    );
    tooltipInfo.values.push({
      label: 'Target',
      value: activeDatum.target,
      color: `${activeValue.panel.colorScale(scaledTarget)}`,
      isHighlighted: isHighlighted(activeValue.panel.scale(activeDatum.target)),
      seriesIdentifier: {
        // TODO make this better
        specId: 'bullet',
        key: 'target',
      },
      isVisible: true,
      formattedValue: activeDatum.valueFormatter(activeDatum.target),
    });
  }

  return tooltipInfo;
});
