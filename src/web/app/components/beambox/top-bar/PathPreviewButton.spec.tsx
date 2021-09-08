/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const checkWebGL = jest.fn();
jest.mock('helpers/check-webgl', () => checkWebGL);

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const clearSelection = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      clearSelection,
    },
  });
});

import PathPreviewButton from './PathPreviewButton';

describe('should render correctly', () => {
  test('no WebGL', () => {
    checkWebGL.mockReturnValue(false);
    expect(toJson(shallow(<PathPreviewButton
      isPathPreviewing
      isDeviceConnected
      togglePathPreview={jest.fn()}

    />))).toMatchSnapshot();
  });

  describe('has WebGL', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('no devices connected in web version', () => {
      window.FLUX.version = 'web';
      checkWebGL.mockReturnValue(true);
      const wrapper = shallow(<PathPreviewButton
        isPathPreviewing
        isDeviceConnected={false}
        togglePathPreview={jest.fn()}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    test('no devices connected in desktop version', () => {
      checkWebGL.mockReturnValue(true);
      window.FLUX.version = '1.2.3';
      const wrapper = shallow(<PathPreviewButton
        isPathPreviewing
        isDeviceConnected={false}
        togglePathPreview={jest.fn()}
      />);
      wrapper.find('div.path-preview-button').simulate('click');
    });

    describe('has devices connected', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      test('is path previewing', () => {
        checkWebGL.mockReturnValue(true);
        const togglePathPreview = jest.fn();
        const wrapper = shallow(<PathPreviewButton
          isPathPreviewing
          isDeviceConnected
          togglePathPreview={togglePathPreview}
        />);

        wrapper.find('div.path-preview-button').simulate('click');
        expect(clearSelection).not.toHaveBeenCalled();
        expect(togglePathPreview).not.toHaveBeenCalled();
      });

      test('is not path previewing', () => {
        checkWebGL.mockReturnValue(true);
        const togglePathPreview = jest.fn();
        const wrapper = shallow(<PathPreviewButton
          isPathPreviewing={false}
          isDeviceConnected
          togglePathPreview={togglePathPreview}
        />);

        wrapper.find('div.path-preview-button').simulate('click');
        expect(clearSelection).toHaveBeenCalledTimes(1);
        expect(togglePathPreview).toHaveBeenCalledTimes(1);
      });
    });
  });
});
