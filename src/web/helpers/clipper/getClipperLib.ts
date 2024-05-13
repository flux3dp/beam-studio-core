import './clipper_unminified';
// TODO: remove public/js/lib/clipper_unminified.js after update web external dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getClipperLib = (): any => {
  // @ts-expect-error ClipperLib import from clipper_unminified into global
  const { ClipperLib } = global;
  return ClipperLib;
};

export default getClipperLib;
