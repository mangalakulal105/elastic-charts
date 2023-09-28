/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleBand, ScaleContinuous } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { ContinuousDomain, Range } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { XDomain, YDomain } from '../domains/types';

interface XScaleOptions {
  xDomain: XDomain;
  totalBarsInCluster: number;
  range: Range;
  barsPadding?: number;
  enableHistogramMode?: boolean;
  integersOnly?: boolean;
  logBase?: number;
  logMinLimit?: number;
}

/**
 * Compute the x scale used to align geometries to the x axis.
 * @internal
 */
export function computeXScale(options: XScaleOptions): ScaleBand | ScaleContinuous {
  const { xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, integersOnly } = options;
  const { type, nice, minInterval, domain, isBandScale, timeZone, logBase, desiredTickCount } = xDomain;
  const rangeDiff = Math.abs(range[1] - range[0]);
  if (type === ScaleType.Ordinal) {
    const dividend = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
    const bandwidth = rangeDiff / (domain.length * dividend);
    return new ScaleBand(domain, range, bandwidth, barsPadding);
  }
  if (isBandScale) {
    const [domainMin, domainMax] = domain as ContinuousDomain;
    // This will be fixed when the histogram mode will require a binWidth value
    const isSingleValueHistogram = enableHistogramMode === true && domainMax - domainMin === 0;
    const adjustedDomain: [number, number] = [domainMin, isSingleValueHistogram ? domainMin + minInterval : domainMax];
    const intervalCount = (adjustedDomain[1] - adjustedDomain[0]) / minInterval;

    // const intervalCountOffset = isSingleValueHistogram ? 0 : 1;
    // const bandwidth = rangeDiff / (intervalCount + intervalCountOffset);
    const bandwidth = +(rangeDiff / intervalCount).toFixed(2);
    return new ScaleContinuous(
      {
        type,
        domain: adjustedDomain,
        range,
        nice,
      },
      {
        bandwidth: totalBarsInCluster > 0 ? bandwidth / totalBarsInCluster : bandwidth,
        minInterval,
        timeZone,
        totalBarsInCluster,
        barsPadding,
        desiredTickCount,
        isSingleValueHistogram,
        logBase,
      },
    );
  } else {
    return new ScaleContinuous(
      { type, domain: domain as [number, number], range, nice },
      {
        bandwidth: 0,
        minInterval,
        timeZone,
        totalBarsInCluster,
        barsPadding,
        desiredTickCount,
        integersOnly,
        logBase,
      },
    );
  }
}

interface YScaleOptions {
  yDomains: YDomain[];
  range: Range;
  integersOnly?: boolean;
}

/**
 * Compute the y scales, one per groupId for the y axis.
 * @internal
 */
export function computeYScales(options: YScaleOptions): Map<GroupId, ScaleContinuous> {
  const { yDomains, range, integersOnly } = options;
  return yDomains.reduce(
    (
      yScales,
      {
        type,
        nice,
        desiredTickCount,
        domain,
        groupId,
        logBase,
        logMinLimit,
        domainPixelPadding,
        constrainDomainPadding,
      },
    ) => {
      const yScale = new ScaleContinuous(
        { type, domain, range, nice },
        {
          desiredTickCount,
          integersOnly,
          logBase,
          logMinLimit,
          domainPixelPadding,
          constrainDomainPadding,
        },
      );
      yScales.set(groupId, yScale);
      return yScales;
    },
    new Map<GroupId, ScaleContinuous>(),
  );
}
