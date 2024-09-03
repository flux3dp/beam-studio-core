import isDev from 'helpers/is-dev';

import { WorkAreaModel } from './workarea-constants';

export enum RotaryType {
  Roller = 1,
  Chuck = 2,
}

export const CHUCK_ROTARY_DIAMETER = 133;

interface SupportInfo {
  autoFocus: boolean;
  hybridLaser: boolean;
  openBottom: boolean;
  passThrough: boolean;
  rotary?: {
    roller: boolean;
    chuck: boolean;
    extendWorkarea: boolean;
    mirror: boolean;
    defaultMirror?: boolean;
  };
  lowerFocus: boolean;
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
    lowerFocus: false,
  },
  fbb1b: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    lowerFocus: false,
  },
  fbb1p: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: {
      roller: true,
      chuck: false,
      extendWorkarea: false,
      mirror: false,
    },
    lowerFocus: false,
  },
  fhexa1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: false,
      mirror: false,
    },
    lowerFocus: isDev(),
  },
  ado1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: true,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: true,
      mirror: true,
      defaultMirror: true,
    },
    lowerFocus: isDev(),
  },
  fbb2: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: true,
    rotary: {
      roller: true,
      chuck: true,
      extendWorkarea: true,
      mirror: true,
    },
    lowerFocus: isDev(),
  },
};

export const getSupportInfo = (workarea: WorkAreaModel): SupportInfo => supportList[workarea] || {
  autoFocus: false,
  hybridLaser: false,
  openBottom: false,
  passThrough: false,
  lowerFocus: false,
};

export default {
  getSupportInfo,
  supportList,
};
