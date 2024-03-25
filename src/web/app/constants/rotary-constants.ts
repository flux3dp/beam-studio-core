import { WorkAreaModel } from './workarea-constants';

// all unit in mm
export interface RotaryConstants {
  boundary?: number[];
  maxHeight: number;
}

const rotaryConstants: { [key in WorkAreaModel]?: RotaryConstants } = {
  ado1: {
    boundary: [100, 290],
    maxHeight: 408.2,
  },
};

export default rotaryConstants;