import eventEmitterFactory from 'helpers/eventEmitterFactory';

const timeEstimationButtonEventEmitter = eventEmitterFactory.createEventEmitter('time-estimation-button');

export const clearEstimatedTime = (): void => {
  timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
};

export default {
  clearEstimatedTime,
};
