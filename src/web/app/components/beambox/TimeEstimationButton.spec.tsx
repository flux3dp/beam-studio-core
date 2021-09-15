/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      oops: 'Oops...',
    },
    beambox: {
      time_est_button: {
        calculate: 'Estimate time',
      },
    },
    device_selection: {
      no_beambox: '#801',
    },
    monitor: {
      hour: 'h',
      minute: 'm',
      second: 's',
    },
    topbar: {
      menu: {
        add_new_machine: 'Machine Setup',
      },
    },
  },
}));

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: mockPopUp,
}));

const mockCheckConnection = jest.fn();
jest.mock('helpers/api/discover', () => ({
  checkConnection: mockCheckConnection,
}));

const mockEstimateTime = jest.fn();
jest.mock('app/actions/beambox/export-funcs', () => ({
  estimateTime: mockEstimateTime,
}));

import { TimeEstimationButtonContext } from 'app/contexts/TimeEstimationButtonContext';

import TimeEstimationButton from './TimeEstimationButton';

describe('should render correctly', () => {
  test('has estimatedTime', () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    const wrapper = mount(
      <TimeEstimationButtonContext.Provider value={{
        setEstimatedTime: () => { },
        estimatedTime: 60,
      }}
      >
        <TimeEstimationButton />
      </TimeEstimationButtonContext.Provider>,
    );

    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('NO estimatedTime', async () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    const mockSetEstimatedTime = jest.fn();
    const wrapper = mount(
      <TimeEstimationButtonContext.Provider value={{
        setEstimatedTime: mockSetEstimatedTime,
        estimatedTime: null,
      }}
      >
        <TimeEstimationButton />
      </TimeEstimationButtonContext.Provider>,
    );

    expect(toJson(wrapper)).toMatchSnapshot();

    mockEstimateTime.mockResolvedValue(90);
    wrapper.find('div.time-est-btn').simulate('click');
    await mockEstimateTime();
    expect(mockSetEstimatedTime).toHaveBeenCalledTimes(1);
    expect(mockSetEstimatedTime).toHaveBeenNthCalledWith(1, 90);
  });

  test('web check connection', async () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    Object.defineProperty(window, 'FLUX', {
      value: {
        version: 'web',
      },
    });
    const mockSetEstimatedTime = jest.fn();
    const wrapper = mount(
      <TimeEstimationButtonContext.Provider value={{
        setEstimatedTime: mockSetEstimatedTime,
        estimatedTime: null,
      }}
      >
        <TimeEstimationButton />
      </TimeEstimationButtonContext.Provider>,
    );

    expect(toJson(wrapper)).toMatchSnapshot();

    mockCheckConnection.mockReturnValueOnce(false);
    wrapper.find('div.time-est-btn').simulate('click');
    expect(mockCheckConnection).toHaveBeenCalledTimes(1);
    expect(mockPopUp).toHaveBeenCalledTimes(1);

    mockEstimateTime.mockResolvedValue(90);
    mockCheckConnection.mockReturnValueOnce(true);
    wrapper.find('div.time-est-btn').simulate('click');
    await mockEstimateTime();
    expect(mockSetEstimatedTime).toHaveBeenCalledTimes(1);
    expect(mockSetEstimatedTime).toHaveBeenNthCalledWith(1, 90);
  });
});
