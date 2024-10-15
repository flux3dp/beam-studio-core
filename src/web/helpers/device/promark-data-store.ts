import storage from 'implementations/storage';
import { PromarkStore } from 'interfaces/Promark';


const get = <T extends keyof PromarkStore>(
  uuid: string,
  key?: T
): T extends undefined ? PromarkStore : PromarkStore[T] => {
  const store: PromarkStore = storage.get('promark-store')?.[uuid] ?? {};
  return (key ? store[key] : store) as T extends undefined ? PromarkStore : PromarkStore[T];
};

const set = <T extends keyof PromarkStore>(uuid: string, key: T, data: PromarkStore[T]): void => {
  const store = storage.get('promark-store') ?? {};
  store[uuid] = { ...store[uuid], [key]: data };
  storage.set('promark-store', store);
};

export default {
  get,
  set,
};
