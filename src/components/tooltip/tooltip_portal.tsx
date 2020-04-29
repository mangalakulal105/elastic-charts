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
 * under the License. */

import React, { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { createPopper, Instance } from '@popperjs/core/lib/popper-lite.js';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import popperOffset from '@popperjs/core/lib/modifiers/offset.js';
import popperFlip from '@popperjs/core/lib/modifiers/flip.js';

import { TooltipAnchorPosition } from './types';
import { TooltipInfo } from './types';
import { TooltipValueFormatter, TooltipSettings, TooltipType } from '../../specs';
import { GlobalChartState, BackwardRef } from '../../state/chart_state';
import { isInitialized } from '../../state/selectors/is_initialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getTooltipHeaderFormatterSelector } from '../../state/selectors/get_tooltip_header_formatter';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { Tooltip } from './tooltip';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { Position } from '../../utils/commons';
import { getTooltipTypeSelector } from '../../chart_types/xy_chart/state/selectors/get_tooltip_type';

interface PopperSettigns {
  fallbackPlacements: Position[];
  placement: Position;
  boundary?: HTMLElement;
}

interface TooltipPortalStateProps {
  isVisible: boolean;
  position: TooltipAnchorPosition | null;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
  settings: TooltipSettings;
  type: TooltipType;
}
interface TooltipPortalOwnProps {
  getChartContainerRef: BackwardRef;
  /**
   * String used to designate unique portal
   */
  scope: string;
}

type TooltipPortalProps = TooltipPortalStateProps & TooltipPortalOwnProps;

function getOrCreateNode(id: string, parent: HTMLElement = document.body): HTMLDivElement {
  const node = document.getElementById(id);
  if (node) {
    return node as HTMLDivElement;
  }

  const newNode = document.createElement('div');
  newNode.id = id;
  parent.appendChild(newNode);
  return newNode;
}

const TooltipPortalComponent = ({
  getChartContainerRef,
  position,
  isVisible,
  info,
  scope,
  settings,
  headerFormatter,
}: TooltipPortalProps) => {
  const chartRef = getChartContainerRef();

  if (chartRef.current === null || position === null || !isVisible || !info) {
    return null;
  }

  /**
   * Portal node. This must not be removed from DOM throughout life of this component.
   * Otherwise the portal will loose reference to the correct node.
   */
  const portalNode = useRef(getOrCreateNode(`echPortal${scope}`));
  /**
   * Invisible Anchor element used to position tooltip
   */
  const anchorNode = useRef(getOrCreateNode('echTooltipAnchor', chartRef.current));
  /**
   * Popper instance used to manage position of tooltip.
   */
  const popper = useRef<Instance | null>(null);

  useEffect(
    () => () => {
      if (portalNode.current.parentNode) {
        portalNode.current.parentNode.removeChild(portalNode.current);
      }

      if (popper.current) {
        popper.current.destroy();
      }
    },
    [],
  );

  const getPopperSettings = useCallback((): PopperSettigns => {
    console.log('getPopperSettings');
    const fallbackPlacements = [Position.Right, Position.Left, Position.Top, Position.Bottom];
    const placement = Position.Right;
    if (typeof settings === 'string') {
      return {
        fallbackPlacements,
        placement,
      };
    }

    return {
      fallbackPlacements: settings?.placementFallbacks ?? fallbackPlacements,
      placement: settings?.placement ?? placement,
      boundary: settings?.boundary === 'chart' ? chartRef.current! : settings?.boundary,
    };
  }, [settings, chartRef.current]);

  const getPopper = useCallback(
    (anchorNode: HTMLElement, portalNode: HTMLElement): Instance => {
      console.log('created popper');

      const { fallbackPlacements, placement, boundary } = getPopperSettings();
      return createPopper(anchorNode, portalNode, {
        strategy: 'fixed',
        placement,
        modifiers: [
          {
            ...popperOffset,
            options: {
              offset: [0, 10],
            },
          },
          {
            ...preventOverflow,
            options: {
              boundary,
            },
          },
          {
            ...popperFlip,
            options: {
              // Note: duplicate values causes lag
              fallbackPlacements: fallbackPlacements.filter((p) => p !== placement),
              boundary,
              // checks main axis overflow before trying to flip
              altAxis: false,
            },
          },
        ],
      });
    },
    [getPopperSettings],
  );

  useEffect(() => {
    console.log('update popper');
    updateAnchorDimensions();

    if (!popper.current) {
      popper.current = getPopper(anchorNode.current, portalNode.current);
    }

    popper.current!.update();
  }, [popper.current, getPopperSettings, position.x0, position.x1, position.y0, position.y1]);

  const updateAnchorDimensions = useCallback(() => {
    console.log('updateAnchorDimensions');
    const { x0, x1, y0, y1 } = position!;
    const width = x0 !== undefined ? x1 - x0 : 0;
    const height = y0 !== undefined ? y1 - y0 : 0;
    anchorNode.current.style.left = `${x1 - width}px`;
    anchorNode.current.style.width = `${width}px`;
    anchorNode.current.style.top = `${y1 - height}px`;
    anchorNode.current.style.height = `${height}px`;
  }, [anchorNode.current, ...Object.values(position)]);

  return createPortal(<Tooltip info={info} headerFormatter={headerFormatter} />, portalNode.current);
};

TooltipPortalComponent.displayName = 'Tooltip';

const HIDDEN_TOOLTIP_PROPS = {
  isVisible: false,
  info: undefined,
  position: null,
  headerFormatter: undefined,
  settings: {},
  type: TooltipType.VerticalCursor,
};

const mapStateToProps = (state: GlobalChartState): TooltipPortalStateProps => {
  if (!isInitialized(state)) {
    return HIDDEN_TOOLTIP_PROPS;
  }
  return {
    isVisible: getInternalIsTooltipVisibleSelector(state),
    info: getInternalTooltipInfoSelector(state),
    position: getInternalTooltipAnchorPositionSelector(state),
    headerFormatter: getTooltipHeaderFormatterSelector(state),
    settings: getSettingsSpecSelector(state).tooltip,
    type: getTooltipTypeSelector(state),
  };
};

/** @internal */
export const TooltipPortal = connect(mapStateToProps)(TooltipPortalComponent);
