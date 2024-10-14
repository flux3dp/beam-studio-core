import storage from 'implementations/storage';
import { FisheyeCameraParametersV3 } from 'interfaces/FisheyePreview';

interface PromarkStore {
  cameraParameters?: FisheyeCameraParametersV3;
  cameraDeviceId?: string;
}

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
