/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      ok: 'OK',
      cancel: 'Cancel',
    },
  },
}));

import ConfirmPrompt from './ConfirmPrompt';

describe('should render correctly', () => {
  test('no confirmValue', () => {
    const onConfirmed = jest.fn();
    const onClose = jest.fn();
    const onCancel = jest.fn();
    const wrapper = mount(<ConfirmPrompt
      caption="POWER TOO HIGH"
      message={'Using lower laser power (under 70%) will extends laser tube\'s lifetime.\nEnter "NOTED" to proceed.'}
      confirmValue=""
      onConfirmed={onConfirmed}
      onClose={onClose}
      onCancel={onCancel}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('button.btn-default').at(0).simulate('click');
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    wrapper.find('button.btn-default').at(1).simulate('click');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    const stopPropagation = jest.fn();
    wrapper.find('input').simulate('keydown', {
      keyCode: 13,
      stopPropagation,
    });
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    wrapper.find('input').simulate('keydown', {
      keyCode: 14,
      stopPropagation,
    });
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  test('has confirmValue', () => {
    const onConfirmed = jest.fn();
    const onClose = jest.fn();
    const onCancel = jest.fn();
    const wrapper = mount(<ConfirmPrompt
      caption="POWER TOO HIGH"
      message={'Using lower laser power (under 70%) will extends laser tube\'s lifetime.\nEnter "NOTED" to proceed.'}
      confirmValue="NOTED"
      onConfirmed={onConfirmed}
      onClose={onClose}
      onCancel={onCancel}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('input').instance().value = 'NOTED';
    wrapper.find('button.btn-default').at(0).simulate('click');
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    wrapper.find('input').instance().value = 'Hello';
    wrapper.find('button.btn-default').at(0).simulate('click');
    expect(wrapper.find('input').instance().value).toBe('');
    expect(onConfirmed).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
