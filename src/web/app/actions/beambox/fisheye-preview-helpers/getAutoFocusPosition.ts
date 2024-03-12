import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import { IDeviceInfo } from 'interfaces/IDevice';

const getAutoFocusPosition = async (device: IDeviceInfo): Promise<string> => {
  const workarea = [
    deviceConstants.WORKAREA[device.model]?.[0] || 430,
    deviceConstants.WORKAREA[device.model]?.[1] || 300,
  ];
  const lastPosition = await deviceMaster.rawGetLastPos();
  const { x, y } = lastPosition;
  let xIndex = 0;
  if (x > workarea[0] * (2 / 3)) xIndex = 2;
  else if (x > workarea[0] * (1 / 3)) xIndex = 1;
  let yIndex = 0;
  if (y > workarea[1] * (2 / 3)) yIndex = 2;
  else if (y > workarea[1] * (1 / 3)) yIndex = 1;
  const refKey = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'][yIndex * 3 + xIndex];
  console.log('Probe position', lastPosition, 'refKey', refKey);
  return refKey;
};

export default getAutoFocusPosition;
