import EventEmitter from 'eventemitter3';

export default {
  createEventEmitter: () => new EventEmitter(),
};
