import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import updateImageDisplay from 'helpers/image/updateImageDisplay';
import { getObjectLayer } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import symbolMaker from 'helpers/symbol-maker';
import { IBatchCommand } from 'interfaces/IHistory';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const moveElementsToLayer = (layerName: string, elements: SVGElement[]): IBatchCommand | null => {
  const drawing = svgCanvas.getCurrentDrawing();
  const layer = drawing.getLayerByName(layerName);
  if (!layer) {
    return null;
  }
  const batchCmd = HistoryCommandFactory.createBatchCommand('Move Elements to Layer');
  const targetLayerFullColor = layer.getAttribute('data-fullcolor') === '1';
  elements.forEach((element) => {
    if (!element) return;
    const descendants = [element, ...element.querySelectorAll('*')] as Element[];
    descendants.forEach((descendant) => {
      descendant.removeAttribute('data-original-layer');
    });
    const oldLayer = getObjectLayer(element)?.elem;
    const oldLayerFullColor = oldLayer.getAttribute('data-fullcolor') === '1';
    const oldNextSibling = element.nextSibling;
    const oldParent = element.parentNode;
    layer.appendChild(element);
    if (targetLayerFullColor !== oldLayerFullColor) {
      descendants.filter((descendant) => descendant.tagName === 'image').forEach((image) => {
        if (targetLayerFullColor) image.setAttribute('data-fullcolor', '1');
        else image.removeAttribute('data-fullcolor');
        updateImageDisplay(image as SVGImageElement);
      });
      descendants.filter((descendant) => descendant.tagName === 'use').forEach((use) => {
        symbolMaker.reRenderImageSymbol(use as SVGUseElement);
      });
    }
    if (svgCanvas.isUsingLayerColor) {
      svgCanvas.updateElementColor(element);
    }
    batchCmd.addSubCommand(new history.MoveElementCommand(element, oldNextSibling, oldParent));
  });

  return batchCmd;
};

export const moveSelectedToLayer = (layerName: string): void => {
  if(svgCanvas.getTempGroup()) {
    const children = svgCanvas.ungroupTempGroup();
    svgCanvas.selectOnly(children, false);
  }
  const selectedElements = svgCanvas.getSelectedElems();
  const batchCmd = moveElementsToLayer(layerName, selectedElements);
  if (batchCmd && !batchCmd.isEmpty()) svgCanvas.addCommandToHistory(batchCmd);
  svgCanvas.tempGroupSelectedElements();
};

export default moveElementsToLayer;
