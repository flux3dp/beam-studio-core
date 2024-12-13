import { LaserType } from 'app/constants/promark-constants';
import { PromarkInfo } from 'interfaces/Promark';

const defaultValue: PromarkInfo = {
  laserType: LaserType.Desktop,
  watt: 20,
};
let value: PromarkInfo = defaultValue;

export const getSerial = (): string => 'no-serial';
export const getPromarkInfo = (): PromarkInfo => value;
export const setPromarkInfo = (info: PromarkInfo): void => {
  value = info;
};

export default {
  getPromarkInfo,
  setPromarkInfo,
};
