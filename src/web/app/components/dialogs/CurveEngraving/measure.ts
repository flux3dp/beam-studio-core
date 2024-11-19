/* eslint-disable no-await-in-loop */
import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import durationFormatter from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import { getSupportInfo } from 'app/constants/add-on';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { MeasureData, Points } from 'interfaces/ICurveEngraving';

export const setupMeasure = async (
  useRedLight: boolean,
  onProgressText?: (text: string) => void
): Promise<void> => {
  const { lang } = i18n;
  onProgressText(lang.message.enteringRawMode);
  await deviceMaster.enterRawMode();
  onProgressText(lang.message.homing);
  await deviceMaster.rawHome();
  if (useRedLight) {
    onProgressText(lang.message.endingRawMode);
    await deviceMaster.endRawMode();
    onProgressText(lang.message.enteringRedLaserMeasureMode);
    await deviceMaster.enterRedLaserMeasureMode();
  }
};

export const endMeasure = async (): Promise<void> => {
  try {
    if (deviceMaster.currentControlMode === 'raw') {
      await deviceMaster.rawLooseMotor();
      await deviceMaster.endRawMode();
    } else if (deviceMaster.currentControlMode === 'red_laser_measure') {
      await deviceMaster.endRedLaserMeasureMode();
    }
  } catch (error) {
    console.error('Failed to end measure mode', error);
  }
};

const measurePointRaw = async (
  x: number,
  y: number,
  feedrate: number,
  currentPosition: { x: number; y: number },
  offset?: [number, number, number],
  objectHeight?: number,
  lowest?: number
): Promise<number | null> => {
  const target = offset ? [Math.max(x - offset[0], 0), Math.max(y - offset[1], 0)] : [x, y];
  const [targetX, targetY] = target;
  await deviceMaster.rawMove({ x: targetX, y: targetY, f: feedrate });
  if (currentPosition) {
    const dist = Math.hypot(targetX - currentPosition.x, targetY - currentPosition.y);
    const time = (dist / feedrate) * 60;
    await new Promise((resolve) => setTimeout(resolve, time * 1000));
    Object.assign(currentPosition, { x: targetX, y: targetY });
  }
  const z = await deviceMaster.rawMeasureHeight(
    lowest === null ? { relZ: objectHeight } : { baseZ: Math.max(lowest - objectHeight, 0) }
  );
  return z;
};

const generatePoints = (xRange: Array<number>, yRange: Array<number>): Points =>
  yRange.map((y) => xRange.map((x) => [x, y, null]));

export const measurePoints = async (
  device: IDeviceInfo,
  targetIndices: Array<number>,
  curData: MeasureData,
  opts: {
    checkCancel?: () => boolean;
    onProgressText?: (text: string) => void;
    onPointFinished?: (finishedCount: number) => void;
  } = {}
): Promise<MeasureData> => {
  const { lang } = i18n;
  const { checkCancel, onProgressText, onPointFinished } = opts;
  const supportInfo = getSupportInfo(device.model);
  await setupMeasure(supportInfo.redLight, onProgressText);
  if (checkCancel?.()) return null;
  onProgressText?.(lang.curve_engraving.starting_measurement);
  const workarea = getWorkarea(device.model);
  const [offsetX, offsetY, offsetZ] = workarea.autoFocusOffset || [0, 0, 0];
  const feedrate = 6000;
  const currentPosition = { x: 0, y: 0 };
  const { objectHeight, points } = curData;
  let { lowest = null, highest = null } = curData;
  const newPoints = JSON.parse(JSON.stringify(points));
  const start = Date.now();
  const columns = newPoints[0].length;
  for (let i = 0; i < targetIndices.length; i += 1) {
    if (checkCancel?.()) return null;
    const idx = targetIndices[i];
    const row = Math.floor(idx / columns);
    const column = idx % columns;
    const point = newPoints[row][column];
    const [x, y] = point;

    try {
      let z: number | null = null;
      if (supportInfo.redLight) {
        if (i === 0) {
          onProgressText?.(lang.message.redLaserTakingReference);
          // first point
          z = await deviceMaster.takeReferenceZ(Math.max(x - offsetX, 0), Math.max(y - offsetY, 0));
        } else {
          z = await deviceMaster.measureZ(x, y);
        }
      } else {
        z = await measurePointRaw(
          x,
          y,
          feedrate,
          currentPosition,
          [offsetX, offsetY, offsetZ],
          objectHeight,
          lowest
        );
      }
      const pointZ = typeof z === 'number' ? Math.max(0, z - offsetZ) : null;
      if (lowest === null || z > lowest) lowest = z; // actually the max measured value
      // actually the min measured value, use pointZ to display Plane when z is null
      if (highest === null || z < highest) highest = pointZ;
      newPoints[row][column][2] = pointZ;
    } catch (error) {
      console.error(`Failed to measure height at point ${x}, ${y}`, error);
    }
    const elapsedTime = Date.now() - start;
    const finished = i + 1;
    const finishedRatio = (i + 1) / targetIndices.length;
    const remainingTime = (elapsedTime / finishedRatio - elapsedTime) / 1000;
    onProgressText?.(`${lang.message.time_remaining} ${durationFormatter(remainingTime)}`);
    onPointFinished?.(finished);
  }
  return {
    ...curData,
    points: newPoints,
    lowest,
    highest,
  };
};

const measure = async (
  device: IDeviceInfo,
  xRange: Array<number>,
  yRange: Array<number>,
  objectHeight: number,
  opts: {
    checkCancel?: () => boolean;
    onProgressText?: (text: string) => void;
    onPointFinished?: (finishedCount: number) => void;
  } = {}
): Promise<MeasureData | null> => {
  try {
    const points = generatePoints(xRange, yRange);
    const totalPoints = xRange.length * yRange.length;
    const targetIndices = Array.from({ length: totalPoints }, (_, i) => i);
    const data = await measurePoints(
      device,
      targetIndices,
      {
        points,
        objectHeight,
        lowest: null,
        highest: null,
        gap: [xRange[1] - xRange[0], yRange[1] - yRange[0]],
      },
      opts
    );
    return data;
  } catch (error) {
    alertCaller.popUpError({ message: `Failed to measure area ${error.message}` });
    console.log(error);
    return null;
  } finally {
    await endMeasure();
  }
};

export default measure;
