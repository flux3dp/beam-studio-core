import calculateBase64, { CalculateBase64Params } from './calculate-base64';

onmessage = async ({
  data: { blobUrl, isShading, threshold, isFullColor },
}: MessageEvent<CalculateBase64Params>) => {
  const startTime = performance.now();

  console.log('calculateBase64.worker startTime:', startTime);

  postMessage(await calculateBase64(blobUrl, isShading, threshold, isFullColor), null);

  console.log('preprocess.url.worker endTime:', performance.now() - startTime);
};
