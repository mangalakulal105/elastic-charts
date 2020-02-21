import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Chart } from '../chart';
import { Settings, BarSeries } from '../../specs';
import { ScaleType } from '../../scales';
import { Legend } from './legend';
import { LegendListItem, RenderColorPicker } from './legend_item';
import { SeededDataGenerator } from '../../mocks/utils';

const dg = new SeededDataGenerator();

describe('Legend', () => {
  it('shall render the all the series names', () => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend showLegendExtra />
        <BarSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[
            [0, 123, 'group0'],
            [0, 123, 'group1'],
            [0, 123, 'group2'],
            [0, 123, 'group3'],
          ]}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the legend item shows also the value as default parameter
      expect(legendItem.text()).toBe(`group${i}123`);
    });
  });
  it('shall render the all the series names without the data value', () => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend showLegendExtra={false} />
        <BarSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[
            [0, 123, 'group0'],
            [0, 123, 'group1'],
            [0, 123, 'group2'],
            [0, 123, 'group3'],
          ]}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the legend item shows also the value as default parameter
      expect(legendItem.text()).toBe(`group${i}`);
    });
  });
  it('shall call the over and out listeners for every list item', () => {
    const onLegendItemOver = jest.fn();
    const onLegendItemOut = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    const wrapper = mount(
      <Chart>
        <Settings showLegend showLegendExtra onLegendItemOver={onLegendItemOver} onLegendItemOut={onLegendItemOut} />
        <BarSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={'x'}
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={data}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    legendItems.forEach((legendItem, i) => {
      legendItem.simulate('mouseenter');
      expect(onLegendItemOver).toBeCalledTimes(i + 1);
      legendItem.simulate('mouseleave');
      expect(onLegendItemOut).toBeCalledTimes(i + 1);
    });
  });
  it('shall call click listener for every list item', () => {
    const onLegendItemClick = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    const wrapper = mount(
      <Chart>
        <Settings showLegend showLegendExtra onLegendItemClick={onLegendItemClick} />
        <BarSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={'x'}
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={data}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the click is only enabled on the title
      legendItem.find('.echLegendItem__label').simulate('click');
      expect(onLegendItemClick).toBeCalledTimes(i + 1);
    });
  });

  describe('#renderColorPicker', () => {
    let wrapper: ReactWrapper;
    const customColor = '#0c7b93';
    const onLegendItemClick = jest.fn();
    const data = dg.generateGroupedSeries(10, 4, 'split');
    const renderColorPicker: RenderColorPicker = (onChange, onClose, isOpen, button) =>
      isOpen ? (
        <div id="colorPicker">
          <span>Custom Color Picker</span>
          <button id="change" onClick={() => onChange(customColor)}>
            {customColor}
          </button>
          <button id="close" onClick={onClose}>
            close
          </button>
          {button}
        </div>
      ) : (
        { button }
      );

    beforeEach(() => {
      wrapper = mount(
        <Chart>
          <Settings showLegend onLegendItemClick={onLegendItemClick} renderColorPicker={renderColorPicker} />
          <BarSeries
            id="areas"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={'x'}
            yAccessors={['y']}
            splitSeriesAccessors={['g']}
            data={data}
          />
        </Chart>,
      );
    });

    const clickFirstColor = () => {
      const legendWrapper = wrapper.find(Legend);
      expect(legendWrapper.exists).toBeTruthy();
      const legendItems = legendWrapper.find(LegendListItem);
      expect(legendItems.exists).toBeTruthy();
      expect(legendItems).toHaveLength(4);
      legendItems
        .first()
        .find('.echLegendItem__color')
        .simulate('click');
    };

    it('should render colorPicker when color is clicked', () => {
      clickFirstColor();
      expect(wrapper.find('#colorPicker').html()).toMatchSnapshot();
      expect(wrapper.find(Legend).html()).toMatchSnapshot();
    });

    it('should match snapshot after onChange is called', () => {
      clickFirstColor();
      wrapper
        .find('#change')
        .simulate('click')
        .first();

      expect(wrapper.find(Legend).html()).toMatchSnapshot();
    });

    it('should set isOpen to false after onChange is called', () => {
      clickFirstColor();
      wrapper
        .find('#change')
        .simulate('click')
        .first();
      expect(wrapper.find('#colorPicker').exists()).toBe(false);
    });

    it('should set color after onChange is called', () => {
      clickFirstColor();
      wrapper
        .find('#change')
        .simulate('click')
        .first();
      const dot = wrapper.find('.echLegendItem__color svg');
      expect(dot.exists(`[color="${customColor}"]`)).toBe(true);
    });

    it('should match snapshot after onClose is called', () => {
      clickFirstColor();
      wrapper
        .find('#close')
        .simulate('click')
        .first();
      expect(wrapper.find(Legend).html()).toMatchSnapshot();
    });

    it('should set isOpen to false after onClose is called', () => {
      clickFirstColor();
      wrapper
        .find('#close')
        .simulate('click')
        .first();
      expect(wrapper.find('#colorPicker').exists()).toBe(false);
    });

    it('should call click listener for every list item', () => {
      const legendWrapper = wrapper.find(Legend);
      expect(legendWrapper.exists).toBeTruthy();
      const legendItems = legendWrapper.find(LegendListItem);
      expect(legendItems.exists).toBeTruthy();
      expect(legendItems).toHaveLength(4);
      legendItems.forEach((legendItem, i) => {
        // toggle click is only enabled on the title
        legendItem.find('.echLegendItem__title').simulate('click');
        expect(onLegendItemClick).toBeCalledTimes(i + 1);
      });
    });
  });
});
