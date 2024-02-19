import { IDeviceInfo } from 'interfaces/IDevice';

import calculatePerspectivePointsV1 from './calculatePerspectivePointsV1';

const mockInterpolatePointsFromHeight = jest.fn();
const mockGetPerspectivePointsZ3Regression = jest.fn();
jest.mock('helpers/camera-calibration-helper', () => ({
  interpolatePointsFromHeight: (...args) => mockInterpolatePointsFromHeight(...args),
  getPerspectivePointsZ3Regression: (...args) => mockGetPerspectivePointsZ3Regression(...args),
}));

jest.mock('app/constants/device-constants', () => ({
  WORKAREA_IN_MM: {
    'model-1': [430, 300],
  },
}));

const mockLog = jest.fn();
global.console.log = mockLog;

describe('calculatePerspectivePointsV1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return perspectivePoints from interpolatePointsFromHeight', () => {
    const device = {
      model: 'model-1',
    };
    const params = {
      heights: [1, 2],
      center: [3, 4],
      points: [[5, 6]],
    };
    const height = 7;
    const baseLevelingData = {
      a: 8,
    };
    const levelingOffset = {
      a: 9,
    };
    const rotationData = {
      dh: 10,
    };
    mockInterpolatePointsFromHeight.mockReturnValue([[11, 12]]);
    const result = calculatePerspectivePointsV1(
      device as IDeviceInfo,
      params as any,
      height,
      baseLevelingData,
      levelingOffset,
      rotationData as any
    );
    expect(result).toEqual([[11, 12]]);
    expect(mockInterpolatePointsFromHeight).toHaveBeenCalledTimes(1);
    expect(mockInterpolatePointsFromHeight).toHaveBeenCalledWith(17, [1, 2], [[5, 6]], {
      chessboard: [48, 36],
      workarea: [430, 300],
      center: [3, 4],
      levelingOffsets: { a: 17 },
    });
    expect(mockGetPerspectivePointsZ3Regression).not.toHaveBeenCalled();
    expect(mockLog).toHaveBeenCalledWith('Use Height: ', 7);
    expect(mockLog).toHaveBeenCalledWith('After applying 3d rotation dh: ', 17);
  });

  it('should return perspectivePoints from getPerspectivePointsZ3Regression', () => {
    const device = {
      model: 'model-1',
    };
    const params = {
      z3regParam: [1, 2],
      center: [3, 4],
    };
    const height = 7;
    const baseLevelingData = {
      a: 8,
    };
    const levelingOffset = {
      a: 9,
    };
    const rotationData = {
      dh: 10,
    };
    mockGetPerspectivePointsZ3Regression.mockReturnValue([[11, 12]]);
    const result = calculatePerspectivePointsV1(
      device as IDeviceInfo,
      params as any,
      height,
      baseLevelingData,
      levelingOffset,
      rotationData as any
    );
    expect(result).toEqual([[11, 12]]);
    expect(mockGetPerspectivePointsZ3Regression).toHaveBeenCalledTimes(1);
    expect(mockGetPerspectivePointsZ3Regression).toHaveBeenCalledWith(17, [1, 2], {
      chessboard: [48, 36],
      workarea: [430, 300],
      center: [3, 4],
      levelingOffsets: { a: 17 },
    });
    expect(mockInterpolatePointsFromHeight).not.toHaveBeenCalled();
    expect(mockLog).toBeCalledTimes(2);
    expect(mockLog).toHaveBeenNthCalledWith(1, 'Use Height: ', 7);
    expect(mockLog).toHaveBeenNthCalledWith(2, 'After applying 3d rotation dh: ', 17);
  });
});
