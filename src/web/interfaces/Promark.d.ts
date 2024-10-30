import { FisheyeCameraParametersV3 } from 'interfaces/FisheyePreview';
import { mopaWatts, promarkWatts } from 'app/constants/promark-constants';

export type PromarkInfo =
  | {
      isMopa: false;
      watt: (typeof promarkWatts)[number];
    }
  | {
      isMopa: true;
      watt: (typeof mopaWatts)[number];
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
