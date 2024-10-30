import storage from 'implementations/storage';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import { PromarkInfo } from 'interfaces/Promark';
import { promarkModels } from 'app/actions/beambox/constant';

import promarkDataStore from './promark-data-store';

const defaultValue: PromarkInfo = {
  isMopa: false,
  watt: 20,
};

const getSerial = (): string => {
  const { model, serial } = TopBarController.getSelectedDevice() ?? {};
  if (promarkModels.has(model)) return serial;
  return storage.get('last-promark-serial') ?? 'no-serial';
};

export const getPromarkInfo = (): PromarkInfo => {
  const serial = getSerial();
  return promarkDataStore.get(serial, 'info') || defaultValue;
};

export const setPromarkInfo = (info: PromarkInfo): void => {
  const serial = getSerial();
  if (serial) promarkDataStore.set(serial, 'info', info);
};

export default {
  getPromarkInfo,
  setPromarkInfo,
};
