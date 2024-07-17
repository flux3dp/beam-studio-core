import { WorkAreaModel } from './workarea-constants';

interface SupportInfo {
  autoFocus: boolean;
  hybridLaser: boolean;
  openBottom: boolean;
  passThrough: boolean;
  rotary: boolean;
}

const supportList: Record<WorkAreaModel, SupportInfo> = {
  fbm1: {
    autoFocus: true,
    hybridLaser: true,
    openBottom: true,
    passThrough: true,
    rotary: true,
  },
  fbb1b: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: true,
  },
  fbb1p: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: true,
  },
  fhexa1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: true,
  },
  ado1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: true,
    rotary: false,
  },
  fpm1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: true,
  },
  flv1: {
    autoFocus: false,
    hybridLaser: false,
    openBottom: false,
    passThrough: false,
    rotary: true,
  },
};

export const getSupportInfo = (workarea: WorkAreaModel): SupportInfo => supportList[workarea] || {
  autoFocus: false,
  hybridLaser: false,
  openBottom: false,
  passThrough: false,
  rotary: false,
};

export default {
  getSupportInfo,
  supportList,
};
