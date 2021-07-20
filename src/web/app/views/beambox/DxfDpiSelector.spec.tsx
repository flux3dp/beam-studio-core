/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import DxfDpiSelector from './DxfDpiSelector';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Cancel',
      ok: 'OK',
    },
    message: {
      please_enter_dpi: 'Please enter the Unit of your file',
    },
  },
}));

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('submit through input', () => {
    document.body.innerHTML = `
      <input id="dpi-input" value="25.4" >
    `;
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const wrapper = shallow(<DxfDpiSelector
      defaultDpiValue={100}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('input#dpi-input').simulate('keydown', {
      keyCode: 14,
    });
    expect(onSubmit).not.toHaveBeenCalled();

    wrapper.find('input#dpi-input').simulate('keydown', {
      keyCode: 13,
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenNthCalledWith(1, 25.4);

    wrapper.find('input#dpi-input').simulate('click');
    expect($('#dpi-input').val()).toBe('');
  });

  test('submit through buttons', () => {
    document.body.innerHTML = `
    <select id="dpi-input">
      <option>1</option>
      <option>2.54</option>
      <option selected="selected">25.4</option>
      <option>72</option>
      <option>96</option>
    </select>
  `;
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const wrapper = shallow(<DxfDpiSelector
      defaultDpiValue={100}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />);

    wrapper.find('ButtonGroup').props().buttons[1].onClick();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenNthCalledWith(1, 25.4);

    wrapper.find('ButtonGroup').props().buttons[0].onClick();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
