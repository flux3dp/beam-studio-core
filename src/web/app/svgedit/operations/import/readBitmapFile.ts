import getExifRotationFlag from 'helpers/image/getExifRotationFlag';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import imageData from 'helpers/image-data';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

// TODO: add unit test
const imageToPngBlob = async (image) =>
  new Promise<Blob>((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });

const readBitmapFile = async (
  file: File | Blob,
  opts?: {
    scale?: number;
    offset?: number[];
    gray?: boolean;
  }
): Promise<void> => {
  const scale = opts?.scale ?? 1;
  const offset = opts?.offset ?? [0, 0];
  const gray = opts?.gray ?? true;
  const reader = new FileReader();
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
    reader.onloadend = (e) => {
      resolve(e.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  });
  const rotationFlag = getExifRotationFlag(arrayBuffer);
  const img = new Image();
  const blob = new Blob([arrayBuffer]);
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.style.opacity = '0';
    img.src = URL.createObjectURL(blob);
  });

  const { width, height } = img;
  const newImage = svgCanvas.addSvgElementFromJson({
    element: 'image',
    attr: {
      x: offset[0] * scale,
      y: offset[1] * scale,
      width: (rotationFlag <= 4 ? width : height) * scale,
      height: (rotationFlag <= 4 ? height : width) * scale,
      id: svgCanvas.getNextId(),
      style: 'pointer-events:inherit',
      preserveAspectRatio: 'none',
      'data-threshold': 254,
      'data-shading': true,
      'data-fullcolor': gray ? 0 : 1,
      origImage: img.src,
      'data-ratiofixed': true,
    },
  });
  if (file.type === 'image/webp') {
    const pngBlob = await imageToPngBlob(img);
    const newSrc = URL.createObjectURL(pngBlob);
    URL.revokeObjectURL(img.src);
    newImage.setAttribute('origImage', newSrc);
  }
  await new Promise<void>((resolve) => {
    imageData(newImage.getAttribute('origImage'), {
      width,
      height,
      rotationFlag,
      grayscale: gray
        ? {
            is_rgba: true,
            is_shading: true,
            threshold: 254,
            is_svg: false,
          }
        : undefined,
      onComplete: (result) => {
        svgCanvas.setHref(newImage, result.pngBase64);
      },
    });
    svgCanvas.updateElementColor(newImage);
    svgCanvas.selectOnly([newImage]);
    svgCanvas.undoMgr.addCommandToHistory(new history.InsertElementCommand(newImage));
    if (!offset) {
      svgCanvas.alignSelectedElements('l', 'page');
      svgCanvas.alignSelectedElements('t', 'page');
    }
    resolve();
  });
};

export default readBitmapFile;
