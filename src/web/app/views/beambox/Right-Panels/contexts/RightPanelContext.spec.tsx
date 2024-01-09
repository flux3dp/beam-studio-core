import React, { useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { RightPanelContext, RightPanelContextProvider } from './RightPanelContext';

const MockChild = () => {
  const { mode } = useContext(RightPanelContext);
  return <div>{mode}</div>;
};

test('should render correctly', () => {
  const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');
  const { container, unmount } = render(
    <RightPanelContextProvider>
      <MockChild />
    </RightPanelContextProvider>
  );

  expect(container).toHaveTextContent('element');
  expect(rightPanelEventEmitter.eventNames().length).toBe(1);

  act(() => rightPanelEventEmitter.emit('SET_MODE', 'path-edit'));
  expect(container).toHaveTextContent('path-edit');
  act(() => rightPanelEventEmitter.emit('SET_MODE', 'element'));
  expect(container).toHaveTextContent('element');
  const setState = jest.spyOn(RightPanelContextProvider.prototype, 'setState');
  act(() => rightPanelEventEmitter.emit('SET_MODE', 'element'));
  expect(setState).not.toHaveBeenCalled();

  unmount();
  expect(rightPanelEventEmitter.eventNames().length).toBe(0);
});
