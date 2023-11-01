import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import { cloneLayerConfig, DataType, getData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveSelectedToLayer } from 'helpers/layer/moveToLayer';
import { IBatchCommand, ICommand } from 'interfaces/IHistory';

const LANG = i18n.lang.beambox.right_panel.layer_panel;

let svgCanvas: ISVGCanvas;
let svgedit: ISVGDrawing;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

export function getObjectLayer(elem: SVGElement): { elem: SVGGElement; title: string } {
  const layer = elem.closest('g.layer');
  if (layer) {
    const title = layer.querySelector('title');
    if (title) {
      return { elem: layer as SVGGElement, title: title.innerHTML };
    }
  }
  // When multi selecting, elements does not belong to any layer
  // So get layer from data original layer
  const origLayerName = elem.getAttribute('data-original-layer');
  if (origLayerName) {
    const drawing = svgCanvas.getCurrentDrawing();
    const origLayer = drawing.getLayerByName(origLayerName);
    if (origLayer) {
      return { elem: origLayer, title: origLayerName };
    }
  }
  return null;
}

export const getAllLayerNames = (): string[] => {
  const allLayers = document.querySelectorAll('g.layer');
  const layerNames = [];
  for (let i = 0; i < allLayers.length; i += 1) {
    const title = allLayers[i].querySelector('title');
    if (title) {
      layerNames.push(title.textContent);
    }
  }
  return layerNames;
};

export const getLayerPosition = (layerName: string): number => {
  const allLayers = document.querySelectorAll('g.layer');
  for (let i = 0; i < allLayers.length; i += 1) {
    const title = allLayers[i].querySelector('title');
    if (title && title.textContent === layerName) return i;
  }
  return -1;
};

export const sortLayerNamesByPosition = (layerNames: string[]): string[] => {
  const layerNamePositionMap = {};
  const allLayers = document.querySelectorAll('g.layer');
  for (let i = 0; i < allLayers.length; i += 1) {
    const title = allLayers[i].querySelector('title');
    if (title) layerNamePositionMap[title.textContent] = i;
  }
  for (let i = layerNames.length - 1; i >= 0; i -= 1) {
    if (!(layerNamePositionMap[layerNames[i]] > -1)) {
      layerNames.splice(i, 1);
    }
  }
  layerNames.sort((a, b) => layerNamePositionMap[a] - layerNamePositionMap[b]);
  return layerNames;
};

export const getLayerElementByName = (layerName: string): Element => {
  const allLayers = Array.from(document.querySelectorAll('g.layer'));
  const layer = allLayers.find((l) => {
    const title = l.querySelector('title');
    if (title) {
      return title.textContent === layerName;
    }
    return false;
  });
  return layer;
};

export const getLayerName = (layer: Element): string => {
  const title = layer.querySelector('title');
  if (title) {
    return title.textContent;
  }
  return '';
};

export const deleteLayerByName = (layerName: string): ICommand => {
  const layer = getLayerElementByName(layerName);
  if (layer) {
    const { nextSibling } = layer;
    const parent = layer.parentNode;
    layer.remove();
    return new history.RemoveElementCommand(layer, nextSibling, parent);
  }
  return null;
};

export const deleteLayers = (layerNames: string[]): void => {
  const drawing = svgCanvas.getCurrentDrawing();
  const batchCmd: IBatchCommand = new history.BatchCommand('Delete Layer(s)');
  for (let i = 0; i < layerNames.length; i += 1) {
    const cmd = deleteLayerByName(layerNames[i]);
    if (cmd) {
      batchCmd.addSubCommand(cmd);
    }
  }
  const layerCounts = document.querySelectorAll('g.layer').length;
  if (!layerCounts) {
    const svgcontent = document.getElementById('svgcontent');
    const newLayer = new svgedit.draw.Layer(
      LANG.layer1,
      null,
      svgcontent,
      '#333333'
    ).getGroup() as Element;
    batchCmd.addSubCommand(new history.InsertElementCommand(newLayer));
  }
  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  drawing.identifyLayers();
  svgCanvas.clearSelection();
};

export const cloneLayer = (
  layerName: string,
  opts: {
    isSub?: boolean; // if true, do not add command to history
    name?: string; // if provided, use this name instead of auto generated name
    configOnly?: boolean; // if true, only clone layer config
  }
): { name: string; cmd: ICommand; elem: SVGGElement } | null => {
  const layer = getLayerElementByName(layerName);
  if (!layer) return null;
  const { isSub = false, name: clonedLayerName, configOnly = false } = opts;

  const drawing = svgCanvas.getCurrentDrawing();
  const color = layer.getAttribute('data-color') || '#333';
  const svgcontent = document.getElementById('svgcontent');
  const baseName = clonedLayerName || `${layerName} copy`;
  let newName = baseName;
  let j = 0;
  while (drawing.hasLayer(newName)) {
    j += 1;
    newName = `${baseName} ${j}`;
  }
  const newLayer = new svgedit.draw.Layer(newName, null, svgcontent, color).getGroup();
  if (!configOnly) {
    const children = layer.childNodes;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i] as Element;
      if (child.tagName !== 'title') {
        const copiedElem = drawing.copyElem(child);
        newLayer.appendChild(copiedElem);
      }
    }
  }
  cloneLayerConfig(newName, layerName);
  const cmd = new history.InsertElementCommand(newLayer);
  if (!isSub) {
    svgCanvas.undoMgr.addCommandToHistory(cmd);
    drawing.identifyLayers();
    svgCanvas.clearSelection();
  }
  return { name: newName, cmd, elem: newLayer };
};

export const cloneLayers = (layerNames: string[]): string[] => {
  sortLayerNamesByPosition(layerNames);
  const clonedLayerNames: string[] = [];
  const drawing = svgCanvas.getCurrentDrawing();
  const batchCmd = new history.BatchCommand('Clone Layer(s)');
  for (let i = 0; i < layerNames.length; i += 1) {
    const res = cloneLayer(layerNames[i], { isSub: true });
    if (res) {
      const { cmd, name } = res;
      batchCmd.addSubCommand(cmd);
      clonedLayerNames.push(name);
    }
  }
  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  drawing.identifyLayers();
  svgCanvas.clearSelection();
  return clonedLayerNames;
};

export const setLayerLock = (layerName: string, isLocked: boolean): void => {
  const layer = getLayerElementByName(layerName);
  if (isLocked) {
    layer.setAttribute('data-lock', 'true');
  } else {
    layer.removeAttribute('data-lock');
  }
};

export const setLayersLock = (layerNames: string[], isLocked: boolean): void => {
  for (let i = 0; i < layerNames.length; i += 1) {
    setLayerLock(layerNames[i], isLocked);
  }
};

export const showMergeAlert = async (
  baseLayerName: string,
  layerNames: string[]
): Promise<boolean> => {
  const targetModule = getData<LayerModule>(getLayerElementByName(baseLayerName), DataType.module);
  const modules = new Set(
    layerNames.map((layerName) =>
      getData<LayerModule>(getLayerElementByName(layerName), DataType.module)
    )
  );
  modules.add(targetModule);
  if (modules.has(LayerModule.PRINTER) && modules.size > 1) {
    return new Promise<boolean>((resolve) => {
      Alert.popUp({
        id: 'merge-layers',
        caption:
          targetModule === LayerModule.PRINTER
            ? LANG.notification.mergeLaserLayerToPrintingLayerTitle
            : LANG.notification.mergePrintingLayerToLaserLayerTitle,
        message:
          targetModule === LayerModule.PRINTER
            ? LANG.notification.mergeLaserLayerToPrintingLayerMsg.replace('%s', baseLayerName)
            : LANG.notification.mergePrintingLayerToLaserLayerMsg.replace('%s', baseLayerName),
        messageIcon: 'notice',
        buttonType: AlertConstants.CONFIRM_CANCEL,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }
  return true;
};

const mergeLayer = (
  baseLayerName: string,
  layersToBeMerged: string[],
  shouldInsertBefore: boolean
): IBatchCommand | null => {
  const baseLayer = getLayerElementByName(baseLayerName);
  if (!baseLayer) return null;

  const firstChildOfBase = Array.from(baseLayer.childNodes).find(
    (node: Element) => !['title', 'filter'].includes(node.tagName)
  );
  const batchCmd: IBatchCommand = new history.BatchCommand(`Merge into ${baseLayer}`);
  for (let i = 0; i < layersToBeMerged.length; i += 1) {
    const layer = getLayerElementByName(layersToBeMerged[i]);
    if (layer) {
      const { childNodes } = layer;
      for (let j = 0; j < childNodes.length; j += 1) {
        const child = childNodes[j];
        if (!['title', 'filter'].includes(child.nodeName)) {
          const { nextSibling } = child;
          if (shouldInsertBefore) baseLayer.insertBefore(child, firstChildOfBase);
          else baseLayer.appendChild(child);

          const cmd = new history.MoveElementCommand(child, nextSibling, layer);
          batchCmd.addSubCommand(cmd);
          j -= 1;
        }
      }
    }
    const cmd = deleteLayerByName(layersToBeMerged[i]);
    if (cmd) batchCmd.addSubCommand(cmd);
  }
  svgCanvas.updateLayerColor(baseLayer);
  return batchCmd;
};

export const mergeLayers = async (
  layerNames: string[],
  baseLayerName?: string
): Promise<string | null> => {
  svgCanvas.clearSelection();
  const batchCmd = new history.BatchCommand('Merge Layer(s)');
  const drawing = svgCanvas.getCurrentDrawing();
  sortLayerNamesByPosition(layerNames);
  const mergeBase = baseLayerName || layerNames[0];
  const baseLayerIndex = layerNames.findIndex((layerName) => layerName === mergeBase);
  const res = await showMergeAlert(mergeBase, layerNames);
  if (!res) return null;
  let cmd = mergeLayer(mergeBase, layerNames.slice(0, baseLayerIndex), true);
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }
  cmd = mergeLayer(mergeBase, layerNames.slice(baseLayerIndex + 1), false);
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }

  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  drawing.identifyLayers();
  return mergeBase;
};

// pos  : 0 - 1 - 2 - 3 - 4 - 5 - 6
// array: | 0 | 1 | 2 | 3 | 4 | 5 |
// use insertBefore node[pos], so moving from i to pos i or i+1 means nothing.
export const moveLayerToPosition = (
  layerName: string,
  newPosition: number
): { success: boolean; cmd?: ICommand } => {
  const allLayers = document.querySelectorAll('g.layer');
  let layer = null as Element;
  let currentPosition = null;
  for (let i = 0; i < allLayers.length; i += 1) {
    const title = allLayers[i].querySelector('title');
    if (title && title.textContent === layerName) {
      currentPosition = i;
      layer = allLayers[i];
      break;
    }
  }
  if (!layer) {
    // console.error('Layer not exist');
    return { success: false };
  }
  if (newPosition < 0 || newPosition > allLayers.length) {
    // console.error('Position out of range');
    return { success: false };
  }
  if (newPosition === currentPosition || newPosition === currentPosition + 1) {
    return { success: true, cmd: null };
  }
  const anchorLayer = allLayers[newPosition]; // undefined if newPosition === allLayers.length
  const { nextSibling } = layer;
  const parent = layer.parentNode;
  if (anchorLayer) {
    parent.insertBefore(layer, anchorLayer);
  } else {
    parent.appendChild(layer);
  }
  return { success: true, cmd: new history.MoveElementCommand(layer, nextSibling, parent) };
};

const insertLayerBefore = (layerName: string, anchorLayerName: string) => {
  const layer = getLayerElementByName(layerName);
  const anchorLayer = getLayerElementByName(anchorLayerName);
  if (layer && anchorLayer) {
    const { nextSibling } = layer;
    const parent = layer.parentNode;
    parent.insertBefore(layer, anchorLayer);
    const cmd = new history.MoveElementCommand(layer, nextSibling, parent);
    return { success: true, cmd };
  }
  return { success: false };
};

export const moveLayersToPosition = (layerNames: string[], newPosition: number): void => {
  const batchCmd = new history.BatchCommand('Move Layer(s)');
  const drawing = svgCanvas.getCurrentDrawing();
  const currentLayerName = drawing.getCurrentLayerName();
  sortLayerNamesByPosition(layerNames);
  let lastLayerName = null;
  for (let i = layerNames.length - 1; i >= 0; i -= 1) {
    let res = null;
    if (!lastLayerName) {
      res = moveLayerToPosition(layerNames[i], newPosition);
    } else {
      res = insertLayerBefore(layerNames[i], lastLayerName);
    }
    if (res.success) {
      if (res.cmd) {
        batchCmd.addSubCommand(res.cmd);
      }
      lastLayerName = layerNames[i];
    }
  }
  if (!batchCmd.isEmpty()) {
    drawing.identifyLayers();
    drawing.setCurrentLayer(currentLayerName);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
};

export const highlightLayer = (layerName?: string): void => {
  let i: number;
  const curNames = [];
  const numLayers = svgCanvas.getCurrentDrawing().getNumLayers();
  for (i = 0; i < numLayers; i += 1) {
    curNames[i] = svgCanvas.getCurrentDrawing().getLayerName(i);
  }

  if (layerName) {
    for (i = 0; i < numLayers; i += 1) {
      if (curNames[i] !== layerName) {
        svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 0.5);
      }
    }
  } else {
    for (i = 0; i < numLayers; i += 1) {
      svgCanvas.getCurrentDrawing().setLayerOpacity(curNames[i], 1.0);
    }
  }
};

export const getCurrentLayerName = (): string => {
  const drawing = svgCanvas.getCurrentDrawing();
  return drawing.getCurrentLayerName();
};

export const getLayerByName = (layerName: string): SVGGElement => {
  const drawing = svgCanvas.getCurrentDrawing();
  return drawing.getLayerByName(layerName);
};

export const moveToOtherLayer = (
  destLayer: string,
  callback: () => void,
  showAlert = true
): void => {
  const moveToLayer = (ok) => {
    if (!ok) return;
    moveSelectedToLayer(destLayer);
    svgCanvas.getCurrentDrawing().setCurrentLayer(destLayer);
    LayerPanelController.setSelectedLayers([destLayer]);
    callback?.();
  };
  const selectedElements = svgCanvas.getSelectedElems();
  const origLayer = getObjectLayer(selectedElements[0])?.elem;
  const isPrintingLayer = getData<LayerModule>(origLayer, DataType.module) === LayerModule.PRINTER;
  const isDestPrintingLayer =
    getData<LayerModule>(getLayerByName(destLayer), DataType.module) === LayerModule.PRINTER;
  const moveOutFromFullColorLayer = isPrintingLayer && !isDestPrintingLayer;
  const moveInToFullColorLayer = !isPrintingLayer && isDestPrintingLayer;
  if (showAlert || moveOutFromFullColorLayer || moveInToFullColorLayer) {
    Alert.popUp({
      id: 'move layer',
      buttonType:
        moveOutFromFullColorLayer || moveInToFullColorLayer
          ? AlertConstants.CONFIRM_CANCEL
          : AlertConstants.YES_NO,
      // TODO: add translation
      // eslint-disable-next-line no-nested-ternary
      caption: moveOutFromFullColorLayer
        ? sprintf(LANG.notification.moveElemFromPrintingLayerTitle, destLayer)
        : moveInToFullColorLayer
        ? sprintf(LANG.notification.moveElemToPrintingLayerTitle, destLayer)
        : undefined,
      // eslint-disable-next-line no-nested-ternary
      message: moveOutFromFullColorLayer
        ? LANG.notification.moveElemFromPrintingLayerMsg
        : moveInToFullColorLayer
        ? LANG.notification.moveElemToPrintingLayerMsg
        : sprintf(LANG.notification.QmoveElemsToLayer, destLayer),
      messageIcon: 'notice',
      onYes: moveToLayer,
      onConfirm: () => moveToLayer(true),
    });
  } else {
    moveToLayer(true);
  }
};
