import { FisheyeCameraParametersV3 } from 'interfaces/FisheyePreview';

export interface LensCorrection {
  scale: number;
  bulge: number;
  skew: number;
  trapezoid: number;
}

export interface PromarkStore {
  cameraParameters?: FisheyeCameraParametersV3;
  cameraDeviceId?: string;
  lensCorrection?: { x: LensCorrection; y: LensCorrection };
}
