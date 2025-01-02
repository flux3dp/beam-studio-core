import getClipperLib from './getClipperLib';

// eslint-disable-next-line no-restricted-globals
const ClipperLib = getClipperLib();
let instance: any;
let type: 'offset' | 'clipper';

onmessage = async ({ data: { cmd, data, id } }) => {
  const startTime = performance.now();

  console.log('clipper.worker.ts startTime', startTime);

  if (cmd === 'initOffset') {
    const { args } = data;
    instance = new ClipperLib.ClipperOffset(...args);
    type = 'offset';

    postMessage({ id });
  } else if (cmd === 'initClipper') {
    const { args } = data;
    instance = new ClipperLib.Clipper(...args);
    type = 'clipper';

    postMessage({ id });
  } else if (cmd === 'addPaths') {
    const { path, joinType, endType } = data;
    instance.AddPaths(path, joinType, endType);
    postMessage({ id });
  } else if (cmd === 'execute') {
    const { args } = data;

    instance.Execute(...args);

    const res = type === 'offset' ? args[0] : args[1];

    postMessage({ id, data: res });
  }

  console.log('clipper.worker.ts endTime', performance.now() - startTime);
};
