/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    monitor: {
      go: 'Start',
      pause: 'Pause',
      stop: 'Stop',
      camera: 'Camera',
      upload: 'Upload',
      download: 'Download',
      relocate: 'Relocate',
      cancel: 'Cancel',
    },
  },
}));

jest.mock('app/contexts/Monitor-Context', () => ({
  MonitorContext: React.createContext(null),
}));

import MonitorControl from './MonitorControl';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('mode is FILE', () => {
    const onUpload = jest.fn();
    const onDownload = jest.fn();
    const toggleCamera = jest.fn();
    MonitorControl.contextType = React.createContext({
      mode: 'FILE',
      isMaintainMoving: false,
      currentPath: [],
      highlightedItem: {},
      report: {
        st_id: 1,
      },
      onUpload,
      toggleCamera,
      onRelocate: jest.fn(),
      onPlay: jest.fn(),
      onPause: jest.fn(),
      onStop: jest.fn(),
      onDownload,
      endRelocate: jest.fn(),
    });
    const wrapper = mount(<MonitorControl />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.controls.left').simulate('click');
    expect(onUpload).toHaveBeenCalledTimes(1);
    wrapper.find('input.upload-control').simulate('change');
    expect(onUpload).toHaveBeenCalledTimes(2);

    wrapper.find('div.controls.center').simulate('click');
    expect(onDownload).toHaveBeenCalledTimes(1);

    wrapper.find('div.controls.right').simulate('click');
    expect(toggleCamera).toHaveBeenCalledTimes(1);
  });

  test('mode is PREVIEW', () => {
    MonitorControl.contextType = React.createContext({
      mode: 'PREVIEW',
      isMaintainMoving: false,
      currentPath: [],
      highlightedItem: {},
      report: {
        st_id: 0,
      },
      onUpload: jest.fn(),
      toggleCamera: jest.fn(),
      onRelocate: jest.fn(),
      onPlay: jest.fn(),
      onPause: jest.fn(),
      onStop: jest.fn(),
      onDownload: jest.fn(),
      endRelocate: jest.fn(),
    });
    const wrapper = mount(<MonitorControl />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('mode is FILE_PREVIEW', () => {
    MonitorControl.contextType = React.createContext({
      mode: 'FILE_PREVIEW',
      isMaintainMoving: false,
      currentPath: [],
      highlightedItem: {},
      report: {
        st_id: 1,
      },
      onUpload: jest.fn(),
      toggleCamera: jest.fn(),
      onRelocate: jest.fn(),
      onPlay: jest.fn(),
      onPause: jest.fn(),
      onStop: jest.fn(),
      onDownload: jest.fn(),
      endRelocate: jest.fn(),
    });
    const wrapper = mount(<MonitorControl />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('mode is WORKING', () => {
    test('ButtonTypes.DISABLED_STOP and ButtonTypes.DISABLED_PLAY', () => {
      MonitorControl.contextType = React.createContext({
        mode: 'WORKING',
        isMaintainMoving: false,
        currentPath: [],
        highlightedItem: {},
        report: {},
        onUpload: jest.fn(),
        toggleCamera: jest.fn(),
        onRelocate: jest.fn(),
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onStop: jest.fn(),
        onDownload: jest.fn(),
        endRelocate: jest.fn(),
      });
      const wrapper = mount(<MonitorControl />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    test('ButtonTypes.STOP and ButtonTypes.PAUSE', () => {
      MonitorControl.contextType = React.createContext({
        mode: 'WORKING',
        isMaintainMoving: false,
        currentPath: [],
        highlightedItem: {},
        report: {
          st_id: 16,
        },
        onUpload: jest.fn(),
        toggleCamera: jest.fn(),
        onRelocate: jest.fn(),
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onStop: jest.fn(),
        onDownload: jest.fn(),
        endRelocate: jest.fn(),
      });
      const wrapper = mount(<MonitorControl />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    test('ButtonTypes.STOP and ButtonTypes.PLAY', () => {
      MonitorControl.contextType = React.createContext({
        mode: 'WORKING',
        isMaintainMoving: false,
        currentPath: [],
        highlightedItem: {},
        report: {
          st_id: 32,
        },
        onUpload: jest.fn(),
        toggleCamera: jest.fn(),
        onRelocate: jest.fn(),
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onStop: jest.fn(),
        onDownload: jest.fn(),
        endRelocate: jest.fn(),
      });
      const wrapper = mount(<MonitorControl />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    test('ButtonTypes.DISABLED_STOP and ButtonTypes.DISABLED_PAUSE', () => {
      MonitorControl.contextType = React.createContext({
        mode: 'WORKING',
        isMaintainMoving: false,
        currentPath: [],
        highlightedItem: {},
        report: {
          st_id: 130,
        },
        onUpload: jest.fn(),
        toggleCamera: jest.fn(),
        onRelocate: jest.fn(),
        onPlay: jest.fn(),
        onPause: jest.fn(),
        onStop: jest.fn(),
        onDownload: jest.fn(),
        endRelocate: jest.fn(),
      });
      const wrapper = mount(<MonitorControl />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  test('mode is CAMERA', () => {
    MonitorControl.contextType = React.createContext({
      mode: 'CAMERA',
      isMaintainMoving: false,
      currentPath: [],
      highlightedItem: {},
      report: {},
      onUpload: jest.fn(),
      toggleCamera: jest.fn(),
      onRelocate: jest.fn(),
      onPlay: jest.fn(),
      onPause: jest.fn(),
      onStop: jest.fn(),
      onDownload: jest.fn(),
      endRelocate: jest.fn(),
    });
    const wrapper = mount(<MonitorControl />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('mode is CAMERA_RELOCATE', () => {
    const onRelocate = jest.fn();
    MonitorControl.contextType = React.createContext({
      mode: 'CAMERA_RELOCATE',
      isMaintainMoving: false,
      currentPath: [],
      highlightedItem: {},
      report: {},
      onUpload: jest.fn(),
      toggleCamera: jest.fn(),
      onRelocate,
      onPlay: jest.fn(),
      onPause: jest.fn(),
      onStop: jest.fn(),
      onDownload: jest.fn(),
      endRelocate: jest.fn(),
    });
    const wrapper = mount(<MonitorControl />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.controls.right').simulate('click');
    expect(onRelocate).toHaveBeenCalledTimes(1);
  });
});
