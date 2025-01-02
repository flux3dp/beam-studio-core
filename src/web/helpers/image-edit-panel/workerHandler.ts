import { PreprocessByUrlParams, PreprocessByUrlResult } from './preprocess';

export const preprocessByUrlWorkerHandler = async ({
  blobUrl,
  isFullResolution,
}: PreprocessByUrlParams): Promise<PreprocessByUrlResult> =>
  new Promise((resolve) => {
    const worker = new Worker(
      new URL(
        /* webpackChunkName: "preprocess.url.worker" */
        './preprocess.url.worker.bundle.js',
        import.meta.url
      )
    );

    worker.postMessage({ blobUrl, isFullResolution });

    worker.onmessage = ({ data }) => {
      resolve(data);
      worker.terminate();
    };
  });

export const calculateBase64WorkerHandler = async (
  blobUrl: string,
  isShading: boolean,
  threshold: number,
  isFullColor: boolean
): Promise<string> =>
  new Promise((resolve) => {
    const worker = new Worker(
      new URL(
        /* webpackChunkName: "calculateBase64.worker" */
        './calculateBase64.worker.bundle.js',
        import.meta.url
      )
    );

    worker.postMessage({ blobUrl, isShading, threshold, isFullColor });

    worker.onmessage = ({ data }) => {
      resolve(data);
      worker.terminate();
    };
  });
