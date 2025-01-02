import imageData from 'helpers/image-data';

import { IImageDataResult } from 'interfaces/IImage';

export interface CalculateBase64Params {
  blobUrl: string;
  isShading: boolean;
  threshold: number;
  isFullColor?: boolean;
}

const calculateBase64 = (
  blobUrl: string,
  isShading: boolean,
  threshold: number,
  isFullColor = false
): Promise<string> =>
  new Promise<string>((resolve) => {
    imageData(blobUrl, {
      grayscale: isFullColor
        ? undefined
        : { is_rgba: true, is_shading: isShading, threshold, is_svg: false },
      isFullResolution: true,
      onComplete: ({ pngBase64 }: IImageDataResult) => {
        resolve(pngBase64);
      },
    });
  });

export default calculateBase64;
