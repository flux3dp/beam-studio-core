export const STEP_ASK_READJUST = Symbol('STEP_ASK_READJUST');
export const STEP_REFOCUS = Symbol('STEP_REFOCUS');
export const STEP_PUT_PAPER = Symbol('STEP_PUT_PAPER');
export const STEP_BEFORE_ANALYZE_PICTURE = Symbol('STEP_BEFORE_ANALYZE_PICTURE');
export const STEP_FINISH = Symbol('STEP_FINISH');

export const DEFAULT_CAMERA_OFFSET = {
  X: 15, Y: 30, R: 0, SX: 1.625, SY: 1.625,
};

export const CALIBRATION_PARAMS = {
  centerX: 90, // mm
  centerY: 90, // mm
  size: 25, // mm
  idealOffsetX: 20, // mm
  idealOffsetY: 30, // mm
  idealScaleRatio: (585 / 720) * 2, // pixel on studio / pixel on beambox machine; 與焦距成正比
};

export interface CameraParameters {
  x: number,
  y: number,
  angle: number,
  scaleRatioX: number,
  scaleRatioY: number,
}

export interface CameraConfig {
  X: number;
  Y: number;
  R: number;
  SX: number;
  SY: number;
}

export interface FisheyeMatrix {
  k: number[][];
  d: number[][];
  points: [number, number][][];
  center?: [number, number];
}

export interface FisheyeCameraParameters {
  k: number[][];
  d: number[][];
  heights: number[];
  points: [number, number][][][];
  center: [number, number];
  z3regParam: number[][][][]; // [i][j][k][l] i: row, j: column, k: x/y, l: 3/2/1/0 th order
}

export interface RotationParameters3D {
  // rotation in 3 axes
  rx: number;
  ry: number;
  rz: number;
  // sh: Scale of h, since the dimension of the image is in pixel, the height when previewing is in mm,
  // we need the scale of h to convert the height in mm to pixel, the value is usually 6
  sh: number;
  // ch: constant of h, the distant from the top position of probe to the camera,
  // the value is usually 162mm in mechanical
  ch: number;
  // dh: the height deviation of the camera, would apply to preview height
  dh: number;
}
