import storage from 'implementations/storage';
import { PromarkStore } from 'interfaces/Promark';

const get = <T extends keyof PromarkStore>(
  serial: string,
  key?: T
): T extends undefined ? PromarkStore : PromarkStore[T] => {
  const store: PromarkStore = storage.get('promark-store')?.[serial] ?? {};
  return (key ? store[key] : store) as T extends undefined ? PromarkStore : PromarkStore[T];
};

const set = <T extends keyof PromarkStore>(serial: string, key: T, data: PromarkStore[T]): void => {
  const store = storage.get('promark-store') ?? {};
  store[serial] = { ...store[serial], [key]: data };
  storage.set('promark-store', store);
};

export default {
  get,
  set,
};