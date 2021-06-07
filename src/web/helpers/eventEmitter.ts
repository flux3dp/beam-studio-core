import EventEmitter from 'eventemitter3';

export default (function () {
  let eventEmitter;
  return {
    getInstance() {
      if (!eventEmitter) {
        eventEmitter = new EventEmitter();
      }
      return eventEmitter;
    },
  };
}());
