import { WorkAreaModel } from './workarea-constants';

export enum RotaryType {
  Roller = 1,
  Chuck = 2,
}

export const CHUCK_ROTARY_DIAMETER = 133;

export interface SupportInfo {
  autoFocus?: boolean;
  hybridLaser?: boolean;
  openBottom?: boolean;
  passThrough?: boolean;
  rotary?: {
    roller: boolean;
    chuck: boolean;
    extendWorkarea: boolean;
    mirror: boolean;
    defaultMirror?: boolean;
  };
  lowerFocus?: boolean;
  framingLowLaser?: boolean;
  redLight?: boolean;
  jobOrigin?: boolean;
}

const supportList: Record<WorkAreaModel, SupportInfo> = {
  fbm1: {
    autoFocus: true,
    hybridLaser: true,
    openBottom: true,
    passThrough: true,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: false,
      mirror: false,
    },
    jobOrigin: true,
  },
  fbb1b: {
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    jobOrigin: true,
  },
  fbb1p: {
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    jobOrigin: true,
  },
  fhexa1: {
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: false,
      mirror: false,
    },
    lowerFocus: true,
    jobOrigin: true,
  },
  ado1: {
    passThrough: true,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: true,
      mirror: true,
      defaultMirror: true,
    },
    lowerFocus: true,
    framingLowLaser: true,
    jobOrigin: true,
  },
  fbb2: {
    passThrough: true,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: true,
      mirror: true,
      defaultMirror: true,
    },
    lowerFocus: true,
    redLight: true,
    jobOrigin: true,
  },
  fpm1: {
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    lowerFocus: true,
  },
  flv1: {
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    jobOrigin: true,
  },
};

export const getSupportInfo = (workarea: WorkAreaModel): SupportInfo => supportList[workarea] || {};

export default {
  getSupportInfo,
  supportList,
};
