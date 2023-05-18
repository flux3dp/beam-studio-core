import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import { cloneLayerConfig } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand, ICommand } from 'interfaces/IHistory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ISVGDrawing from 'interfaces/ISVGDrawing';

const LANG = i18n.lang.beambox.right_panel.layer_panel;

let svgCanvas: ISVGCanvas;
let svgedit: ISVGDrawing;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

export function getObjectLayer(elem: SVGElement): { elem: SVGGElement, title: string } {
  let p: SVGElement = elem;
  while (p) {
    p = p.parentNode as SVGElement;
    if (p && p.getAttribute && p.getAttribute('class') && p.getAttribute('class').indexOf('layer') >= 0) {
      const title = $(p).find('title')[0];
      if (title) {
        return { elem: p as SVGGElement, title: title.innerHTML };
      }
    }
  }
  // When multi selecting, elements does not belong to any layer
  // So get layer from data original layer
  const origLayer = elem.getAttribute('data-original-layer');
  if (origLayer) {
    const drawing = svgCanvas.getCurrentDrawing();
    const layer = drawing.getLayerByName(origLayer);
    if (layer) {
      return { elem: layer, title: origLayer };
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
    const newLayer = new svgedit.draw.Layer(LANG.layer1, null, svgcontent, '#333333').getGroup() as Element;
    batchCmd.addSubCommand(new history.InsertElementCommand(newLayer));
  }
  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  drawing.identifyLayers();
  svgCanvas.clearSelection();
};

export const cloneLayer = (layerName: string, isSub = false): { name: string; cmd: ICommand } | null => {
  const layer = getLayerElementByName(layerName);
  if (!layer) return null;

  const drawing = svgCanvas.getCurrentDrawing();
  const color = layer.getAttribute('data-color') || '#333';
  const svgcontent = document.getElementById('svgcontent');
  const baseName = `${layerName} copy`;
  let newName = baseName;
  let j = 0;
  while (drawing.hasLayer(newName)) {
    j += 1;
    newName = `${baseName} ${j}`;
  }
  const newLayer = new svgedit.draw.Layer(newName, null, svgcontent, color).getGroup();
  const children = layer.childNodes;
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i] as Element;
    if (child.tagName !== 'title') {
      const copiedElem = drawing.copyElem(child);
      newLayer.appendChild(copiedElem);
    }
  }
  cloneLayerConfig(newName, layerName);
  const cmd = new history.InsertElementCommand(newLayer);
  if (!isSub) {
    svgCanvas.undoMgr.addCommandToHistory(cmd);
    drawing.identifyLayers();
    svgCanvas.clearSelection();
  }
  return { name: newName, cmd };
};

export const cloneLayers = (layerNames: string[]): string[] => {
  sortLayerNamesByPosition(layerNames);
  const clonedLayerNames: string[] = [];
  const drawing = svgCanvas.getCurrentDrawing();
  const batchCmd = new history.BatchCommand('Clone Layer(s)');
  for (let i = 0; i < layerNames.length; i += 1) {
    const res = cloneLayer(layerNames[i], true);
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

const mergeLayer = (
  baseLayerName: string,
  layersToBeMerged: string[],
  shouldInsertBefore: boolean,
) : IBatchCommand | null => {
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

export const mergeLayers = (layerNames: string[], baseLayerName?: string): string => {
  svgCanvas.clearSelection();
  const batchCmd = new history.BatchCommand('Merge Layer(s)');
  const drawing = svgCanvas.getCurrentDrawing();
  sortLayerNamesByPosition(layerNames);
  const mergeBase = baseLayerName || layerNames[0];
  const baseLayerIndex = layerNames.findIndex(((layerName) => layerName === mergeBase));

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
  newPosition: number,
): { success: boolean, cmd?: ICommand } => {
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

export const getCurrentLayerName = () => {
  const drawing = svgCanvas.getCurrentDrawing();
  return drawing.getCurrentLayerName();
};

export const getLayerByName = (layerName: string) => {
  const drawing = svgCanvas.getCurrentDrawing();
  return drawing.getLayerByName(layerName);
};
