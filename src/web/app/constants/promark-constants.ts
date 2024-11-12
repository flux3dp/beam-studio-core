import { Field, GalvoParameters, RedDot } from 'interfaces/Promark';

export const workareaOptions = [110, 150, 220] as const;
export const promarkWatts = [20, 30, 50] as const;
export const mopaWatts = [20, 60, 100] as const;

export enum LaserType {
  Desktop = 0,
  MOPA = 1,
}

export const defaultField: Field = { offsetX: 0, offsetY: 0, angle: 0 };
export const defaultGalvoParameters: GalvoParameters = {
  x: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
  y: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
};
export const defaultRedLight: RedDot = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };

export default {
  promarkWatts,
  mopaWatts,
  workareaOptions,
};
