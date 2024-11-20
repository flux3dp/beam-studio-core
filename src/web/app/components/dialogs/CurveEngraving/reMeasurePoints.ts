/* eslint-disable no-await-in-loop */
import alertCaller from 'app/actions/alert-caller';
import checkDeviceStatus from 'helpers/check-device-status';
import getDevice from 'helpers/device/get-device';
import progressCaller from 'app/actions/progress-caller';
import i18n from 'helpers/i18n';
import { CurveEngraving } from 'interfaces/ICurveEngraving';

import { measurePoints, endMeasure } from './measure';

// TODO: Add unit tests
const remeasurePoints = async (
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
    let completedCount = 0;
    const res = await measurePoints(device, indices, data, {
      checkCancel: () => canceled,
      onProgressText: (text) =>
        progressCaller.update(progressId, {
          message: `${lang.curve_engraving.remeasuring_points} ${completedCount}/${indices.length}<br>${text}`,
        }),
      onPointFinished: (count) => {
        completedCount = count;
        progressCaller.update(progressId, { percentage: (count / indices.length) * 100 });
      },
    });
    return { ...data, ...res };
  } catch (error) {
    return null;
  } finally {
    progressCaller.popById(progressId);
    await endMeasure();
  }
};

export default remeasurePoints;
