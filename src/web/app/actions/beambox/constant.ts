export type WorkAreaLabel = 'beamo' | 'Beambox' | 'Beambox Pro' | 'HEXA' | 'Ador';
export type WorkAreaModel = 'fbm1' | 'fbb1b' | 'fbb1p' | 'fhexa1' | 'fad1';

interface WorkArea {
  label: WorkAreaLabel;
  width: number; // px
  height: number; // px
  maxSpeed: number; // mm/s
  rotary: number[];
}

export const WorkareaMap = new Map<WorkAreaModel, WorkArea>();
WorkareaMap.set('fbm1', {
  label: 'beamo',
  width: 3000,
  height: 2100,
  maxSpeed: 300,
  rotary: [0, 1],
});
WorkareaMap.set('fbb1b', {
  label: 'Beambox',
  width: 4000,
  height: 3750,
  maxSpeed: 300,
  rotary: [0, 1],
});
WorkareaMap.set('fbb1p', {
  label: 'Beambox Pro',
  width: 6000,
  height: 3750,
  maxSpeed: 300,
  rotary: [0, 1],
});
WorkareaMap.set('fhexa1', {
  label: 'HEXA',
  width: 7400,
  height: 4100,
  maxSpeed: 900,
  rotary: [0, 1],
});
WorkareaMap.set('fad1', {
  label: 'Ador',
  width: 4300,
  height: 3000,
  maxSpeed: 400,
  rotary: [0],
});

export default {
  dpmm: 10,
  dimension: {
    getWidth: (model: WorkAreaModel): number => WorkareaMap.get(model)?.width || 3000,
    getHeight: (model: WorkAreaModel): number => WorkareaMap.get(model)?.height || 2100,
    getMaxSpeed: (model: WorkAreaModel): number => WorkareaMap.get(model)?.maxSpeed || 300,
  },
  getRotaryModels: (model: WorkAreaModel): number[] => WorkareaMap.get(model)?.rotary || [0],
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
    fad1: ['fad1'],
  },
  addonsSupportList: {
    rotary: ['fbm1', 'fbb1b', 'fbb1p', 'fhexa1'],
    openBottom: ['fbm1'],
    autoFocus: ['fbm1'],
    hybridLaser: ['fbm1'],
  },
  leftPanelWidth: 50, // px
  rightPanelWidth: window.os !== 'MacOS' ? 258 : 242, // px
  rightPanelScrollBarWidth: window.os !== 'MacOS' ? 16 : 0, // px
  sidePanelsWidth: window.os !== 'MacOS' ? 308 : 292, // px
  topBarHeight: (window.os === 'Windows' && window.FLUX.version !== 'web') ? 70 : 40, // px
  topBarHeightWithoutTitleBar: 40, // px
  menuberHeight: (window.os === 'Windows' && window.FLUX.version !== 'web') ? 30 : 0, // px
  layerListHeight: 400, // px
  rulerWidth: 15, // px
  rotaryYRatio: {
    1: 1,
    2: 1,
  },
};
