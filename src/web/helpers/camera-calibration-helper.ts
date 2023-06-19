import Constant from 'app/actions/beambox/constant';
import CameraCalibrationApi from 'helpers/api/camera-calibration';
import deviceMaster from 'helpers/device-master';
import VersionChecker from 'helpers/version-checker';
import { CALIBRATION_PARAMS, CameraConfig, DEFAULT_CAMERA_OFFSET } from 'app/constants/camera-calibration-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import i18n from './i18n';

const api = new CameraCalibrationApi();

const doAnalyzeResult = async (
  imgBlobUrl: string,
  x: number,
  y: number,
  angle: number,
  squareWidth: number,
  squareHeight: number,
): Promise<CameraConfig | null> => {
  const blobImgSize = await new Promise<{ width: number, height: number }>((resolve) => {
    const img = new Image();
    img.src = imgBlobUrl;
    img.onload = () => {
      console.log('Blob size', img.width, img.height);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });

  const { idealScaleRatio } = CALIBRATION_PARAMS;
  const squareSize = Constant.camera.calibrationPicture.size;

  const scaleRatioX = (squareSize * Constant.dpmm) / squareWidth;
  const scaleRatioY = (squareSize * Constant.dpmm) / squareHeight;
  const deviationX = x - blobImgSize.width / 2;
  const deviationY = y - blobImgSize.height / 2;

  const offsetX = -(deviationX * scaleRatioX) / Constant.dpmm + CALIBRATION_PARAMS.idealOffsetX;
  const offsetY = -(deviationY * scaleRatioY) / Constant.dpmm + CALIBRATION_PARAMS.idealOffsetY;

  if ((scaleRatioX / idealScaleRatio < 0.8) || (scaleRatioX / idealScaleRatio > 1.2)) {
    return null;
  }
  if ((scaleRatioY / idealScaleRatio < 0.8) || (scaleRatioY / idealScaleRatio > 1.2)) {
    return null;
  }
  if ((Math.abs(deviationX) > 400) || (Math.abs(deviationY) > 400)) {
    return null;
  }
  if (Math.abs(angle) > (10 * Math.PI) / 180) {
    return null;
  }
  return {
    X: offsetX,
    Y: offsetY,
    R: -angle,
    SX: scaleRatioX,
    SY: scaleRatioY,
  };
};

export const doSendPictureTask = async (imgBlobUrl: string): Promise<CameraConfig | null> => {
  const d = $.Deferred();
  fetch(imgBlobUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const fileReader = new FileReader();
      fileReader.onloadend = async (e) => {
        try {
          const resp = await api.upload(e.target.result as ArrayBuffer);
          d.resolve(resp);
        } catch (resp) {
          d.reject(resp.toString());
        }
      };
      fileReader.readAsArrayBuffer(blob);
    })
    .catch((err) => {
      d.reject(err);
    });

  const resp = await d.promise();
  const {
    status, x, y, angle, width, height,
  } = resp;
  let result = null;
  switch (status) {
    case 'ok':
      result = await doAnalyzeResult(imgBlobUrl, x, y, angle, width, height);
      break;
    case 'fail':
    case 'none':
    default:
      break;
  }
  return result;
};

export const doGetOffsetFromPicture = async (
  imgBlobUrl: string,
  setCurrentOffset: (offset: CameraConfig) => void,
): Promise<boolean> => {
  const offset = await doSendPictureTask(imgBlobUrl);
  if (!offset) {
    setCurrentOffset(DEFAULT_CAMERA_OFFSET);
    return false;
  }
  setCurrentOffset(offset);
  return true;
};

const doSetConfigTask = async (device, data: CameraConfig, borderless) => {
  const {
    X, Y, R, SX, SY,
  } = data;
  const parameterName = borderless ? 'camera_offset_borderless' : 'camera_offset';
  const vc = VersionChecker(device.version);
  if (vc.meetRequirement('BEAMBOX_CAMERA_CALIBRATION_XY_RATIO')) {
    await deviceMaster.setDeviceSetting(parameterName, `Y:${Y} X:${X} R:${R} S:${(SX + SY) / 2} SX:${SX} SY:${SY}`);
  } else {
    await deviceMaster.setDeviceSetting(parameterName, `Y:${Y} X:${X} R:${R} S:${(SX + SY) / 2}`);
  }
};

export const sendPictureThenSetConfig = async (
  result: CameraConfig,
  device: IDeviceInfo,
  borderless: boolean,
): Promise<void> => {
  console.log('Setting camera_offset', borderless ? 'borderless' : '', result);
  if (result) {
    await doSetConfigTask(device, {
      ...result,
      X: Math.round(result.X * 10) / 10,
      Y: Math.round(result.Y * 10) / 10,
    }, borderless);
  } else {
    throw new Error(i18n.lang.camera_calibration.analyze_result_fail);
  }
};

export const startFisheyeCalibrate = (): Promise<boolean> => api.startFisheyeCalibrate();
export const addFisheyeCalibrateImg = (imgBlob: Blob): Promise<boolean> => api.addFisheyeCalibrateImg(imgBlob);
export const doFishEyeCalibration = (): Promise<{ k: number[][]; d: number[][] }> => api.doFisheyeCalibration();
export const findPerspectivePoints = (imgBlob: Blob): Promise<{
  points: number[][];
}> => api.findPerspectivePoints(imgBlob);
