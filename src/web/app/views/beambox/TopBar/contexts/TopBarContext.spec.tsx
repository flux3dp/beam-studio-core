import React from 'react';
import { shallow } from 'enzyme';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { TopBarContextProvider } from './TopBarContext';

test('should render correctly', () => {
  const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
  const fluxIDEventEmitter = eventEmitterFactory.createEventEmitter('flux-id');
  const wrapper = shallow(
    <TopBarContextProvider>
      <></>
    </TopBarContextProvider>,
  );

  expect(wrapper.state()).toEqual({
    fileName: null,
    selectedElem: null,
    hasUnsavedChange: false,
    shouldStartPreviewController: false,
    currentUser: null,
  });
  expect(wrapper.instance().startPreivewCallback).toBeNull();
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
  expect(wrapper.instance().startPreivewCallback).toEqual(callback);

  topBarEventEmitter.emit('UPDATE_TOP_BAR');
  expect(wrapper.state()).toEqual({
    fileName: 'abc.txt',
    selectedElem: null,
    hasUnsavedChange: true,
    shouldStartPreviewController: true,
    currentUser,
  });

  wrapper.unmount();
  expect(fluxIDEventEmitter.eventNames().length).toBe(0);
  expect(topBarEventEmitter.eventNames().length).toBe(0);
});
