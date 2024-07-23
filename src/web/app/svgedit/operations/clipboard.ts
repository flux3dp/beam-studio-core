/* eslint-disable no-console */
import findDefs from 'app/svgedit/utils/findDef';
import history from 'app/svgedit/history/history';
import selector from 'app/svgedit/selector';
import symbolMaker from 'helpers/symbol-maker';
import updateElementColor from 'helpers/color/updateElementColor';
import workareaManager from 'app/svgedit/workarea';
import { deleteElements } from 'app/svgedit/operations/delete';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveElements, moveSelectedElements } from 'app/svgedit/operations/move';
import { IBatchCommand } from 'interfaces/IHistory';

interface ClipboardElement {
  namespaceURI: string;
  nodeName: string;
  innerHTML: string;
  childNodes: ClipboardElement[];
  nodeType: number;
  nodeValue: string;
  dataGSVG?: string;
  dataSymbol?: string;
  attributes: {
    namespaceURI: string;
    nodeName: string;
    value: string;
  }[];
}

const serializeElement = (el: Element) => {
  const { namespaceURI, nodeName, innerHTML, nodeType, nodeValue } = el;
  const result: ClipboardElement = {
    namespaceURI,
    nodeName,
    innerHTML,
    nodeType,
    nodeValue,
    childNodes: [],
    attributes: [],
  };
  for (let i = 0; i < el.attributes?.length; i += 1) {
    const att = el.attributes[i];
    result.attributes.push({
      namespaceURI: att.namespaceURI,
      nodeName: att.nodeName,
      value: att.value,
    });
  }
  el.childNodes?.forEach((node) => {
    result.childNodes.push(serializeElement(node as Element));
  });
  return result;
};

// TODO: decouple with svgcanvas
const { svgedit } = window;

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

let clipboard: Element[];
let refClipboard: { [useId: string]: Element } = {};

export const addRefToClipboard = (useElement: SVGUseElement): void => {
  const symbolId = svgedit.utilities.getHref(useElement);
  let symbolElement = document.querySelector(symbolId);
  symbolElement =
    document.getElementById(symbolElement?.getAttribute('data-origin-symbol')) || symbolElement;
  if (symbolElement) refClipboard[symbolId] = symbolElement;
};

const copyElements = async (
  elems: Element[],
  opts: { nativeClipBoard?: boolean } = { nativeClipBoard: true }
): Promise<void> => {
  const layerNames = new Set<string>();
  const serializedData = { elements: [], refs: {} };
  let layerCount = 0;
  refClipboard = {};
  for (let i = 0; i < elems.length; i += 1) {
    const elem = elems[i];
    const layerName = $(elem.parentNode).find('title').text();
    elem.setAttribute('data-origin-layer', layerName);
    if (elem.tagName === 'use') addRefToClipboard(elem as SVGUseElement);
    else
      Array.from(elem.querySelectorAll('use')).forEach((use: SVGUseElement) =>
        addRefToClipboard(use)
      );
    if (!layerNames.has(layerName)) {
      layerNames.add(layerName);
      layerCount += 1;
    }
  }

  // If there is only one layer selected, don't force user to paste on the same layer
  if (layerCount === 1) elems.forEach((elem) => elem?.removeAttribute('data-origin-layer'));
  elems.forEach((elem) => serializedData.elements.push(serializeElement(elem)));
  const keys = Object.keys(refClipboard);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    serializedData.refs[key] = serializeElement(refClipboard[key]);
  }
  clipboard = [...elems];
  const { nativeClipBoard } = opts;
  try {
    const clipBoardText = JSON.stringify(serializedData);
    if (nativeClipBoard) await navigator.clipboard.writeText(`BX clip:${clipBoardText}`);
    // console.log('Write to clipboard was successful!', clipBoardText);
  } catch (err) {
    console.error('Async: Could not copy text: ', err);
  }
};

const copySelectedElements = async (): Promise<void> => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  await copyElements(selectedElems);
  svgCanvas.tempGroupSelectedElements();
};

const cutElements = async (elems: Element[]): Promise<void> => {
  const batchCmd = new history.BatchCommand('Cut Elements');
  await copyElements(elems);
  const cmd = deleteElements(elems, true);
  if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
  if (!batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
};

const cutSelectedElements = async (): Promise<void> => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  await cutElements(selectedElems);
};

const updateSymbolStyle = (symbol: SVGSymbolElement, oldId: string) => {
  const styles = symbol.querySelectorAll('style, STYLE');
  for (let i = 0; i < styles.length; i += 1) {
    const style = styles[i];
    const { textContent } = style;
    const newContent = textContent.replace(RegExp(oldId, 'g'), symbol.id);
    style.textContent = newContent;
  }
};

const applyNativeClipboard = async () => {
  const clipboardData = await navigator.clipboard.readText();
  if (!clipboardData.startsWith('BX clip:')) return;
  const drawing = svgCanvas.getCurrentDrawing();
  const data = JSON.parse(clipboardData.substring(8));
  const { elements, refs } = data;
  refClipboard = {};
  const keys = Object.keys(refs);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const symbolElemData = refs[key];
    const id = symbolElemData.attributes.find((attr) => attr.nodeName === 'id')?.value;
    const newSymbol = drawing.copyElemData(symbolElemData);
    updateSymbolStyle(newSymbol, id);
    refClipboard[key] = newSymbol;
  }
  const newClipBoard = [];
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];
    newClipBoard.push(drawing.copyElemData(element));
  }
};

const pasteRef = async (
  useElement: SVGUseElement,
  opts?: {
    parentCmd?: IBatchCommand;
    addToHistory?: boolean;
  }
): Promise<void> => {
  const { parentCmd, addToHistory = true } = opts || {};
  const batchCmd = new history.BatchCommand('Paste Ref');
  const drawing = svgCanvas.getCurrentDrawing();
  const symbolId = svgedit.utilities.getHref(useElement);
  const refElement = refClipboard[symbolId];
  const copiedRef = refElement.cloneNode(true) as SVGSymbolElement;
  copiedRef.id = drawing.getNextId();
  copiedRef.setAttribute('data-image-symbol', `${copiedRef.id}_image`);
  updateSymbolStyle(copiedRef, refElement.id);
  const defs = findDefs();
  defs.appendChild(copiedRef);
  batchCmd.addSubCommand(new history.InsertElementCommand(copiedRef));
  svgedit.utilities.setHref(useElement, `#${copiedRef.id}`);
  const imageSymbol = symbolMaker.createImageSymbol(copiedRef);
  batchCmd.addSubCommand(new history.InsertElementCommand(imageSymbol));
  if (parentCmd) {
    parentCmd.addSubCommand(batchCmd);
  } else if (addToHistory) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  await symbolMaker.reRenderImageSymbol(useElement);
  updateElementColor(useElement);
};

export const handlePastedRef = async (
  copy: Element,
  opts: { parentCmd?: IBatchCommand } = {}
): Promise<void> => {
  const promises: Promise<void>[] = [];
  const uses = Array.from(copy.querySelectorAll('use'));
  if (copy.tagName === 'use') uses.push(copy as SVGUseElement);
  uses.forEach((use: SVGUseElement) => {
    addRefToClipboard(use);
    promises.push(pasteRef(use, { parentCmd: opts?.parentCmd }));
  });

  const passThroughObjects = Array.from(copy.querySelectorAll('[data-pass-through]'));
  if (copy.getAttribute('data-pass-through')) passThroughObjects.push(copy);
  passThroughObjects.forEach((element: SVGGElement) => {
    const clipPath = element.querySelector(':scope > clipPath');
    if (clipPath) {
      element.childNodes.forEach((child: SVGGraphicsElement) => {
        if (child.getAttribute('clip-path')?.startsWith('url')) {
          child.setAttribute('clip-path', `url(#${clipPath.id})`);
        }
      });
    }
  });
  const textPathGroups = Array.from(copy.querySelectorAll('[data-textpath-g="1"]'));
  if (copy.getAttribute('data-textpath-g') === '1') textPathGroups.push(copy);
  textPathGroups.forEach((element: SVGGElement) => {
    const newTextPath = element.querySelector('textPath');
    const newPath = element.querySelector('path');
    newTextPath?.setAttribute('href', `#${newPath?.id}`);
  });

  await Promise.allSettled(promises);
};

const pasteElements = (args: {
  type: 'mouse' | 'in_place' | 'point';
  x?: number;
  y?: number;
  isSubCmd: boolean;
  selectElement?: boolean;
}): { cmd: IBatchCommand; elems: Element[] } | null => {
  const { type, x, y, isSubCmd = false, selectElement = true } = args || {};
  if (!clipboard || !clipboard.length) return null;

  const pasted = [];
  const batchCmd = new history.BatchCommand('Paste elements');
  const drawing = svgCanvas.getCurrentDrawing();

  // Move elements to lastClickPoint
  for (let i = 0; i < clipboard.length; i += 1) {
    const elem = clipboard[i];
    if (!elem) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const copy = drawing.copyElem(elem);

    // See if elem with elem ID is in the DOM already
    if (!svgedit.utilities.getElem(elem.id)) {
      copy.id = elem.id;
    }

    pasted.push(copy);
    if (copy.getAttribute('data-origin-layer') && clipboard.length > 1) {
      const layer =
        drawing.getLayerByName(copy.getAttribute('data-origin-layer')) || drawing.getCurrentLayer();
      layer.appendChild(copy);
    } else {
      drawing.getCurrentLayer().appendChild(copy);
    }

    const promise = handlePastedRef(copy);

    batchCmd.addSubCommand(new history.InsertElementCommand(copy));
    svgCanvas.restoreRefElems(copy);
    promise.then(() => {
      updateElementColor(copy);
    });
  }

  if (selectElement) svgCanvas.selectOnly(pasted, true);

  if (type !== 'in_place') {
    let ctrX: number;
    let ctrY: number;

    if (type === 'mouse') {
      const lastClickPoint = svgCanvas.getLastClickPoint();
      ctrX = lastClickPoint.x;
      ctrY = lastClickPoint.y;
    } else if (type === 'point') {
      ctrX = x;
      ctrY = y;
    }

    const bbox = svgCanvas.getStrokedBBox(pasted);
    const cx = ctrX - (bbox.x + bbox.width / 2);
    const cy = ctrY - (bbox.y + bbox.height / 2);
    const dx = [];
    const dy = [];

    pasted.forEach(() => {
      dx.push(cx);
      dy.push(cy);
    });

    const cmd = moveElements(dx, dy, pasted, false, true);
    batchCmd.addSubCommand(cmd);
  }

  if (!isSubCmd) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    svgCanvas.call('changed', pasted);
  }
  if (selectElement) {
    if (pasted.length === 1) {
      const selectorManager = selector.getSelectorManager();
      selectorManager.requestSelector(pasted[0]).resize();
    } else svgCanvas.tempGroupSelectedElements();
  }
  return { cmd: batchCmd, elems: pasted };
};

/**
 * Create deep DOM copies (clones) of all selected elements
 * @param dx dx of the cloned elements
 * @param dy dy of the cloned elements
 */
const cloneElements = (
  elements: Element[],
  dx: number | number[],
  dy: number | number[],
  opts: { parentCmd?: IBatchCommand; addToHistory?: boolean; selectElement?: boolean } = {
    addToHistory: true,
    selectElement: true,
  }
): { cmd: IBatchCommand; elems: Element[] } | null => {
  const { parentCmd, addToHistory, selectElement } = opts;
  const originalClipboard = clipboard ? [...clipboard] : null;
  const batchCmd = new history.BatchCommand('Clone elements');
  copyElements(elements, { nativeClipBoard: false });
  const pasteRes = pasteElements({
    type: 'in_place',
    x: null,
    y: null,
    isSubCmd: true,
    selectElement,
  });
  if (!pasteRes) return null;
  const { elems } = pasteRes;
  let { cmd } = pasteRes;
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }
  cmd = moveElements(dx, dy, elems, false);
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }
  if (!batchCmd.isEmpty()) {
    if (parentCmd) parentCmd.addSubCommand(batchCmd);
    else if (addToHistory) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  clipboard = originalClipboard;
  return { cmd: batchCmd, elems };
};

/**
 * Create deep DOM copies (clones) of all selected elements
 * @param dx dx of the cloned elements
 * @param dy dy of the cloned elements
 */
const cloneSelectedElements = (
  dx: number | number[],
  dy: number | number[],
  opts: { parentCmd?: IBatchCommand; addToHistory?: boolean; selectElement?: boolean } = {
    addToHistory: true,
    selectElement: true,
  }
): { cmd: IBatchCommand; elems: Element[] } | null => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  const res = cloneElements(selectedElems, dx, dy, opts);
  svgCanvas.tempGroupSelectedElements();
  return res;
};

const pasteFromNativeClipboard = async (
  type: 'mouse' | 'in_place' | 'point',
  x?: number,
  y?: number,
  isSubCmd = false
): Promise<{ cmd: IBatchCommand; elems: Element[] } | null> => {
  if (clipboard?.length) {
    return pasteElements({ type, x, y, isSubCmd });
  }
  await applyNativeClipboard();
  if (!clipboard?.length) return null;
  return pasteElements({ type, x, y, isSubCmd });
};

const pasteInCenter = async (): Promise<{ cmd: IBatchCommand; elems: Element[] } | null> => {
  const zoom = workareaManager.zoomRatio;
  const workarea = document.getElementById('workarea');
  const x = (workarea.scrollLeft + workarea.clientWidth / 2) / zoom - workareaManager.width;
  const y = (workarea.scrollTop + workarea.clientHeight / 2) / zoom - workareaManager.height;
  return pasteFromNativeClipboard('point', x, y);
};

const generateSelectedElementArray = (
  interval: { dx: number; dy: number },
  arraySize: { row: number; column: number }
): IBatchCommand => {
  const originalClipboard = clipboard ? [...clipboard] : null;
  const batchCmd = new history.BatchCommand('Grid elements');
  copySelectedElements();
  const arrayElements = [...svgCanvas.getSelectedWithoutTempGroup()];
  for (let i = 0; i < arraySize.column; i += 1) {
    for (let j = 0; j < arraySize.row; j += 1) {
      if (i !== 0 || j !== 0) {
        const pasteRes = pasteElements({ type: 'in_place', isSubCmd: true, selectElement: false });
        // eslint-disable-next-line no-continue
        if (!pasteRes) continue;
        const { cmd: pasteCmd, elems } = pasteRes;
        arrayElements.push(...elems);
        if (pasteCmd && !pasteCmd.isEmpty()) batchCmd.addSubCommand(pasteCmd);
        const dx = Array(elems.length).fill(i * interval.dx);
        const dy = Array(elems.length).fill(j * interval.dy);
        const moveCmd = moveElements(dx, dy, elems, false, true);
        if (moveCmd && !moveCmd.isEmpty()) batchCmd.addSubCommand(moveCmd);
      }
    }
  }
  svgCanvas.multiSelect(arrayElements);
  clipboard = originalClipboard;
  if (!batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  return null;
};

const getCurrentClipboard = (): boolean => clipboard && clipboard.length > 0;

export default {
  addRefToClipboard,
  copyElements,
  copySelectedElements,
  cutElements,
  cutSelectedElements,
  pasteElements: pasteFromNativeClipboard,
  pasteInCenter,
  pasteRef,
  cloneElements,
  cloneSelectedElements,
  generateSelectedElementArray,
  getCurrentClipboard,
  handlePastedRef,
};
