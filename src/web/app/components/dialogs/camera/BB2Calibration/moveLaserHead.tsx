import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

const moveLaserHead = async (): Promise<boolean> => {
  let isLineCheckMode = false;
  try {
    progressCaller.openNonstopProgress({
      id: 'move-laser-head',
      message: 'tMoving to center and focus...',
    });
    const device = deviceMaster.currentDevice;
    await deviceMaster.enterRawMode();
    await deviceMaster.rawHome();
    await deviceMaster.rawStartLineCheckMode();
    isLineCheckMode = true;
    const { width, height, cameraCenter } = getWorkarea(device.info.model as WorkAreaModel, 'fbb2');
    const center = cameraCenter ?? [width / 2, height / 2];
    await deviceMaster.rawMove({ x: center[0], y: center[1], f: 7500 });
    await deviceMaster.rawEndLineCheckMode();
    isLineCheckMode = false;
    // TODO: autofocus after the machine supports it
    // await deviceMaster.rawAutoFocus();
    await deviceMaster.rawLooseMotor();
    await deviceMaster.endRawMode();
    return true;
  } catch (error) {
    console.error(error);
    alertCaller.popUpError({ message: 'tFailed to move to center and focus.' });
    return false;
  } finally {
    if (deviceMaster.currentControlMode === 'raw') {
      if (isLineCheckMode) await deviceMaster.rawEndLineCheckMode();
      await deviceMaster.rawLooseMotor();
      await deviceMaster.endRawMode();
    }
    progressCaller.popById('move-laser-head');
  }
};

export default moveLaserHead;
