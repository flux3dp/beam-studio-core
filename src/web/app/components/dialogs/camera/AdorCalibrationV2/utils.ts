import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import workareaConstants, { WorkAreaModel } from 'app/constants/workarea-constants';

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
  const { deep } = workareaConstants[device.info.model as WorkAreaModel] || workareaConstants.ado1;
  return Math.round((deep - z) * 100) / 100;
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
