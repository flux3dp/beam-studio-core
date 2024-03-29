import deviceMaster from 'helpers/device-master';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

export const getMaterialHeight = async (): Promise<number> => {
  const device = deviceMaster.currentDevice;
  await deviceMaster.enterRawMode();
  await deviceMaster.rawHome();
  await deviceMaster.rawStartLineCheckMode();
  const workarea = getWorkarea(device.info.model as WorkAreaModel, 'ado1');
  const { cameraCenter, deep } = workarea
  if (cameraCenter) await deviceMaster.rawMove({ x: cameraCenter[0], y: cameraCenter[1], f: 7500 });
  await deviceMaster.rawEndLineCheckMode();
  await deviceMaster.rawAutoFocus();
  const { didAf, z } = await deviceMaster.rawGetProbePos();
  await deviceMaster.rawLooseMotor();
  await deviceMaster.endRawMode();
  if (!didAf) throw new Error('Auto focus failed');
  return Math.round((deep - z) * 100) / 100;
};

export const prepareToTakePicture = async (): Promise<void> => {
  await deviceMaster.enterRawMode();
  await deviceMaster.rawHome();
  await deviceMaster.rawHomeZ();
  await deviceMaster.rawLooseMotor();
  await deviceMaster.endRawMode();
};

export default {
  getMaterialHeight,
  prepareToTakePicture,
};
