jest.mock('helpers/i18n', () => ({
  lang: {
    machine_status: {
      '-10': 'Maintain mode',
      '-2': 'Scanning',
      '-1': 'Maintaining',
      0: 'Idle',
      1: 'Initiating',
      2: 'ST_TRANSFORM',
      4: 'Starting',
      6: 'Resuming',
      16: 'Working',
      18: 'Resuming',
      32: 'Paused',
      36: 'Paused',
      38: 'Pausing',
      48: 'Paused',
      50: 'Pausing',
      64: 'Completed',
      66: 'Completing',
      68: 'Preparing',
      128: 'Aborted',
      UNKNOWN: 'Unknown',
    },
    select_device: {
      select_device: 'Select Device',
    },
    alert: {
      cancel: 'Cancel',
    },
  },
  getActiveLang: () => 'en',
}));

const mockDiscover = jest.fn();
jest.mock('helpers/api/discover', () => mockDiscover);

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import DeviceSelector from './DeviceSelector';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('no devices', () => {
    const mockRemoveListener = jest.fn();
    mockDiscover.mockReturnValue({
      removeListener: mockRemoveListener,
    });

    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();
    const wrapper = mount(<DeviceSelector
      onSelect={mockOnSelect}
      onClose={mockOnClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(mockDiscover).toHaveBeenCalledTimes(1);

    wrapper.find('button.btn-default').simulate('click');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenNthCalledWith(1, null);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    expect(mockRemoveListener).toHaveBeenNthCalledWith(1, 'device-selector');
  });
});
