export type WorkAreaLabel = 'beamo' | 'Beambox' | 'Beambox Pro' | 'HEXA' | 'Ador';
export type WorkAreaModel = 'fbm1' | 'fbb1b' | 'fbb1p' | 'fhexa1' | 'ado1';
export const allWorkareas = new Set(['fbm1', 'fbb1b', 'fbb1p', 'fhexa1', 'ado1']);

interface WorkArea {
  label: WorkAreaLabel;
  width: number; // mm
  height: number; // mm
  deep?: number; // mm
  displayHeight?: number; // mm
  maxSpeed: number; // mm/s
  minSpeed?: number; // mm/s
  rotary: number[];
  cameraCenter?: number[]; // [mm, mm]
}

const workareaConstants: {[key in WorkAreaModel]: WorkArea} = {
  fbm1: {
    label: 'beamo',
    width: 3000,
    height: 2100,
    maxSpeed: 300,
    minSpeed: 3,
    rotary: [0, 1],
  },
  fbb1b: {
    label: 'Beambox',
    width: 4000,
    height: 3750,
    maxSpeed: 300,
    minSpeed: 3,
    rotary: [0, 1],
  },
  fbb1p: {
    label: 'Beambox Pro',
    width: 6000,
    height: 3750,
    maxSpeed: 300,
    minSpeed: 3,
    rotary: [0, 1],
  },
  fhexa1: {
    label: 'HEXA',
    width: 7400,
    height: 4100,
    maxSpeed: 900,
    minSpeed: 3,
    rotary: [0, 1],
  },
  ado1: {
    label: 'Ador',
    width: 4300,
    height: 3000,
    deep: 40.5,
    maxSpeed: 400,
    rotary: [0, 1],
  },
};

export default workareaConstants;
