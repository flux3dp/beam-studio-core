/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/contexts/MonitorContext', () => ({
  MonitorContext: React.createContext(null),
}));

import MonitorHeader, { NavBtnType } from './MonitorHeader';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('NavBtnType is BACK', () => {
    const onClose = jest.fn();
    const onNavigationBtnClick = jest.fn();
    MonitorHeader.contextType = React.createContext({
      onClose,
      onNavigationBtnClick,
    });
    const wrapper = mount(<MonitorHeader
      name="myDevice"
      navBtnType={NavBtnType.BACK}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.close').simulate('click');
    expect(onClose).toHaveBeenCalledTimes(1);

    wrapper.find('div.back').simulate('click');
    expect(onNavigationBtnClick).toHaveBeenCalledTimes(1);
  });

  test('NavBtnType is FOLDER', () => {
    const onNavigationBtnClick = jest.fn();
    MonitorHeader.contextType = React.createContext({
      onClose: jest.fn(),
      onNavigationBtnClick,
    });
    const wrapper = mount(<MonitorHeader
      name="myDevice"
      navBtnType={NavBtnType.FOLDER}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.back').simulate('click');
    expect(onNavigationBtnClick).toHaveBeenCalledTimes(1);
  });

  test('NavBtnType is something else', () => {
    MonitorHeader.contextType = React.createContext({
      onClose: jest.fn(),
      onNavigationBtnClick: jest.fn(),
    });
    const wrapper = mount(<MonitorHeader
      name="myDevice"
      navBtnType={NavBtnType.NONE}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
