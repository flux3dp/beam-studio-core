import imageProcessor from 'implementations/imageProcessor';
import jimpHelper from 'helpers/jimp-helper';

export interface CropperDimension {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const cropPreprocess = async (blobUrl: string): Promise<{
  blobUrl: string;
  dimension: CropperDimension;
  originalWidth: number;
  originalHeight: number;
}> => {
  const image = await jimpHelper.urlToImage(blobUrl);
  const { width: originalWidth, height: originalHeight } = image.bitmap;
  let result = blobUrl;
  if (Math.max(originalWidth, originalHeight) > 600) {
    if (originalWidth >= originalHeight) {
      image.resize(600, imageProcessor.AUTO);
    } else {
      image.resize(imageProcessor.AUTO, 600);
    }
    result = await jimpHelper.imageToUrl(image);
  }
  const { width, height } = image.bitmap;
  const dimension: CropperDimension = { x: 0, y: 0, width, height };

  return {
    blobUrl: result,
    dimension,
    originalWidth,
    originalHeight,
  };
};

export default {
  cropPreprocess,
};
