import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import { IDeviceInfo } from 'interfaces/IDevice';
import { RotationParameters3DCalibration } from 'interfaces/FisheyePreview';

const handle3DRotationChanged = async (
  params: RotationParameters3DCalibration,
  height: number,
  device: IDeviceInfo
): Promise<void> => {
  console.log('Applying', params);
  const { rx, ry, rz, sh, ch, tx = 0, ty = 0 } = params;
  const z = deviceConstants.WORKAREA_DEEP[device.model] - height;
  const rotationZ = sh * (z + ch);
  await deviceMaster.set3dRotation({ rx, ry, rz, h: rotationZ, tx, ty });
};

export default handle3DRotationChanged;
