import React from 'react';
import { shallow } from 'enzyme';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { TimeEstimationButtonContextProvider } from './TimeEstimationButtonContext';

test('should render correctly', () => {
  const setStateSpy = jest.spyOn(TimeEstimationButtonContextProvider.prototype, 'setState');
  const timeEstimationButtonEventEmitter = eventEmitterFactory.createEventEmitter('time-estimation-button');
  const wrapper = shallow(
    <TimeEstimationButtonContextProvider>
      <></>
    </TimeEstimationButtonContextProvider>,
  );

  expect(wrapper.state()).toEqual({
    estimatedTime: null,
  });
  expect(timeEstimationButtonEventEmitter.eventNames().length).toBe(1);

  timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', 123);
  expect(wrapper.state()).toEqual({
    estimatedTime: 123,
  });
  expect(setStateSpy).toHaveBeenCalledTimes(1);

  timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', 123);
  expect(setStateSpy).toHaveBeenCalledTimes(1);

  wrapper.unmount();
  expect(timeEstimationButtonEventEmitter.eventNames().length).toBe(0);
});
