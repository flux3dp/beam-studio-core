/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      time_est_button: {
        calculate: 'Estimate time',
      },
    },
    monitor: {
      hour: 'h',
      minute: 'm',
      second: 's',
    },
  },
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
});
