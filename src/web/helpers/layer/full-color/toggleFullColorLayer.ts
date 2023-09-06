import ISVGCanvas from 'interfaces/ISVGCanvas';
import updateImageDisplay from 'helpers/image/updateImageDisplay';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const toggleFullColorLayer = (layer: Element, val?: boolean): void => {
  const origVal = layer.getAttribute('data-fullcolor') === '1';
  const targetVal = val === undefined ? !origVal : val;
  console.log('Toggle Full Color Layer', layer, 'from', origVal, 'to', targetVal);
  if (targetVal === origVal) return;
  if (targetVal) layer.setAttribute('data-fullcolor', '1');
  else layer.removeAttribute('data-fullcolor');
  const images = [...layer.querySelectorAll('image')];
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    if (targetVal) {
      image.setAttribute('data-fullcolor', '1');
      updateImageDisplay(image as SVGImageElement);
    } else {
      image.removeAttribute('data-fullcolor');
      updateImageDisplay(image as SVGImageElement);
    }
  }
  svgCanvas.updateLayerColor(layer);
};

export default toggleFullColorLayer;
