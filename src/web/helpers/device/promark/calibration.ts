import { sprintf } from 'sprintf-js';

import constant from 'app/actions/beambox/constant';
import { getDefaultConfig } from 'helpers/layer/layer-config-helper';
import { LaserType } from 'app/constants/promark-constants';
import { swiftrayClient } from 'helpers/api/swiftray-client';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import { getPromarkInfo } from './promark-info';

export const loadTaskToSwiftray = async (scene: string, model: WorkAreaModel): Promise<void> => {
  const uploadRes = await swiftrayClient.loadSVG(
    {
      data: scene,
      extension: 'svg',
      name: 'calibration.svg',
      uploadName: 'calibration.svg',
      thumbnail: '',
    },
    { onProgressing: () => {}, onFinished: () => {}, onError: () => {} },
    // use mid dpi (254)
    { engraveDpi: 254, model, rotaryMode: false }
  );
  if (!uploadRes.success)
    throw new Error(
      `Failed to load calibration task: ${uploadRes.error?.message ?? 'Unknown Error'}`
    );
  const convertRes = await swiftrayClient.convert(
    'gcode',
    { onProgressing: () => {}, onFinished: () => {}, onError: () => {} },
    { model, travelSpeed: 4000, isPromark: true }
  );
  if (!convertRes.success)
    throw new Error(
      `Failed to convert calibration task: ${convertRes.error?.message ?? 'Unknown Error'}`
    );
};

export const generateCalibrationTaskString = async ({
  width,
  power = 100,
  speed = 350,
}: {
  width: number;
  power?: number;
  speed?: number;
}): Promise<string> => {
  const fileName = 'fcode/promark-calibration.bvg';
  const resp = await fetch(fileName);
  let res = await resp.text();
  res = sprintf(res, { width: width * constant.dpmm, power, speed });
  return res;
};

export const loadCameraCalibrationTask = async (
  model: WorkAreaModel,
  width: number
): Promise<void> => {
  const fileName = `fcode/promark-calibration-${width}.bvg`;
  const resp = await fetch(fileName);
  let scene = await resp.text();
  const defaultConfig = getDefaultConfig();
  const params = {
    power: 100,
    speed: 1000,
    frequency: defaultConfig.frequency ?? 27,
    pulseWidth: defaultConfig.pulseWidth ?? 500,
  };
  const { laserType, watt } = getPromarkInfo();
  if (laserType === LaserType.MOPA) {
    if (watt === 100) params.power = 20;
  } else if (watt === 50) params.power = 40;
  scene = sprintf(scene, params);
  await loadTaskToSwiftray(scene, model);
};

export default { loadCameraCalibrationTask };
