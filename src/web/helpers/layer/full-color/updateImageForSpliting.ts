/* eslint-disable no-await-in-loop */
import exifr from 'exifr';

import imageData from 'helpers/image-data';
import NS from 'app/constants/namespaces';
import { IImageDataResult } from 'interfaces/IImage';

// for rgb image, we need to transform it to cmyk
// for cmyk images we need to update the image data
const updateImageForSpliting = async (layerElement: SVGGElement): Promise<void> => {
  const images = layerElement.querySelectorAll('image');
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    const origImage = image.getAttribute('origImage');
    let exifrData;
    try {
      exifrData = await exifr.parse(origImage, { icc: true, tiff: { multiSegment: true } });
    } catch (e) {
      console.error('Failed to parse exif data', e);
    }
    if (exifrData?.ColorSpaceData === 'CMYK') {
      await new Promise<void>((resolve) => {
        imageData(origImage, {
          grayscale: undefined,
          isFullResolution: true,
          onComplete: (result: IImageDataResult) => {
            image.setAttribute('cmyk', '1');
            image.setAttributeNS(NS.XLINK, 'xlink:href', result.pngBase64);
            resolve();
          },
          purpose: 'spliting',
        });
      });
    }
  }
};

export default updateImageForSpliting;
