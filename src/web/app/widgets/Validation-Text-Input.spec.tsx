import * as React from 'react';
import keyCodeConstants from 'app/constants/keycode-constants';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import ValidationTextInput from './Validation-Text-Input';

describe('test Validation-Text-Input', () => {
  test('should render correctly', () => {
    const wrapper = mount(<ValidationTextInput
      defaultValue="123"
      validation={jest.fn()}
      getValue={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.state().displayValue).toBe('123');
    expect(wrapper.state().value).toBe('123');
  });

  test('test onBlur', () => {
    const mockValidation = jest.fn();
    const mockGetValue = jest.fn();
    const wrapper = mount(<ValidationTextInput
      defaultValue="123"
      validation={mockValidation}
      getValue={mockGetValue}
    />);
    expect(wrapper.state().displayValue).toBe('123');
    expect(wrapper.state().value).toBe('123');

    mockValidation.mockReturnValue('789');
    wrapper.find('input').instance().value = '456';
    wrapper.find('input').simulate('blur');
    expect(mockValidation).toHaveBeenCalledTimes(1);
    expect(mockValidation).toHaveBeenNthCalledWith(1, '456');
    expect(wrapper.state().displayValue).toBe('789');
    expect(wrapper.state().value).toBe('789');
    expect(mockGetValue).toHaveBeenCalledTimes(1);
    expect(mockGetValue).toHaveBeenNthCalledWith(1, '789');

    mockValidation.mockReturnValue('');
    wrapper.find('input').instance().value = '456';
    wrapper.find('input').simulate('blur');
    expect(mockValidation).toHaveBeenCalledTimes(2);
    expect(mockValidation).toHaveBeenNthCalledWith(2, '456');
    expect(wrapper.state().displayValue).toBe('');
    expect(wrapper.state().value).toBe('');
    expect(mockGetValue).toHaveBeenCalledTimes(2);
    expect(mockGetValue).toHaveBeenNthCalledWith(2, '');

    mockValidation.mockReturnValue(null);
    wrapper.find('input').instance().value = '456';
    wrapper.find('input').simulate('blur');
    expect(mockValidation).toHaveBeenCalledTimes(3);
    expect(mockValidation).toHaveBeenNthCalledWith(3, '456');
    expect(wrapper.state().displayValue).toBe('');
    expect(wrapper.state().value).toBe('');
    expect(mockGetValue).toHaveBeenCalledTimes(2);
  });

  test('test onChange', () => {
    const mockValidation = jest.fn();
    const mockGetValue = jest.fn();
    const wrapper = mount(<ValidationTextInput
      defaultValue="123"
      validation={mockValidation}
      getValue={mockGetValue}
    />);
    expect(wrapper.state().displayValue).toBe('123');
    expect(wrapper.state().value).toBe('123');

    wrapper.find('input').instance().value = '456';
    wrapper.find('input').simulate('change');
    expect(wrapper.state().displayValue).toBe('456');
    expect(wrapper.state().value).toBe('123');
    expect(mockValidation).not.toHaveBeenCalled();
    expect(mockGetValue).not.toHaveBeenCalled();
  });

  test('test onKeyDown', () => {
    const mockValidation = jest.fn();
    const mockGetValue = jest.fn();
    const wrapper = mount(<ValidationTextInput
      defaultValue="123"
      validation={mockValidation}
      getValue={mockGetValue}
    />);
    expect(wrapper.state().displayValue).toBe('123');
    expect(wrapper.state().value).toBe('123');

    wrapper.find('input').instance().value = '456';

    mockValidation.mockReturnValue('789');
    wrapper.find('input').simulate('keydown', {
      keyCode: keyCodeConstants.KEY_RETURN,
    });
    expect(mockValidation).toHaveBeenCalledTimes(1);
    expect(mockValidation).toHaveBeenNthCalledWith(1, '456');
    expect(wrapper.state().displayValue).toBe('789');
    expect(wrapper.state().value).toBe('789');
    expect(mockGetValue).toHaveBeenCalledTimes(1);
    expect(mockGetValue).toHaveBeenNthCalledWith(1, '789');

    wrapper.find('input').simulate('keydown', {
      keyCode: keyCodeConstants.KEY_ESC,
    });
    expect(wrapper.state().displayValue).toBe('789');
    expect(wrapper.state().value).toBe('789');
  });
});
