import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const toggleFullColorLayer = (layer: Element, opts: { val?: boolean; } = {}): IBatchCommand => {
  const { val } = opts;
  const origVal = layer.getAttribute('data-fullcolor') === '1';
  const targetVal = val ?? !origVal;
  console.log('Toggle Full Color Layer', layer, 'from', origVal, 'to', targetVal);
  if (targetVal === origVal) return null;
  svgCanvas.undoMgr.beginUndoableChange('data-fullcolor', [layer]);
  if (targetVal) layer.setAttribute('data-fullcolor', '1');
  else layer.removeAttribute('data-fullcolor');
  const cmd = svgCanvas.undoMgr.finishUndoableChange();
  svgCanvas.updateLayerColor(layer);
  cmd.onAfter = () => svgCanvas.updateLayerColor(layer);
  return cmd;
};

export default toggleFullColorLayer;
