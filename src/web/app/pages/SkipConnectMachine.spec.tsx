import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: mockGet,
  set: mockSet,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    initialize: {
      setting_completed: {
        great: 'Welcome to Beam Studio',
        setup_later: 'You can always set up your machine from Titlebar > "Machines" > "Machine Setup"',
        ok: 'START CREATING',
      },
    },
  },
}));

const mockWindowLocationReload = jest.fn();
jest.mock('app/actions/windowLocation', () => mockWindowLocationReload);

// eslint-disable-next-line import/first
import SkipConnectMachine from './SkipConnectMachine';

describe('test Skip-Connect-Machine', () => {
  test('should render correctly', () => {
    const wrapper = mount(<SkipConnectMachine />);
    expect(toJson(wrapper)).toMatchSnapshot();

    mockGet.mockReturnValue(true);
    wrapper.find('.btn-action').simulate('click');
    expect(mockSet).toHaveBeenNthCalledWith(1, 'printer-is-ready', true);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
    expect(window.location.hash).toBe('#studio/beambox');
    expect(mockWindowLocationReload).toHaveBeenCalledTimes(1);

    mockGet.mockReturnValue(false);
    wrapper.find('.btn-action').simulate('click');
    expect(mockSet).toHaveBeenNthCalledWith(2, 'new-user', true);
    expect(mockSet).toHaveBeenNthCalledWith(3, 'printer-is-ready', true);
    expect(mockGet).toHaveBeenNthCalledWith(2, 'printer-is-ready');
    expect(window.location.hash).toBe('#studio/beambox');
    expect(mockWindowLocationReload).toHaveBeenCalledTimes(2);
  });
});
