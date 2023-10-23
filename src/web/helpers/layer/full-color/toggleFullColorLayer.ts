import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

// TODO: add unit test
const toggleFullColorLayer = (layer: Element, opts: { val?: boolean; force?: boolean } = { force: false }): void => {
  const { val, force } = opts;
  layer.removeAttribute('data-fixedcolor');
  const origVal = layer.getAttribute('data-fullcolor') === '1';
  const targetVal = val === undefined ? !origVal : val;
  console.log('Toggle Full Color Layer', layer, 'from', origVal, 'to', targetVal);
  if (targetVal === origVal && !force) return;
  if (targetVal) layer.setAttribute('data-fullcolor', '1');
  else layer.removeAttribute('data-fullcolor');
  svgCanvas.updateLayerColor(layer);
};

export default toggleFullColorLayer;
