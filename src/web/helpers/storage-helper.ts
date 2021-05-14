import storage from 'implementations/storage';

export default {
  get: storage.get,
  set: storage.set,
  removeAt: storage.removeAt,
  clearAll: storage.clearAll,
  clearAllExceptIP: storage.clearAllExceptIP,
  isExisting: storage.isExisting,
};
