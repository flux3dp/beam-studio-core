import beamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import isDev from 'helpers/is-dev';
import { modelsWithModules } from 'app/constants/layer-module/layer-modules';

export enum TopRef {
  WINDOW = 0,
  TOPBAR = 1,
  LAYER_LIST = 2,
  LAYER_PARAMS = 3,
}

export enum RightRef {
  WINDOW = 0,
  RIGHT_SROLL_BAR = 1,
  RIGHT_PANEL = 2,
  PATH_PREVIEW_BTN = 3,
}

const isMacOrWeb = window.os === 'MacOS' || window.FLUX.version === 'web';

export const calculateTop = (top: number, ref: TopRef = TopRef.WINDOW): number => {
  switch (ref) {
    case TopRef.TOPBAR:
      return top + Constant.topBarHeight;
    case TopRef.LAYER_LIST:
      return top + Constant.topBarHeight + Constant.layerListHeight;
    case TopRef.LAYER_PARAMS:
      const offset = document.querySelector('.layerparams').getBoundingClientRect().top;
      return top + offset;
    default:
      return top + Constant.menuberHeight;
  }
};

export const calculateRight = (right: number, ref: RightRef = RightRef.WINDOW): number => {
  switch (ref) {
    case RightRef.RIGHT_SROLL_BAR:
      return right + Constant.rightPanelScrollBarWidth;
    case RightRef.RIGHT_PANEL:
      return right + Constant.rightPanelWidth;
    case RightRef.PATH_PREVIEW_BTN:
      const workarea = beamboxPreference.read('workarea');
      const shouldHideBtn = !isDev() && modelsWithModules.includes(workarea);
      const offset = (isMacOrWeb ? 6 : 26) + (shouldHideBtn ? 0 : 42);
      return right + offset;
    default:
      return right;
  }
};
