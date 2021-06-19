import React from 'react';
import { shallow } from 'enzyme';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { RightPanelContextProvider } from './RightPanelContext';

test('should render correctly', () => {
  const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');
  const wrapper = shallow(
    <RightPanelContextProvider>
      <></>
    </RightPanelContextProvider>,
  );

  expect(wrapper.state()).toEqual({
    mode: 'element',
    selectedElement: null,
  });
  expect(rightPanelEventEmitter.eventNames().length).toBe(2);

  rightPanelEventEmitter.emit('SET_MODE', 'path-edit');
  expect(wrapper.state()).toEqual({
    mode: 'path-edit',
    selectedElement: null,
  });
  rightPanelEventEmitter.emit('SET_MODE', 'element');
  expect(wrapper.state()).toEqual({
    mode: 'element',
    selectedElement: null,
  });
  const setState = jest.spyOn(wrapper.instance(), 'setState');
  rightPanelEventEmitter.emit('SET_MODE', 'element');
  expect(setState).not.toHaveBeenCalled();

  const blur = jest.spyOn(globalThis.document.activeElement as HTMLInputElement, 'blur');
  rightPanelEventEmitter.emit('SET_SELECTED_ELEMENT', null);
  expect(blur).not.toHaveBeenCalled();
  expect(wrapper.state()).toEqual({
    mode: 'element',
    selectedElement: null,
  });

  document.body.innerHTML = '<div id="test" />';
  const element = document.getElementById('test');
  rightPanelEventEmitter.emit('SET_SELECTED_ELEMENT', element);
  expect(blur).toHaveBeenCalledTimes(1);
  expect(wrapper.state()).toEqual({
    mode: 'element',
    selectedElement: element,
  });

  wrapper.unmount();
  expect(rightPanelEventEmitter.eventNames().length).toBe(0);
});
