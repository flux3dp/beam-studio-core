import { swiftrayClient } from 'helpers/api/swiftray-client';
import { WorkAreaModel } from 'app/constants/workarea-constants';

const loadCalibrationTask = async (model: WorkAreaModel, width: number): Promise<void> => {
  const fileName = `fcode/promark-calibration-${width}.bvg`;
  const resp = await fetch(fileName);
  const scene = await resp.text();
  // use mid dpi (254)
  const uploadRes = await swiftrayClient.loadSVG(
    { data: scene, extension: 'svg', name: fileName, uploadName: fileName, thumbnail: '' },
    { onProgressing: () => {}, onFinished: () => {}, onError: () => {} },
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

export default loadCalibrationTask;
