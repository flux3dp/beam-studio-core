export type Units = 'inch' | 'cm' | 'mm' | 'px' | 'pt' | 'text';

const dpi = 72;
const svgUnitScaling = 254 / dpi; // 本來 72 個點代表 1 inch, 現在 254 個點代表 1 inch.
const unitMap = {
  inch: 25.4 * 10,
  cm: 10 * 10,
  mm: 10,
  px: svgUnitScaling,
  pt: 1,
  text: 1, // self made
};

const convertUnit = (val: number, to: Units, from: Units = 'pt'): number => {
  if (to === from || !unitMap[to]) {
    return val;
  }
  return (val * unitMap[from]) / unitMap[to];
};

export default {
  unitMap,
  convertUnit,
};
