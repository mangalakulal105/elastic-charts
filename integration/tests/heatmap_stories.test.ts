/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { eachTheme } from '../helpers';
import { common } from '../page_objects';

describe('Heatmap stories', () => {
  it('should not have brush tool extend into axes', async () => {
    await common.expectChartWithDragAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic',
      { left: 100, top: 100 },
      { left: 300, top: 300 },
    );
  });

  eachTheme.describe((_, themeParams) => {
    it('should render basic heatmap', async () => {
      await common.expectChartAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic&${themeParams}`,
      );
    });

    it('should render correct brush area', async () => {
      await common.expectChartWithDragAtUrlToMatchScreenshot(
        `http://localhost:9001/?path=/story/heatmap-alpha--basic&${themeParams}`,
        { left: 200, top: 100 },
        { left: 400, top: 250 },
      );
    });
  });

  it('should maximize the label with an unique fontSize', async () => {
    await page.setViewport({ width: 450, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot('http://localhost:9001/?path=/story/heatmap-alpha--categorical');
  });

  it('should maximize the label fontSize', async () => {
    await page.setViewport({ width: 420, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--categorical&knob-use global min fontSize_labels=false',
    );
  });

  it.each([[2], [3], [4], [5], [6], [7], [8], [9]])('time snap with dataset %i', async (dataset) => {
    await page.setViewport({ width: 785, height: 600 });
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/heatmap-alpha--time-snap&globals=theme:light&knob-dataset=${dataset}`,
    );
  });

  it('should allow rotation of labels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--overlapping-heatmap-labels&&knob-set%20rotation%20of%20x%20axis%20label_labels=45',
    );
  });

  it('should allow customizable length for x axis labels and allow alternating labels', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/test-cases--overlapping-heatmap-labels&&knob-set%20rotation%20of%20x%20axis%20label_labels=45&knob-show_labels=true&knob-set the max text length for the x axis labels_labels=5&knob-set overflow property for x axis labels_labels=true&knob-set x axis labels to alternate_labels=true',
    );
  });

  it('should show x and y axis titles', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/heatmap-alpha--basic&knob-Show%20x%20axis%20title=true&knob-Show%20y%20axis%20title=true',
    );
  });
});
