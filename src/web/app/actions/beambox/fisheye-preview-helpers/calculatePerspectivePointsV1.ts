import deviceConstants from 'app/constants/device-constants';
import {
  FisheyeCameraParametersV1,
  RotationParameters3DCalibration,
} from 'interfaces/FisheyePreview';
import { IDeviceInfo } from 'interfaces/IDevice';
import {
  interpolatePointsFromHeight,
  getPerspectivePointsZ3Regression,
} from 'helpers/camera-calibration-helper';

const calculatePerspectivePointsV1 = (
  device: IDeviceInfo,
  params: FisheyeCameraParametersV1,
  height: number,
  baseLevelingData: Record<string, number>,
  levelingOffset: Record<string, number>,
  rotationData?: RotationParameters3DCalibration
): [number, number][][] => {
  const { heights, center, points, z3regParam } = params;
  const workarea = [
    deviceConstants.WORKAREA_IN_MM[device.model]?.[0] || 430,
    deviceConstants.WORKAREA_IN_MM[device.model]?.[1] || 300,
  ];
  let finalHeight = height;
  console.log('Use Height: ', height);
  if (rotationData?.dh) finalHeight += rotationData.dh;
  console.log('After applying 3d rotation dh: ', finalHeight);
  const levelingData = { ...baseLevelingData };
  const keys = Object.keys(levelingData);
  keys.forEach((key) => {
    levelingData[key] += levelingOffset[key] ?? 0;
  });
  let perspectivePoints: [number, number][][];
  if (points && heights) {
    [perspectivePoints] = points;
    perspectivePoints = interpolatePointsFromHeight(finalHeight ?? 0, heights, points, {
      chessboard: [48, 36],
      workarea,
      center,
      levelingOffsets: levelingData,
    });
  } else if (z3regParam) {
    perspectivePoints = getPerspectivePointsZ3Regression(finalHeight ?? 0, z3regParam, {
      chessboard: [48, 36],
      workarea,
      center,
      levelingOffsets: levelingData,
    });
  }
  return perspectivePoints;
};

export default calculatePerspectivePointsV1;
