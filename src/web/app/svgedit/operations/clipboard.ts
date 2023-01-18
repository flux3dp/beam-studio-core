/* eslint-disable no-console */
import history from 'app/svgedit/history';
import selector from 'app/svgedit/selector';
import symbolMaker from 'helpers/symbol-maker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveSelectedElements } from 'app/svgedit/operations/move';
import { IBatchCommand } from 'interfaces/IHistory';

interface ClipboardElement {
  namespaceURI: string;
  nodeName: string;
  innerHTML: string;
  childNodes: ClipboardElement[];
  nodeType: number;
  nodeValue: string;
  dataGSVG?: string,
  dataSymbol?: string,
  attributes: {
    namespaceURI: string,
    nodeName: string,
    value: string,
  }[];
}

const serializeElement = (el: Element) => {
  const {
    namespaceURI, nodeName, innerHTML, nodeType, nodeValue,
  } = el;
  const result: ClipboardElement = {
    namespaceURI,
    nodeName,
    innerHTML,
    nodeType,
    nodeValue,
    dataGSVG: $.data(el, 'gsvg'),
    dataSymbol: $.data(el, 'symbol'),
    childNodes: [],
    attributes: [],
  };
  for (let i = 0; i < el.attributes.length; i += 1) {
    const att = el.attributes[i];
    result.attributes.push({
      namespaceURI: att.namespaceURI,
      nodeName: att.nodeName,
      value: att.value,
    });
  }
  el.childNodes.forEach((node) => {
    result.childNodes.push(serializeElement(node as Element));
  });
  return result;
};

// TODO: decouple with svgcanvas

const { svgedit } = window;

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

let clipboard;

const cutElements = async (elems: Element[]): Promise<void> => {
  const selectorManager = selector.getSelectorManager();
  const batchCmd = new history.BatchCommand('Cut Elements');
  const len = elems.length;
  const selectedCopy = []; // elems is being deleted
  const serializedData = [];
  const layerDict = {};
  let layerCount = 0;
  let clipBoardText = 'BS Cut: ';

  for (let i = 0; i < len && elems[i]; i += 1) {
    const elem = elems[i];

    const layerName = $(elem.parentNode).find('title').text();
    elem.setAttribute('data-origin-layer', layerName);

    clipBoardText += `${elem.getAttribute('id')}, `;
    if (!layerDict[layerName]) {
      layerDict[layerName] = true;
      layerCount += 1;
    }

    // this will unselect the element and remove the selectedOutline
    selectorManager.releaseSelector(elem);

    // Remove the path if present.
    // eslint-disable-next-line no-underscore-dangle
    svgedit.path.removePath_(elem.id);

    const { nextSibling } = elem;
    const parent = elem.parentNode;
    parent.removeChild(elem);
    selectedCopy.push(elem); // for the copy
    batchCmd.addSubCommand(new history.RemoveElementCommand(elem, nextSibling, parent));
  }

  // If there is only one layer selected, don't force user to paste on the same layer
  if (layerCount === 1) {
    for (let i = 0; i < selectedCopy.length; i += 1) {
      selectedCopy[i].removeAttribute('data-origin-layer');
      serializedData.push(serializeElement(selectedCopy[i]));
    }
  }
  try {
    clipBoardText = JSON.stringify(serializedData);
    await navigator.clipboard.writeText(clipBoardText);
    console.log('Write to clipboard was successful!', clipBoardText);
  } catch (err) {
    console.error('Async: Could not copy text: ', err);
  }

  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  svgCanvas.call('changed', selectedCopy);
  svgCanvas.clearSelection();

  clipboard = selectedCopy;
};

const cutSelectedElements = async (): Promise<void> => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  await cutElements(selectedElems);
};

const copyElements = async (elems: Element[]): Promise<void> => {
  const layerDict = {};
  const serializedData = [];
  let layerCount = 0;
  let clipBoardText = 'BS Copy: ';
  for (let i = 0; i < elems.length && elems[i]; i += 1) {
    const elem = elems[i];
    const layerName = $(elem.parentNode).find('title').text();
    elem.setAttribute('data-origin-layer', layerName);
    clipBoardText += `${elem.getAttribute('id')}, `;
    if (!layerDict[layerName]) {
      layerDict[layerName] = true;
      layerCount += 1;
    }
  }

  // If there is only one layer selected, don't force user to paste on the same layer
  if (layerCount === 1) {
    for (let i = 0; i < elems.length; i += 1) {
      if (elems[i]) {
        elems[i].removeAttribute('data-origin-layer');
        serializedData.push(serializeElement(elems[i]));
      }
    }
  }
  clipboard = [...elems];
  try {
    clipBoardText = JSON.stringify(serializedData);
    await navigator.clipboard.writeText(clipBoardText);
    console.log('Write to clipboard was successful!', clipBoardText);
  } catch (err) {
    console.error('Async: Could not copy text: ', err);
  }
};

const copySelectedElements = async (): Promise<void> => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  await copyElements(selectedElems);
  svgCanvas.tempGroupSelectedElements();
};

const copyRef = (useElement: SVGUseElement) => {
  const updateSymbolStyle = (symbol: SVGSymbolElement, oldId: string) => {
    const styles = symbol.querySelectorAll('style');
    for (let i = 0; i < styles.length; i += 1) {
      const style = styles[i];
      const { textContent } = style;
      const newContent = textContent.replace(RegExp(oldId, 'g'), symbol.id);
      style.textContent = newContent;
    }
  };

  const drawing = svgCanvas.getCurrentDrawing();
  const refId = svgCanvas.getHref(useElement);
  const refElement = document.querySelector(refId);
  const copiedRef: SVGSymbolElement = refElement.cloneNode(true);
  refElement.parentNode.appendChild(copiedRef);
  const originalSymbolId = copiedRef.getAttribute('data-origin-symbol');
  const imageSymbolId = copiedRef.getAttribute('data-image-symbol');
  if (originalSymbolId && document.getElementById(originalSymbolId)) {
    // copied ref is image symbol, need to copy original symbol as well
    const originalSymbol = document.getElementById(originalSymbolId);
    const copiedOriginalSymbol = originalSymbol.cloneNode(true) as SVGSymbolElement;
    originalSymbol.parentNode.appendChild(copiedOriginalSymbol);
    copiedOriginalSymbol.id = drawing.getNextId();
    updateSymbolStyle(copiedOriginalSymbol, originalSymbol.id);
    copiedRef.id = `${copiedOriginalSymbol.id}_image`;
    copiedRef.setAttribute('data-origin-symbol', copiedOriginalSymbol.id);
    copiedOriginalSymbol.setAttribute('data-image-symbol', copiedRef.id);
  } else if (imageSymbolId && document.getElementById(imageSymbolId)) {
    // copied ref is origin symbol, need to copy image symbol as well
    const imageSymbol = document.getElementById(imageSymbolId);
    const copiedImageSymbol = imageSymbol.cloneNode(true) as Element;
    imageSymbol.parentNode.appendChild(copiedImageSymbol);
    copiedRef.id = drawing.getNextId();
    updateSymbolStyle(copiedRef, refId);
    copiedImageSymbol.id = `${copiedRef.id}_image`;
    copiedRef.setAttribute('data-image-symbol', copiedImageSymbol.id);
    copiedImageSymbol.setAttribute('data-origin-symbol', copiedRef.id);
  } else {
    copiedRef.id = drawing.getNextId();
    updateSymbolStyle(copiedRef, refId);
  }
  svgedit.utilities.setHref(useElement, `#${copiedRef.id}`);
  symbolMaker.reRenderImageSymbol(useElement);
};

const pasteElements = (
  type: 'mouse' | 'in_place' | 'point',
  x?: number,
  y?: number,
  isSubCmd = false,
): { cmd: IBatchCommand, elems: Element[] } => {
  if (!clipboard || !clipboard.length) {
    return null;
  }

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
      const layer = drawing.getLayerByName(copy.getAttribute('data-origin-layer'))
        || drawing.getCurrentLayer();
      layer.appendChild(copy);
    } else {
      drawing.getCurrentLayer().appendChild(copy);
    }

    if (copy.getAttribute('data-textpath-g') === '1') {
      const newTextPath = copy.querySelector('textPath');
      const newPath = copy.querySelector('path');
      newTextPath?.setAttribute('href', `#${newPath?.id}`);
    }
    if (copy.tagName === 'use') copyRef(copy);
    else Array.from(copy.querySelectorAll('use')).forEach((use: SVGUseElement) => copyRef(use));

    batchCmd.addSubCommand(new history.InsertElementCommand(copy));
    svgCanvas.restoreRefElems(copy);
    svgCanvas.updateElementColor(copy);
  }

  svgCanvas.selectOnly(pasted, true);

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

    const cmd = moveSelectedElements(dx, dy, false);
    batchCmd.addSubCommand(cmd);
  }

  if (!isSubCmd) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    svgCanvas.call('changed', pasted);
  }
  svgCanvas.tempGroupSelectedElements();
  return { cmd: batchCmd, elems: pasted };
};

/**
 * Create deep DOM copies (clones) of all selected elements
 * @param dx dx of the cloned elements
 * @param dy dy of the cloned elements
 */
const cloneSelectedElements = (dx: number, dy: number, isSubCmd = false): IBatchCommand => {
  const originalClipboard = clipboard ? [...clipboard] : null;
  const batchCmd = new history.BatchCommand('Clone elements');
  copySelectedElements();
  let { cmd } = pasteElements('in_place', null, null, true);
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }
  cmd = moveSelectedElements(dx, dy, false);
  if (cmd && !cmd.isEmpty()) {
    batchCmd.addSubCommand(cmd);
  }
  if (!isSubCmd && !batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    return null;
  }
  clipboard = originalClipboard;
  return batchCmd;
};

const pasteFromNativeClipboard = async (
  type: 'mouse' | 'in_place' | 'point',
  x?: number,
  y?: number,
  isSubCmd = false,
): Promise<{ cmd: IBatchCommand, elems: Element[] }> => {
  if (clipboard?.length) {
    return pasteElements(type, x, y, isSubCmd);
  }
  const pasted = [];
  const batchCmd = new history.BatchCommand('Paste elements');
  const drawing = svgCanvas.getCurrentDrawing();
  const clipText = await navigator.clipboard.readText();
  if (!clipText.startsWith('[{')) return;
  const deserializedData = JSON.parse(clipText);

  // Move elements to lastClickPoint
  for (let i = 0; i < deserializedData.length; i += 1) {
    const elemData = deserializedData[i];
    const copy = drawing.copyElemData(elemData);

    // See if elem with elem ID is in the DOM already
    if (!svgedit.utilities.getElem(elemData.id)) {
      copy.id = elemData.id;
    }

    pasted.push(copy);
    if (copy.getAttribute('data-origin-layer') && clipboard.length > 1) {
      const layer = drawing.getLayerByName(copy.getAttribute('data-origin-layer'))
        || drawing.getCurrentLayer();
      layer.appendChild(copy);
    } else {
      drawing.getCurrentLayer().appendChild(copy);
    }

    if (copy.getAttribute('data-textpath-g') === '1') {
      const newTextPath = copy.querySelector('textPath');
      const newPath = copy.querySelector('path');
      newTextPath?.setAttribute('href', `#${newPath?.id}`);
    }
    if (copy.tagName === 'use') copyRef(copy);
    else Array.from(copy.querySelectorAll('use')).forEach((use: SVGUseElement) => copyRef(use));

    batchCmd.addSubCommand(new history.InsertElementCommand(copy));
    svgCanvas.restoreRefElems(copy);
    svgCanvas.updateElementColor(copy);
  }

  svgCanvas.selectOnly(pasted, true);

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

    const cmd = moveSelectedElements(dx, dy, false);
    batchCmd.addSubCommand(cmd);
  }

  if (!isSubCmd) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    svgCanvas.call('changed', pasted);
  }
  svgCanvas.tempGroupSelectedElements();
  return { cmd: batchCmd, elems: pasted };
};

const generateSelectedElementArray = (
  interval: { dx: number, dy: number },
  arraySize: { row: number, column: number },
): IBatchCommand => {
  const originalClipboard = clipboard ? [...clipboard] : null;
  const batchCmd = new history.BatchCommand('Grid elements');
  copySelectedElements();
  const arrayElements = [...svgCanvas.getSelectedWithoutTempGroup()];
  for (let i = 0; i < arraySize.column; i += 1) {
    for (let j = 0; j < arraySize.row; j += 1) {
      if (i !== 0 || j !== 0) {
        const { cmd: pasteCmd, elems } = pasteElements('in_place', null, null, true);
        arrayElements.push(...elems);
        if (pasteCmd && !pasteCmd.isEmpty()) {
          batchCmd.addSubCommand(pasteCmd);
        }
        const moveCmd = moveSelectedElements([i * interval.dx], [j * interval.dy], false);
        if (moveCmd && !moveCmd.isEmpty()) {
          batchCmd.addSubCommand(moveCmd);
        }
      }
    }
  }
  svgCanvas.multiSelect(arrayElements);
  clipboard = originalClipboard;
  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    return null;
  }
  return batchCmd;
};

const getCurrentClipboard = (): boolean => (clipboard && clipboard.length > 0);

export default {
  copyElements,
  copySelectedElements,
  cutElements,
  cutSelectedElements,
  pasteElements: pasteFromNativeClipboard,
  cloneSelectedElements,
  generateSelectedElementArray,
  getCurrentClipboard,
};
