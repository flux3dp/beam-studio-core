import { IDeviceInfo } from 'interfaces/IDevice';

const MachineDict = {
  ado1: 'Ador',
  fbm1: 'beamo',
  fbb1b: 'Beambox',
  fbb1p: 'Beambox Pro',
  fhexa1: 'HEXA',
};

const getDeviceName = (device: IDeviceInfo): string => {
  const machineType = MachineDict[device.model];
  if (machineType) return `${machineType} (${device.name})`;
  return device.name;
};

export default getDeviceName;
