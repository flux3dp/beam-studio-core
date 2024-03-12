import constant from 'app/actions/beambox/constant';
import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import { WorkAreaModel } from 'app/constants/workarea';

export const getMaterialHeight = async (): Promise<number> => {
  const device = deviceMaster.currentDevice;
  await deviceMaster.enterRawMode();
  await deviceMaster.rawHome();
  await deviceMaster.rawStartLineCheckMode();
  const cameraCenter = constant.dimension.cameraCenter(device.info.model as WorkAreaModel);
  if (cameraCenter) await deviceMaster.rawMove({ x: cameraCenter[0], y: cameraCenter[1], f: 7500 });
  await deviceMaster.rawEndLineCheckMode();
  await deviceMaster.rawAutoFocus();
  const { didAf, z } = await deviceMaster.rawGetProbePos();
  await deviceMaster.endRawMode();
  if (!didAf) throw new Error('Auto focus failed');
  return Math.round((deviceConstants.WORKAREA_DEEP[device.info.model] - z) * 100) / 100;
};

export const prepareToTakePicture = async (): Promise<void> => {
  await deviceMaster.enterRawMode();
  await deviceMaster.rawHome();
  await deviceMaster.rawHomeZ();
  await deviceMaster.endRawMode();
};

export default {
  getMaterialHeight,
  prepareToTakePicture,
};
