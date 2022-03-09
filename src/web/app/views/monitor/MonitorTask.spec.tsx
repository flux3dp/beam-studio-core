/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    monitor: {
      task: {
        BEAMBOX: 'Laser Engraving',
      },
    },
  },
}));

const formatDuration = jest.fn();
jest.mock('helpers/duration-formatter', () => formatDuration);

const isAbortedOrCompleted = jest.fn();
jest.mock('helpers/monitor-status', () => ({
  isAbortedOrCompleted,
}));

const meetRequirement = jest.fn();
jest.mock('helpers/version-checker', () => () => ({
  meetRequirement,
}));

jest.mock('app/contexts/MonitorContext', () => ({
  MonitorContext: React.createContext(null),
}));

import { Mode } from 'app/constants/monitor-constants';

import MonitorTask from './MonitorTask';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Mode.PREVIEW & MonitorStatus.isAbortedOrCompleted returns true & VersionChecker meets requirement', () => {
    const startRelocate = jest.fn();
    MonitorTask.contextType = React.createContext({
      report: {
        st_id: 1,
        prog: 123,
      },
      mode: Mode.PREVIEW,
      relocateOrigin: {
        x: 1,
        y: 1,
      },
      taskTime: 90,
      taskImageURL: 'img/flux.svg',
      startRelocate,
    });
    isAbortedOrCompleted.mockReturnValue(true);
    formatDuration.mockReturnValue('1m 30s');
    meetRequirement.mockReturnValue(true);
    const wrapper = mount(<MonitorTask
      deviceVersion="1.2.3"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(isAbortedOrCompleted).toHaveBeenCalledTimes(1);
    expect(formatDuration).toHaveBeenCalledTimes(1);
    expect(formatDuration).toHaveBeenNthCalledWith(1, 90);
    expect(meetRequirement).toHaveBeenCalledTimes(1);
    expect(meetRequirement).toHaveBeenNthCalledWith(1, 'RELOCATE_ORIGIN');
  });

  test('Mode.FILE_PREVIEW & MonitorStatus.isAbortedOrCompleted returns false & VersionChecker meets requirement', () => {
    const startRelocate = jest.fn();
    MonitorTask.contextType = React.createContext({
      report: {
        st_id: 1,
        prog: 123,
      },
      mode: Mode.FILE_PREVIEW,
      relocateOrigin: {
        x: 0,
        y: 0,
      },
      taskTime: 0,
      startRelocate,
    });
    isAbortedOrCompleted.mockReturnValue(false);
    meetRequirement.mockReturnValue(true);
    const wrapper = mount(<MonitorTask
      deviceVersion="1.2.3"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(isAbortedOrCompleted).toHaveBeenCalledTimes(1);
    expect(formatDuration).not.toHaveBeenCalled();
    expect(meetRequirement).toHaveBeenCalledTimes(1);
    expect(meetRequirement).toHaveBeenNthCalledWith(1, 'RELOCATE_ORIGIN');
  });

  test('Mode.WORKING & MonitorStatus.isAbortedOrCompleted returns true & VersionChecker meets requirement', () => {
    const startRelocate = jest.fn();
    MonitorTask.contextType = React.createContext({
      report: {
        st_id: 1,
        prog: 123,
      },
      mode: Mode.WORKING,
      relocateOrigin: {
        x: 0,
        y: 0,
      },
      taskTime: 0,
      startRelocate,
    });
    isAbortedOrCompleted.mockReturnValue(true);
    meetRequirement.mockReturnValue(true);
    const wrapper = mount(<MonitorTask
      deviceVersion="1.2.3"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(isAbortedOrCompleted).toHaveBeenCalledTimes(2);
    expect(formatDuration).not.toHaveBeenCalled();
    expect(meetRequirement).not.toHaveBeenCalled();
  });

  test('Mode.WORKING & MonitorStatus.isAbortedOrCompleted returns false & VersionChecker meets requirement', () => {
    const startRelocate = jest.fn();
    MonitorTask.contextType = React.createContext({
      report: {
        st_id: 1,
        prog: 0.123,
      },
      mode: Mode.WORKING,
      relocateOrigin: {
        x: 0,
        y: 0,
      },
      taskTime: 0,
      startRelocate,
    });
    isAbortedOrCompleted.mockReturnValue(false);
    meetRequirement.mockReturnValue(true);
    const wrapper = mount(<MonitorTask
      deviceVersion="1.2.3"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(isAbortedOrCompleted).toHaveBeenCalledTimes(2);
    expect(formatDuration).not.toHaveBeenCalled();
    expect(meetRequirement).not.toHaveBeenCalled();
  });

  test('Mode.WORKING & MonitorStatus.isAbortedOrCompleted returns false & VersionChecker meets requirement', () => {
    const startRelocate = jest.fn();
    MonitorTask.contextType = React.createContext({
      report: {
        st_id: 1,
      },
      mode: Mode.WORKING,
      relocateOrigin: {
        x: 0,
        y: 0,
      },
      taskTime: 0,
      startRelocate,
    });
    isAbortedOrCompleted.mockReturnValue(false);
    meetRequirement.mockReturnValue(true);
    const wrapper = mount(<MonitorTask
      deviceVersion="1.2.3"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(isAbortedOrCompleted).toHaveBeenCalledTimes(2);
    expect(formatDuration).not.toHaveBeenCalled();
    expect(meetRequirement).not.toHaveBeenCalled();
  });
});
