/* eslint-disable no-await-in-loop */
import exifr from 'exifr';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import getUtilWS from 'helpers/api/utils-ws';
import imageData from 'helpers/image-data';
import NS from 'app/constants/namespaces';
import { IImageDataResult } from 'interfaces/IImage';

// for rgb image, we need to transform it to cmyk
// for cmyk images we need to update the image data
const updateImageForSpliting = async (layerElement: SVGGElement): Promise<void> => {
  const utilWS = getUtilWS();
  const images = layerElement.querySelectorAll('image');
  const isFullResolution = beamboxPreference.read('image_downsampling') === false;
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    const origImage = image.getAttribute('origImage');
    const exifrData = await exifr.parse(origImage, { icc: true, tiff: { multiSegment: true } });
    if (exifrData?.ColorSpaceData !== 'CMYK') {
      const resp = await fetch(origImage);
      const blob = await resp.blob();
      const newBase64 = await utilWS.transformRgbImageToCmyk(blob, { resultType: 'base64' }) as string;
      image.setAttributeNS(NS.XLINK, 'xlink:href', `data:image/jpeg;base64,${newBase64}`);
    } else if (!isFullResolution) {
      await new Promise<void>((resolve) => {
        imageData(origImage, {
          grayscale: undefined,
          isFullResolution: true,
          onComplete: (result: IImageDataResult) => {
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
