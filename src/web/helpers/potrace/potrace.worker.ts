import jimpHelper from 'helpers/jimp-helper';

import { posterize, trace } from '.';

onmessage = async ({ data: { imgUrl, imgBBox, method, options } }) => {
  const startTime = performance.now();

  console.log('potrace.worker.ts startTime', startTime);

  const image = await jimpHelper.urlToImage(imgUrl);
  const sx = imgBBox.width / image.bitmap.width;
  const sy = imgBBox.height / image.bitmap.height;
  const svgString = await (method === 'trace' ? trace : posterize)(image, options);

  postMessage({ sx, sy, svg: svgString }, null);

  console.log('potrace.worker.ts endTime', performance.now() - startTime);
};
