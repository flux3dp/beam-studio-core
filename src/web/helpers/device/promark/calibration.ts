import { sprintf } from 'sprintf-js';

import constant from 'app/actions/beambox/constant';
import { swiftrayClient } from 'helpers/api/swiftray-client';
import { WorkAreaModel } from 'app/constants/workarea-constants';

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
    { model, travelSpeed: 4000 }
  );
  if (!convertRes.success)
    throw new Error(
      `Failed to convert calibration task: ${convertRes.error?.message ?? 'Unknown Error'}`
    );
};

export const generateCalibrationTaskString = async ({
  width,
  transform = '',
  power = 100,
  speed = 350,
}: {
  width: number;
  transform?: string;
  power?: number;
  speed?: number;
}): Promise<string> => {
  const fileName = 'fcode/promark-calibration.bvg';
  const resp = await fetch(fileName);
  let res = await resp.text();
  res = sprintf(res, { width: width * constant.dpmm, transform, power, speed });
  return res;
};

export const loadCameraCalibrationTask = async (
  model: WorkAreaModel,
  width: number
): Promise<void> => {
  const fileName = `fcode/promark-calibration-${width}.bvg`;
  const resp = await fetch(fileName);
  const scene = await resp.text();
  await loadTaskToSwiftray(scene, model);
};

export const calculateRedDotTransform = (
  width: number,
  offsetX: number,
  offsetY: number,
  scaleX: number,
  scaleY: number
): string => {
  console.log(width);
  const halfWidthPx = (width * constant.dpmm) / 2;
  const [offsetXPx, offsetYPx] = [offsetX, offsetY].map((v) => v * constant.dpmm);
  const translate1 = DOMMatrix.fromMatrix({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: halfWidthPx,
    f: halfWidthPx,
  });
  const scale = DOMMatrix.fromMatrix({ a: scaleX, b: 0, c: 0, d: scaleY, e: 0, f: 0 });
  const translate2 = DOMMatrix.fromMatrix({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: -halfWidthPx,
    f: -halfWidthPx,
  });
  const translate3 = DOMMatrix.fromMatrix({ a: 1, b: 0, c: 0, d: 1, e: offsetXPx, f: offsetYPx });
  const { a, b, c, d, e, f } = translate1.multiply(scale).multiply(translate2).multiply(translate3);
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
};

export default { loadCameraCalibrationTask };
