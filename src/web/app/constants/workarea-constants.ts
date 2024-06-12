export type WorkAreaLabel = 'beamo' | 'Beambox' | 'Beambox Pro' | 'HEXA' | 'Ador';
export type WorkAreaModel = 'fbm1' | 'fbb1b' | 'fbb1p' | 'fhexa1' | 'ado1';
export const allWorkareas = new Set(['fbm1', 'fbb1b', 'fbb1p', 'fhexa1', 'ado1']);

const dpmm = 10;
interface WorkArea {
  label: WorkAreaLabel;
  width: number; // mm
  pxWidth: number; // px
  height: number; // mm
  pxHeight: number; // px
  // extra displayHeight for modules
  displayHeight?: number; // mm
  pxDisplayHeight?: number; // px
  deep?: number; // mm
  maxSpeed: number; // mm/s
  minSpeed: number; // mm/s
  rotary: number[];
  cameraCenter?: number[]; // [mm, mm]
  autoFocusOffset?: number[]; // [mm, mm]
}

const workareaConstants: { [key in WorkAreaModel]: WorkArea } = {
  fbm1: {
    label: 'beamo',
    width: 300,
    pxWidth: 300 * dpmm,
    height: 210,
    pxHeight: 210 * dpmm,
    maxSpeed: 300,
    minSpeed: 0.5,
    rotary: [0, 1],
  },
  fbb1b: {
    label: 'Beambox',
    width: 400,
    pxWidth: 400 * dpmm,
    height: 375,
    pxHeight: 375 * dpmm,
    maxSpeed: 300,
    minSpeed: 0.5,
    rotary: [0, 1],
  },
  fbb1p: {
    label: 'Beambox Pro',
    width: 600,
    pxWidth: 600 * dpmm,
    height: 375,
    pxHeight: 375 * dpmm,
    maxSpeed: 300,
    minSpeed: 0.5,
    rotary: [0, 1],
  },
  fhexa1: {
    label: 'HEXA',
    width: 740,
    pxWidth: 740 * dpmm,
    height: 410,
    pxHeight: 410 * dpmm,
    maxSpeed: 900,
    minSpeed: 0.5,
    rotary: [0, 1],
    autoFocusOffset: [31.13, 1.2, 6.5],
  },
  ado1: {
    label: 'Ador',
    width: 430,
    pxWidth: 430 * dpmm,
    height: 300,
    pxHeight: 300 * dpmm,
    displayHeight: 320,
    pxDisplayHeight: 320 * dpmm,
    deep: 40.5,
    maxSpeed: 400,
    minSpeed: 0.5,
    rotary: [0, 1],
    cameraCenter: [215, 150],
    autoFocusOffset: [20.9, -40.38, 7.5],
  },
};

export const getWorkarea = (model: WorkAreaModel, fallbackModel: WorkAreaModel = 'fbm1'): WorkArea =>
  workareaConstants[model] || workareaConstants[fallbackModel];

export default workareaConstants;
