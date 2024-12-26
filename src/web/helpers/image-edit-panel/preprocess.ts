import imageProcessor from 'implementations/imageProcessor';
import jimpHelper from 'helpers/jimp-helper';
import Jimp from 'jimp';

export interface CropperDimension {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const preprocessByJimpImage = async (
  image: Jimp,
  { isFullResolution = false } = {}
): Promise<{
  blobUrl: string;
  dimension: CropperDimension;
  originalWidth: number;
  originalHeight: number;
}> => {
  const { width: originalWidth, height: originalHeight } = image.bitmap;
  let blobUrl = await jimpHelper.imageToUrl(image);

  if (!isFullResolution && Math.max(originalWidth, originalHeight) > 600) {
    if (originalWidth >= originalHeight) {
      image.resize(600, imageProcessor.AUTO);
    } else {
      image.resize(imageProcessor.AUTO, 600);
    }
    blobUrl = await jimpHelper.imageToUrl(image);
  }

  const { width, height } = image.bitmap;
  const dimension: CropperDimension = { x: 0, y: 0, width, height };

  return { blobUrl, dimension, originalWidth, originalHeight };
};

export const preprocessByUrl = async (
  blobUrl: string,
  { isFullResolution = false } = {}
): Promise<{
  blobUrl: string;
  dimension: CropperDimension;
  originalWidth: number;
  originalHeight: number;
}> => {
  const image = await jimpHelper.urlToImage(blobUrl);

  return preprocessByJimpImage(image, { isFullResolution });
};
