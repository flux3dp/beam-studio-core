/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement,
  handleNextStep,
}));

const isPreviewMode = jest.fn();
const end = jest.fn();
jest.mock('app/actions/beambox/preview-mode-controller', () => ({
  isPreviewMode,
  end,
}));

jest.mock('app/constants/tutorial-constants', () => ({
  TO_EDIT_MODE: 'TO_EDIT_MODE',
}));

const useSelectTool = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  useSelectTool,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const setWorkAreaContextMenu = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Editor: {
      setWorkAreaContextMenu,
    },
  });
});

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { TopBarLeftPanelContextProvider } from './TopBarLeftPanelContext';

test('should render correctly', () => {
  const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
  const fluxIDEventEmitter = eventEmitterFactory.createEventEmitter('flux-id');
  const wrapper = shallow(
    <TopBarLeftPanelContextProvider>
      <></>
    </TopBarLeftPanelContextProvider>,
  );

  expect(wrapper.state()).toEqual({
    fileName: null,
    selectedElem: null,
    hasUnsavedChange: false,
    shouldStartPreviewController: false,
    currentUser: null,
    isPreviewing: false,
  });
  expect(wrapper.instance().startPreviewCallback).toBeNull();
  expect(fluxIDEventEmitter.eventNames().length).toBe(1);
  expect(topBarEventEmitter.eventNames().length).toBe(7);

  const currentUser = {
    email: 'test@flux3dp.com',
  };
  fluxIDEventEmitter.emit('update-user', currentUser);
  expect(wrapper.state().currentUser).toEqual(currentUser);

  topBarEventEmitter.emit('SET_ELEMENT', null);
  expect(wrapper.state().selectedElem).toBeNull();

  topBarEventEmitter.emit('SET_FILE_NAME', 'abc.txt');
  expect(wrapper.state().fileName).toBe('abc.txt');

  topBarEventEmitter.emit('SET_HAS_UNSAVED_CHANGE', true);
  expect(wrapper.state().hasUnsavedChange).toBeTruthy();

  wrapper.instance().setTopBarPreviewMode(true);
  const response = {
    isPreviewMode: false,
  };
  topBarEventEmitter.emit('GET_TOP_BAR_PREVIEW_MODE', response);
  expect(response.isPreviewMode).toBeTruthy();

  topBarEventEmitter.emit('SET_SHOULD_START_PREVIEW_CONTROLLER', true);
  expect(wrapper.state().shouldStartPreviewController).toBeTruthy();

  const callback = jest.fn();
  topBarEventEmitter.emit('SET_START_PREVIEW_CALLBACK', callback);
  expect(wrapper.instance().startPreviewCallback).toEqual(callback);

  isPreviewMode.mockReturnValue(true);
  getNextStepRequirement.mockReturnValue('TO_EDIT_MODE');
  wrapper.instance().endPreviewMode();
  expect(isPreviewMode).toHaveBeenCalledTimes(1);
  expect(end).toHaveBeenCalledTimes(1);
  expect(getNextStepRequirement).toHaveBeenCalledTimes(1);
  expect(handleNextStep).toHaveBeenCalledTimes(1);
  expect(useSelectTool).toHaveBeenCalledTimes(1);
  expect(setWorkAreaContextMenu).toHaveBeenCalledTimes(1);
  expect(wrapper.instance().isPreviewMode).toBeFalsy();
  expect(wrapper.state().isPreviewing).toBeFalsy();

  wrapper.instance().setIsPreviewing(true);

  topBarEventEmitter.emit('UPDATE_TOP_BAR');
  expect(wrapper.state()).toEqual({
    fileName: 'abc.txt',
    selectedElem: null,
    hasUnsavedChange: true,
    shouldStartPreviewController: true,
    currentUser,
    isPreviewing: true,
  });

  wrapper.unmount();
  expect(fluxIDEventEmitter.eventNames().length).toBe(0);
  expect(topBarEventEmitter.eventNames().length).toBe(0);
});
