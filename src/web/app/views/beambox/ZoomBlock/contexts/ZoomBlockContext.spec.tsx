import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';

import { eventEmitter, ZoomBlockContext, ZoomBlockContextProvider } from './ZoomBlockContext';

let counter = 0;
const Children = () => {
  useContext(ZoomBlockContext);
  useEffect(() => {
    counter += 1;
  });
  return (<></>);
};

test('should render correctly', () => {
  const wrapper = mount(
    <ZoomBlockContextProvider>
      <Children />
    </ZoomBlockContextProvider>,
  );
  expect(eventEmitter.eventNames().length).toBe(1);
  expect(counter).toBe(1);

  eventEmitter.emit('UPDATE_ZOOM_BLOCK');

  wrapper.unmount();
  expect(counter).toBe(2);
  expect(eventEmitter.eventNames().length).toBe(0);
});
