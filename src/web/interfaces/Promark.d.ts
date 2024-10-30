import { FisheyeCameraParametersV3 } from 'interfaces/FisheyePreview';

export type PromarkInfo =
  | {
      isMopa: false;
      watt: 20 | 30 | 50;
    }
  | {
      isMopa: true;
      watt: 20 | 60 | 100;
    };

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
  info?: PromarkInfo;
  field?: Field;
  redDot?: RedDot;
  cameraParameters?: FisheyeCameraParametersV3;
  cameraDeviceId?: string;
  lensCorrection?: { x: LensCorrection; y: LensCorrection };
}
