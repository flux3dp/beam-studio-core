/* eslint-disable no-await-in-loop */
import alertCaller from 'app/actions/alert-caller';
import checkDeviceStatus from 'helpers/check-device-status';
import deviceMaster from 'helpers/device-master';
import durationFormatter from 'helpers/duration-formatter';
import getDevice from 'helpers/device/get-device';
import progressCaller from 'app/actions/progress-caller';
import i18n from 'helpers/i18n';
import { CurveEngraving } from 'interfaces/ICurveEngraving';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

const reMeasurePoints = async (
  data: CurveEngraving,
  indices: number[]
): Promise<CurveEngraving> => {
  const { lang } = i18n;
  let canceled = false;
  const progressId = 're-measure-points';
  progressCaller.openSteppingProgress({
    id: progressId,
    message: lang.message.connectingMachine,
    onCancel: () => {
      canceled = true;
    },
  });
  const { device } = await getDevice();
  if (!device) {
    alertCaller.popUpError({ message: 'Failed to connect to device.' });
    progressCaller.popById(progressId);
    return null;
  }
  const deviceStatus = await checkDeviceStatus(device);
  if (!deviceStatus) {
    alertCaller.popUpError({ message: 'Device is busy.' });
    progressCaller.popById(progressId);
    return null;
  }
  if (canceled) {
    progressCaller.popById(progressId);
    return null;
  }
  try {
    const feedrate = 6000;
    progressCaller.update(progressId, { message: lang.message.enteringRawMode });
    await deviceMaster.enterRawMode();
    progressCaller.update(progressId, { message: lang.message.homing });
    await deviceMaster.rawHome();
    if (canceled) {
      progressCaller.popById(progressId);
      return null;
    }
    progressCaller.update(progressId, { message: `${lang.curve_engraving.remeasuring_points} 0/${indices.length}` });
    const currentPosition = { x: 0, y: 0 };
    const { points, objectHeight } = data;
    const newPoints = [...points];
    const columns = points[0].length;
    let { lowest, highest } = data;
    const workarea = getWorkarea(device.model as WorkAreaModel);
    const [offsetX, offsetY, offsetZ] = workarea.autoFocusOffset || [0, 0, 0];
    const start = Date.now();
    for (let i = 0; i < indices.length; i += 1) {
      if (canceled) {
        progressCaller.popById(progressId);
        return null;
      }
      const idx = indices[i];
      const row = Math.floor(idx / columns);
      const column = idx % columns;
      const point = points[row][column];
      const [x, y] = point;

      await deviceMaster.rawMove({
        x: Math.max(x - offsetX, 0),
        y: Math.max(y - offsetY),
        f: feedrate,
      });
      const dist = Math.hypot(x - currentPosition.x, y - currentPosition.y);
      const time = (dist / feedrate) * 60;
      await new Promise((resolve) => setTimeout(resolve, time * 1000));
      currentPosition.x = x;
      currentPosition.y = y;

      try {
        const z = await deviceMaster.rawMeasureHeight(
          lowest === null ? { relZ: objectHeight } : { baseZ: Math.max(lowest - objectHeight, 0) }
        );
        if (lowest === null || z > lowest) lowest = z; // actually the max measured value
        const pointZ = typeof z === 'number' ? Math.max(0, z - offsetZ) : null;
        // actually the min measured value, use pointZ to display Plane when z is null
        if (highest === null || z < highest) highest = pointZ;
        newPoints[row][column][2] = pointZ;
      } catch (error) {
        console.error(`Failed to measure height at point ${x}, ${y}`, error);
      }
      const elapsedTime = Date.now() - start;
      const finished = i + 1;
      const finishedRatio = finished / indices.length;
      const remainingTime = (elapsedTime / finishedRatio - elapsedTime) / 1000;
      progressCaller.update(progressId, {
        message: `${lang.curve_engraving.remeasuring_points} ${finished}/${indices.length}<br>${
          lang.message.time_remaining
        } ${durationFormatter(remainingTime)}`,
        percentage: (finished / indices.length) * 100,
      });
    }
    return { ...data, points: newPoints, lowest, highest };
  } catch (error) {
    return null;
  } finally {
    if (deviceMaster.currentControlMode === 'raw') {
      await deviceMaster.rawLooseMotor();
      await deviceMaster.endRawMode();
    }
    progressCaller.popById(progressId);
  }
};

export default reMeasurePoints;
