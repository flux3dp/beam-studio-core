import isDev from 'helpers/is-dev';
import isWeb from 'helpers/is-web';

export const modelsSupportUsb = new Set(['fhexa1', 'ado1']);

export default {
  dpmm: 10,
  camera: {
    movementSpeed: {
      // limited by firmware
      x: 300 * 60, // mm per minutes
      y: 100 * 60, // mm per minutes
    },
    imgWidth: 640, // pixel
    imgHeight: 280, // pixel
    offsetX_ideal: 20, // mm
    offsetY_ideal: 30, // mm
    scaleRatio_ideal: (585 / 720) * 2, // pixel on studio / pixel on beambox machine; 與焦距成正比
    calibrationPicture: {
      centerX: 90, // mm
      centerY: 90, // mm
      size: 25, // mm
    },
  },
  borderless: {
    safeDistance: {
      X: 40, // mm
    },
  },
  diode: {
    calibrationPicture: {
      offsetX: 69, // mm
      offsetY: 6, // mm
      centerX: 159, // mm
      centerY: 96, // mm
    },
    limitX: 50, // mm
    limitY: 10, // mm
    defaultOffsetX: 70, // mm
    defaultOffsetY: 7, // mm
    safeDistance: {
      X: 50, // mm
      Y: 15, // mm
    },
  },
  allowedWorkarea: {
    'laser-b2': ['fhexa1', 'fbb1p', 'fbb1b', 'fbm1'],
    'laser-b1': ['fhexa1', 'fbb1p', 'fbb1b', 'fbm1'],
    fhexa1: ['fhexa1', 'fbb1p', 'fbb1b', 'fbm1'],
    fbb1p: ['fbb1p', 'fbb1b', 'fbm1'],
    fbb1b: ['fbb1b', 'fbm1'],
    fbm1: ['fbm1'],
    ado1: ['ado1', 'fad1'],
    fad1: ['ado1', 'fad1'],
    fpm1: ['fpm1'],
    flv1: ['flv1'],
  },
  adorModels: ['ado1', 'fad1'],
  highPowerModels: ['fhx1', 'ado1', 'flv1', 'fpm1'],
  leftPanelWidth: 50, // px
  rightPanelWidth: window.os !== 'MacOS' ? 258 : 242, // px
  rightPanelScrollBarWidth: window.os !== 'MacOS' ? 16 : 0, // px
  sidePanelsWidth: window.os !== 'MacOS' ? 308 : 292, // px
  topBarHeight: window.os === 'Windows' && !isWeb() ? 70 : 40, // px
  topBarHeightWithoutTitleBar: 40, // px
  titlebarHeight: window.os === 'Windows' && !isWeb() ? 30 : 0, // px
  menuberHeight: window.os === 'Windows' && !isWeb() ? 30 : 40, // px
  layerListHeight: 400, // px
  rulerWidth: 15, // px
  rotaryYRatio: {
    1: 1,
    2: 1,
  },
  dpiValueMap: {
    low: 100,
    medium: 250,
    high: 500,
    ultra: 1000,
  },
  modelMap: {
    fbm1: 'BEAMO',
    fbb1b: 'BEAMBOX',
    fbb1p: 'BEAMBOX_PRO',
    fhexa1: 'HEXA',
    fad1: 'ADOR',
    ado1: 'ADOR',
    fpm1: 'PROMARK',
    flv1: 'LAZERVIDA'
  }
};
