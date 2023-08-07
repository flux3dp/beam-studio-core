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

import ArrayModal from './ArrayModal';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('default unit is mm', () => {
    get.mockReturnValue(undefined);
    const wrapper = shallow(<ArrayModal onCancel={onCancel} onOk={onOk} />);
    expect(get).toBeCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('Slider').at(0).props().onChange(6);
    expect(wrapper.find('Slider').at(0).props().value).toBe(6);
    expect(wrapper.find('InputNumber').at(0).props().value).toBe(6);
    wrapper.find('InputNumber').at(3).props().onChange(60);
    expect(wrapper.find('Slider').at(3).props().value).toBe(60);
    expect(wrapper.find('InputNumber').at(3).props().value).toBe(60);
    wrapper.find('Modal').props().onOk();
    expect(onOk).toBeCalledTimes(1);
    expect(onOk).toBeCalledWith({ column: 6, row: 3, dx: 20, dy: 60 });
  });

  test('default unit is inches', () => {
    get.mockReturnValue('inches');
    const wrapper = shallow(<ArrayModal onCancel={onCancel} onOk={onOk} />);
    expect(get).toBeCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('Slider').at(1).props().onChange(4);
    expect(wrapper.find('Slider').at(1).props().value).toBe(4);
    expect(wrapper.find('InputNumber').at(1).props().value).toBe(4);
    wrapper.find('InputNumber').at(2).props().onChange(3);
    expect(wrapper.find('Slider').at(2).props().value).toBe(3);
    expect(wrapper.find('InputNumber').at(2).props().value).toBe(3);
    wrapper.find('Modal').props().onOk();
    expect(onOk).toBeCalledTimes(1);
    expect(onOk).toBeCalledWith({ column: 3, row: 4, dx: 76.2, dy: 25.4 });
  });
});
