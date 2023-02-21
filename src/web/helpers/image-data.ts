/* eslint-disable no-param-reassign */
/**
 * To get image data
 */
import grayScale from './grayscale';
import BeamboxPreference from '../app/actions/beambox/beambox-preference';
import { getSVGAsync } from './svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => { svgEditor = globalSVG.Editor; });
const MAX_IMAGE_PIXEL = 1e8;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (source, opts) => {
  opts.onComplete = opts.onComplete || (() => { });
  opts.type = opts.type || 'image/png';

  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const onload = async (e) => {
    const size = {
      width: opts.width || e.target.naturalWidth,
      height: opts.height || e.target.naturalHeight,
    };
    let imageBinary;
    const fetchedData = await fetch(img.src);
    const response = await fetchedData.blob();
    const arrayBuffer = await new Response(response).arrayBuffer();
    const rotationFlag = svgEditor.getExifRotationFlag(arrayBuffer);

    // DownSampling
    const shouldDownSample = BeamboxPreference.read('image_downsampling')
      || (BeamboxPreference.read('image_downsampling') === undefined);
    if (shouldDownSample) {
      if (!opts.isFullResolution) {
        const longSide = Math.max(size.width, size.height);
        const downRatio = Math.min(1, (1.5 * window.innerWidth) / longSide);
        size.width = Math.round(size.width * downRatio);
        size.height = Math.round(size.height * downRatio);
      }
    }
    if (size.width * size.height > MAX_IMAGE_PIXEL) {
      const downRatio = Math.sqrt(MAX_IMAGE_PIXEL / (size.width * size.height));
      size.width = Math.floor(size.width * downRatio);
      size.height = Math.floor(size.height * downRatio);
      // eslint-disable-next-line no-console
      console.log(`Size exceeds MAX_IMAGE_PIXEL, downsample to ${size.width} * ${size.height}`);
    }
    let w = size.width; let h = size.height;
    let rotation = 0;
    let shouldFlip = false;
    ctx.save();
    if (rotationFlag && rotationFlag > 1) {
      if (rotationFlag > 4) {
        [w, h] = [h, w];
      }
      switch (rotationFlag) {
        case 2:
          shouldFlip = true;
          break;
        case 3:
          rotation = Math.PI;
          break;
        case 4:
          rotation = Math.PI;
          shouldFlip = true;
          break;
        case 5:
          shouldFlip = true;
          rotation = Math.PI / 2;
          break;
        case 6:
          rotation = Math.PI / 2;
          break;
        case 7:
          shouldFlip = true;
          rotation = -Math.PI / 2;
          break;
        case 8:
          rotation = -Math.PI / 2;
          break;
        default:
          break;
      }
    }
    canvas.width = w;
    canvas.height = h;
    ctx.translate(w / 2, h / 2);
    if (shouldFlip) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(rotation);
    ctx.drawImage(
      img,
      -size.width / 2,
      -size.height / 2,
      size.width,
      size.height,
    );
    ctx.restore();
    const imageData = ctx.createImageData(w, h);
    imageBinary = ctx.getImageData(0, 0, w, h).data;

    if (typeof opts.grayscale !== 'undefined') {
      imageBinary = grayScale(imageBinary, opts.grayscale);
    }

    imageData.data.set(imageBinary);

    ctx.putImageData(imageData, 0, 0);
    const pngBase64 = canvas.toDataURL('image/png');

    await opts.onComplete({
      canvas,
      size,
      data: imageData,
      imageBinary,
      blob: new Blob([imageData.data], { type: opts.type }),
      pngBase64,
    });

    // remove event
    img.removeEventListener('load', onload, false);
  };

  img.addEventListener('load', onload, false);

  if (source instanceof Blob) {
    img.src = URL.createObjectURL(source);
  } else if (typeof source === 'string') {
    img.src = source;
  }
};
