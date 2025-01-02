import { preprocessByUrl, PreprocessByUrlParams } from './preprocess';

onmessage = async ({
  data: { blobUrl, isFullResolution },
}: MessageEvent<PreprocessByUrlParams>) => {
  const startTime = performance.now();

  console.log('preprocess.url.worker startTime:', startTime);

  postMessage(await preprocessByUrl(blobUrl, { isFullResolution }), null);

  console.log('preprocess.url.worker endTime:', performance.now() - startTime);
};
