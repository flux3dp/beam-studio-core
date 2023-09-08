import imageData from 'helpers/image-data';
import NS from 'app/constants/namespaces';
import { IImageDataResult } from 'interfaces/IImage';

const updateImageDisplay = (elem: SVGImageElement): Promise<void> => {
  const imgUrl = elem.getAttribute('origImage');
  const isFullColor = elem.getAttribute('data-fullcolor') === '1';
  const isShading = elem.getAttribute('data-shading') === 'true';
  const threshold = parseInt(elem.getAttribute('data-threshold') || '128', 10);
  return new Promise((resolve) => {
    imageData(imgUrl, {
      width: parseFloat(elem.getAttribute('width')),
      height: parseFloat(elem.getAttribute('height')),
      grayscale: isFullColor ? undefined : {
        is_rgba: true,
        is_shading: isShading,
        threshold,
        is_svg: false,
      },
      onComplete: (result: IImageDataResult) => {
        elem.setAttributeNS(NS.XLINK, 'xlink:href', result.pngBase64);
        resolve();
      },
    });
  });
};

export default updateImageDisplay;
