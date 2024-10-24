import { FisheyeCameraParametersV3 } from 'interfaces/FisheyePreview';

export interface Field {
  offsetX: number;
  offsetY: number;
  angle: number;
}

export interface RedDot {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export interface LensCorrection {
  scale: number;
  bulge: number;
  skew: number;
  trapezoid: number;
}

export interface PromarkStore {
  field?: Field;
  redDot?: RedDot;
  cameraParameters?: FisheyeCameraParametersV3;
  cameraDeviceId?: string;
  lensCorrection?: { x: LensCorrection; y: LensCorrection };
}
