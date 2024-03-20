import { IDeviceInfo } from './IDevice';

export interface FisheyeMatrix {
  k: number[][];
  d: number[][];
  points: [number, number][][];
  center?: [number, number];
}

export interface FisheyeCameraParametersV1 {
  k: number[][];
  d: number[][];
  heights: number[];
  points: [number, number][][][];
  center: [number, number];
  z3regParam: number[][][][]; // [i][j][k][l] i: row, j: column, k: x/y, l: 3/2/1/0 th order;
}

export interface FisheyeCameraParametersV2Cali {
  refHeight?: number;
  k?: number[][];
  d?: number[][];
  rvec?: number[];
  tvec?: number[];
  points?: [number, number][][];
  // 3rd order regression parameters for camera position with respect to y position
  hx?: number[];
  hy?: number[];
  xc?: number[];
  yc?: number[];
  imageScale?: number[];
  dh?: number;
}

export interface FisheyeCameraParametersV2 {
  refHeight: number;
  k: number[][];
  d: number[][];
  rvec: number[];
  tvec: number[];
  points: [number, number][][];
  // 3rd order regression parameters for camera position with respect to y position
  hx: number[];
  hy: number[];
  xc: number[];
  yc: number[];
  imageScale: number[];
  v: 2;
}

export type FisheyeCameraParameters = FisheyeCameraParametersV1 | FisheyeCameraParametersV2;

/**
 * RotationParameters3D to save in the machine
 */
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

/**
 * RotationParameters3D for calibration
 * add tx and ty to handle translation error
 * tx and ty will be saved in FisheyeMatrix center
 */
export interface RotationParameters3DCalibration extends RotationParameters3D {
  tx: number;
  ty: number;
}

/**
 * RotationParameters3D for ghost api,
 * need to calculate h from sh, ch and object height
 */
export interface RotationParameters3DGhostApi {
  // rotation in 3 axes
  rx: number;
  ry: number;
  rz: number;
  h: number;
  tx: number;
  ty: number;
}

interface FisheyePreviewManagerBase {
  version: number;
  device: IDeviceInfo;
  params: FisheyeCameraParameters;
  objectHeight: number;
  levelingOffset: Record<string, number>;

  setupFisheyePreview(progressId?: string): Promise<boolean>;

  onObjectHeightChanged(): Promise<void>;

  resetObjectHeight(): Promise<boolean>;

  reloadLevelingOffset(): Promise<void>;
}

export interface FisheyePreviewManager {
  version: number;
  device: IDeviceInfo;
  params: FisheyeCameraParameters;
  support3dRotation: boolean;
  rotationData?: RotationParameters3DCalibration;
  objectHeight: number;
  levelingData: Record<string, number>;
  levelingOffset: Record<string, number>;

  setupFisheyePreview(progressId?: string): Promise<boolean>;

  update3DRotation?(newData: RotationParameters3DCalibration): Promise<void>;

  onObjectHeightChanged(): Promise<void>;

  resetObjectHeight(): Promise<boolean>;

  reloadLevelingOffset(): Promise<void>;
}
