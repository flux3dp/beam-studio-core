import ISVGCanvas from 'interfaces/ISVGCanvas';
import symbolMaker from 'helpers/symbol-maker';
import updateImageDisplay from 'helpers/image/updateImageDisplay';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

// TODO: add unit test
const toggleFullColorLayer = (layer: Element, val?: boolean): void => {
  layer.removeAttribute('data-fixedcolor');
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
  const uses = [...layer.querySelectorAll('use')];
  svgCanvas.updateLayerColor(layer);
  for (let i = 0; i < uses.length; i += 1) {
    symbolMaker.reRenderImageSymbol(uses[i] as SVGUseElement);
  }
};

export default toggleFullColorLayer;
