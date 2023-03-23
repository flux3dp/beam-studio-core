import deviceMaster from 'helpers/device-master';
import { IDeviceInfo } from 'interfaces/IDevice';

const checkCamera = async (device: IDeviceInfo): Promise<boolean> => {
  try {
    console.log(device);
    const selectResult = await deviceMaster.select(device);
    if (!selectResult.success) {
      throw new Error(selectResult.error || 'Fail to select device');
    }
    await deviceMaster.connectCamera();
    await deviceMaster.takeOnePicture();
    deviceMaster.disconnectCamera();
    return true;
  } catch (e) {
    console.log(e);
  }
  return false;
};

export default checkCamera;
