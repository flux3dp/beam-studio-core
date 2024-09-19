import transfromlist from './transfromlist';

const getRotationAngleFromTransformList = (
  tlist: SVGTransformList | null,
  toRad = false
): number => {
  if (!tlist) return 0;
  for (let i = 0; i < tlist.numberOfItems; i++) {
    const xform = tlist.getItem(i);
    if (xform.type === SVGTransform.SVG_TRANSFORM_ROTATE) {
      return toRad ? (xform.angle * Math.PI) / 180.0 : xform.angle;
    }
  }
  return 0;
};

export const getRotationAngle = (elem: SVGElement, toRad = false): number => {
  const tlist = transfromlist.getTransformList(elem as SVGGraphicsElement);
  return getRotationAngleFromTransformList(tlist, toRad);
};

export default {
  getRotationAngle,
  getRotationAngleFromTransformList,
};
