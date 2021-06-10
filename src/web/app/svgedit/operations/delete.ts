import history from 'app/svgedit/history';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';

const { svgedit } = window;

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

export const deleteElements = (elems: Element[], isSub = false): IBatchCommand => {
  const selectorManager = svgedit.select.getSelectorManager();
  const batchCmd = new history.BatchCommand('Delete Elements');
  const deletedElems = [];
  for (let i = 0; i < elems.length; i += 1) {
    const elem = elems[i];
    if (!elem) {
      break;
    }

    // this will unselect the element and remove the selectedOutline
    selectorManager.releaseSelector(elem);
    // Remove the path if present.
    // eslint-disable-next-line no-underscore-dangle
    svgedit.path.removePath_(elem.id);

    let parent = elem.parentNode as Element;
    let elemToRemove = elem;

    // Get the parent if it's a single-child anchor
    if (parent.tagName === 'a' && parent.childNodes.length === 1) {
      elemToRemove = parent;
      parent = parent.parentNode as Element;
    }

    let { nextSibling } = elemToRemove;
    if (parent == null) {
      console.log('The element has no parent', elem);
    } else {
      parent.removeChild(elemToRemove);
      deletedElems.push(elem); // for the copy
      batchCmd.addSubCommand(new history.RemoveElementCommand(elemToRemove, nextSibling, parent));
    }
    if (elem.tagName === 'use') {
      const refId = svgCanvas.getHref(elem);
      console.log(refId);
      const svgcontent = document.getElementById('svgcontent');
      const useElems = svgcontent.getElementsByTagName('use');
      let shouldDeleteRef = true;
      for (let j = 0; j < useElems.length; j += 1) {
        if (refId === svgCanvas.getHref(useElems[j])) {
          shouldDeleteRef = false;
          break;
        }
      }
      if (shouldDeleteRef) {
        const ref = $(svgCanvas.getHref(elem)).toArray()[0];
        if (ref) {
          parent = ref.parentNode;
          nextSibling = ref.nextSibling;
          parent.removeChild(ref);
          deletedElems.push(ref); // for the copy
          batchCmd.addSubCommand(new history.RemoveElementCommand(ref, nextSibling, parent));
        }
      }
    }
  }
  if (!batchCmd.isEmpty() && !isSub) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
  svgCanvas.call('changed', deletedElems);
  svgCanvas.clearSelection();

  return batchCmd;
};

export const deleteSelectedElements = (isSub = false): IBatchCommand => {
  const selectedElems = svgCanvas.getSelectedWithoutTempGroup();
  return deleteElements(selectedElems, isSub);
};

export default {
  deleteElements,
  deleteSelectedElements,
};
