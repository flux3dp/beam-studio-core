import EventEmitter from 'eventemitter3';

const eventEmitters = {
  'flux-id': null,
  'top-bar': null,
  'top-bar-hints': null,
  'time-estimation-button': null,
  'top-bar-menu': null,
  'layer-panel': null,
  'right-panel': null,
  'object-panel': null,
  'alert-progress': null,
  'document-panel': null,
};
export default {
  createEventEmitter: (type?: string): EventEmitter => {
    if (!type) return new EventEmitter();
    if (!eventEmitters[type]) eventEmitters[type] = new EventEmitter();
    return eventEmitters[type];
  },
};
