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
  });
  expect(rightPanelEventEmitter.eventNames().length).toBe(1);

  rightPanelEventEmitter.emit('SET_MODE', 'path-edit');
  expect(wrapper.state()).toEqual({
    mode: 'path-edit',
  });
  rightPanelEventEmitter.emit('SET_MODE', 'element');
  expect(wrapper.state()).toEqual({
    mode: 'element',
  });
  const setState = jest.spyOn(wrapper.instance(), 'setState');
  rightPanelEventEmitter.emit('SET_MODE', 'element');
  expect(setState).not.toHaveBeenCalled();

  wrapper.unmount();
  expect(rightPanelEventEmitter.eventNames().length).toBe(0);
});
