import React from 'react';
import { shallow } from 'enzyme';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { TopBarHintsContextProvider } from './TopBarHintsContext';

test('should render correctly', () => {
  const topBarHintsEventEmitter = eventEmitterFactory.createEventEmitter('top-bar-hints');

  const wrapper = shallow(
    <TopBarHintsContextProvider>
      <></>
    </TopBarHintsContextProvider>,
  );
  expect(wrapper.state().hintType).toBeNull();
  expect(topBarHintsEventEmitter.eventNames().length).toBe(2);

  topBarHintsEventEmitter.emit('SET_HINT', 'POLYGON');
  expect(wrapper.state().hintType).toBe('POLYGON');

  topBarHintsEventEmitter.emit('REMOVE_HINT');
  expect(wrapper.state().hintType).toBeNull();

  wrapper.unmount();
  expect(topBarHintsEventEmitter.eventNames().length).toBe(0);
});
