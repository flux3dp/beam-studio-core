/* eslint-disable no-console */
import history from 'app/svgedit/history';
import selector from 'app/svgedit/selector';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveSelectedElements } from 'app/svgedit/operations/move';

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
    }
  }
  try {
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
      }
    }
  }
  try {
    await navigator.clipboard.writeText(clipBoardText);
    console.log('Write to clipboard was successful!', clipBoardText);
  } catch (err) {
    console.error('Async: Could not copy text: ', err);
  }
  clipboard = [...elems];
};

const copySelectedElements = async (): Promise<void> => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  await copyElements(selectedElems);
  svgCanvas.tempGroupSelectedElements();
};

const pasteElements = (
  type: 'mouse' | 'in_place' | 'point',
  x?: number,
  y?: number,
): void => {
  if (!clipboard || !clipboard.length) {
    return;
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

  svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  svgCanvas.call('changed', pasted);
  svgCanvas.tempGroupSelectedElements();
};

const getCurrentClipboard = (): boolean => (clipboard && clipboard.length > 0);

export default {
  copyElements,
  copySelectedElements,
  cutElements,
  cutSelectedElements,
  pasteElements,
  getCurrentClipboard,
};
