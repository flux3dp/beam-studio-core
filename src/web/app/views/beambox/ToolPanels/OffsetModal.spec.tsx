/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const onCancel = jest.fn();
const onOk = jest.fn();

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

import OffsetModal from './OffsetModal';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('default unit is mm', () => {
    get.mockReturnValue(undefined);
    const wrapper = shallow(<OffsetModal onCancel={onCancel} onOk={onOk} />);
    expect(get).toBeCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('ForwardRef(Select)').at(0).props().onChange(0);
    expect(wrapper.find('ForwardRef(Select)').at(0).props().value).toBe(0);
    wrapper.find('ForwardRef(Select)').at(1).props().onChange('round');
    expect(wrapper.find('ForwardRef(Select)').at(1).props().value).toBe('round');
    wrapper.find('InputNumber').at(0).props().onChange(10);
    expect(wrapper.find('Slider').at(0).props().value).toBe(10);
    expect(wrapper.find('InputNumber').at(0).props().value).toBe(10);
    wrapper.find('Modal').props().onOk();
    expect(onOk).toBeCalledTimes(1);
    expect(onOk).toBeCalledWith({ dir: 0, distance: 10, cornerType: 'round' });
  });

  test('default unit is inches', () => {
    get.mockReturnValue('inches');
    const wrapper = shallow(<OffsetModal onCancel={onCancel} onOk={onOk} />);
    expect(get).toBeCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('Slider').at(0).props().onChange(1.5);
    expect(wrapper.find('Slider').at(0).props().value).toBe(1.5);
    expect(wrapper.find('InputNumber').at(0).props().value).toBe(1.5);
    wrapper.find('Modal').props().onOk();
    expect(onOk).toBeCalledTimes(1);
    expect(onOk).toBeCalledWith({ dir: 1, distance: 38.1, cornerType: 'sharp' });
  });
});
