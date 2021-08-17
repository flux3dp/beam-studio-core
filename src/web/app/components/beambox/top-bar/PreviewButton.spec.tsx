/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement,
  handleNextStep,
}));

const read = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      preview: 'PREVIEW',
      borderless: '(OPEN BOTTOM)',
    },
  },
}));

jest.mock('app/constants/tutorial-constants', () => ({
  TO_PREVIEW_MODE: 'TO_PREVIEW_MODE',
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const setMode = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      setMode,
    },
  });
});

import PreviewButton from './PreviewButton';

describe('should render correctly', () => {
  test('is path previewing', () => {
    expect(toJson(shallow(<PreviewButton
      isPreviewing={false}
      isPathPreviewing
      showCameraPreviewDeviceList={jest.fn()}
      endPreviewMode={jest.fn()}
      setTopBarPreviewMode={jest.fn()}
      enterPreviewMode={jest.fn()}
    />))).toMatchSnapshot();
  });

  describe('is not path previewing', () => {
    describe('is previewing', () => {
      test('borderless and OpenBottom supported', () => {
        read.mockReturnValueOnce(true).mockReturnValueOnce('fbm1');
        const showCameraPreviewDeviceList = jest.fn();
        const wrapper = shallow(<PreviewButton
          isPreviewing
          isPathPreviewing={false}
          showCameraPreviewDeviceList={showCameraPreviewDeviceList}
          endPreviewMode={jest.fn()}
          setTopBarPreviewMode={jest.fn()}
          enterPreviewMode={jest.fn()}
        />);
        expect(toJson(wrapper)).toMatchSnapshot();

        wrapper.find('div.img-container').simulate('click');
        expect(showCameraPreviewDeviceList).toHaveBeenCalledTimes(1);

        wrapper.find('div.title').simulate('click');
        expect(showCameraPreviewDeviceList).toHaveBeenCalledTimes(2);
      });

      test('non-borderless', () => {
        read.mockReturnValueOnce(false).mockReturnValueOnce('fbm1');
        const wrapper = shallow(<PreviewButton
          isPreviewing
          isPathPreviewing={false}
          showCameraPreviewDeviceList={jest.fn()}
          endPreviewMode={jest.fn()}
          setTopBarPreviewMode={jest.fn()}
          enterPreviewMode={jest.fn()}
        />);
        expect(toJson(wrapper)).toMatchSnapshot();
      });
    });

    test('is not previewing', () => {
      document.body.innerHTML = '<div id="workarea"></div>';
      const wrapper = shallow(<PreviewButton
        isPreviewing={false}
        isPathPreviewing={false}
        showCameraPreviewDeviceList={jest.fn()}
        endPreviewMode={jest.fn()}
        setTopBarPreviewMode={jest.fn()}
        enterPreviewMode={jest.fn()}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });
});
