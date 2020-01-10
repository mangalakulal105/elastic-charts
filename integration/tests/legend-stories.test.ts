import { common } from '../page_objects';

describe('Legend stories', () => {
  it('should render non-split series', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--changingspecs&knob-split series=',
    );
  });
  it('should hide line series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hidelegenditemsbyseries&knob-hide bar series in legend=&knob-hide line series in legend=true',
    );
  });
  it('should hide bar series legend item', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--hidelegenditemsbyseries&knob-hide bar series in legend=true&knob-hide line series in legend=',
    );
  });
  it('should 0 legend buffer', async () => {
    await common.expectChartAtUrlToMatchScreenshot(
      'http://localhost:9001/?path=/story/legend--legendspacing-buffer&knob-legend buffer value=0',
    );
  });
});
