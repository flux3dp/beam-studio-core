/* eslint-disable no-continue */
import * as paper from 'paper';

import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const getElemString = (elem: Element) => {
  if (elem.tagName === 'rect' && elem.getAttribute('rx')) {
    const cloned = elem.cloneNode(true) as Element;
    cloned.setAttribute('ry', elem.getAttribute('rx'));
    return cloned.outerHTML;
  }
  return elem.outerHTML;
};

const shouldSkip = (elem: Element): boolean => {
  if (elem.tagName === 'defs' || ['svgcontent', 'svg_defs'].includes(elem.id)) return false;
  if (elem.tagName === 'symbol')
    return !document.querySelector(`#svgcontent use[*|href="#${elem.id}"]`);
  return shouldSkip(elem.parentNode as Element);
};

// Note:
// When importing svg files, fluxsvg only handles clip-path attributes with url and ignore those with basic shapes
// Clip path loop will cause error and stop at importing step
const convertClipPath = (): (() => void) => {
  window.paper = paper;
  let revert = () => {};
  const clippedElems = Array.from(
    document.querySelectorAll('#svgcontent *[clip-path*="url"], #svg_defs *[clip-path*="url"]')
  );
  if (clippedElems.length === 0) return revert;

  const newElems = [];
  const oldElems = [];
  const clipPathMap = {};

  const getClipPathItem = (elem: Element) => {
    const insert = false;
    const proj = new paper.Project(document.createElement('canvas'));
    const items = proj.importSVG(`<svg>${elem.innerHTML}</svg>`);
    let pathItem: paper.PathItem = paper.PathItem.create('');
    for (let i = 0; i < items.children.length; i += 1) {
      const obj = items.children[i] as paper.Shape | paper.Path | paper.CompoundPath;
      const objPath = obj instanceof paper.Shape ? obj.toPath(insert) : obj.clone({ insert });
      objPath.closePath();
      pathItem = pathItem.unite(objPath, { insert });
    }
    return pathItem;
  };

  const clip = (clipPath: paper.PathItem, elem: Element) => {
    if (elem.tagName === 'g') {
      elem.childNodes.forEach((subElem) => clip(clipPath, subElem as Element));
      return;
    }
    if (['rect', 'circle', 'ellipse', 'path', 'polygon', 'line'].includes(elem.tagName)) {
      const { isAllFilled } = svgCanvas.calcElemFilledInfo(elem);
      const proj = new paper.Project(document.createElement('canvas'));
      const items = proj.importSVG(`<svg>${getElemString(elem)}</svg>`);
      let obj = items.children[0] as paper.Shape | paper.Path | paper.CompoundPath;
      if (obj instanceof paper.Shape) {
        obj = obj.toPath();
      }
      let resPath: paper.PathItem;
      if (obj instanceof paper.Path) {
        if (isAllFilled) obj.closePath();
        resPath = obj.intersect(clipPath, { trace: isAllFilled });
      } else {
        resPath = new paper.CompoundPath('');
        for (let i = 0; i < obj.children.length; i += 1) {
          const subPath = obj.children[i] as paper.PathItem;
          if (isAllFilled) subPath.closePath();
          resPath.addChild(subPath.intersect(clipPath, { trace: isAllFilled, insert: false }));
        }
      }
      elem.replaceWith(resPath.exportSVG());
    }
  };

  while (clippedElems.length > 0) {
    const elem = clippedElems.pop();
    if (shouldSkip(elem)) continue;
    const clipPathId = svgCanvas.getUrlFromAttr(elem.getAttribute('clip-path')).replace('#', '');
    let clipPathItem: paper.PathItem = clipPathMap[clipPathId];
    if (!clipPathItem) {
      const clipPathElem = document.getElementById(clipPathId);
      if (!clipPathElem) continue;
      if (
        clippedElems.length > 1 &&
        (clipPathElem.hasAttribute('clip-path') ||
          !!clipPathElem.querySelector('*[clip-path*="url"]'))
      ) {
        // Should handle inner clip-path first
        clippedElems.unshift(elem);
        continue;
      }
      clipPathItem = getClipPathItem(clipPathElem);
      clipPathMap[clipPathId] = clipPathItem;
      const { parentNode, nextSibling } = clipPathElem;
      oldElems.unshift({ elem: clipPathElem, parentNode, nextSibling });
      clipPathElem.remove();
    }
    const cloned = elem.cloneNode(true) as Element;
    clip(clipPathItem, cloned);
    cloned.removeAttribute('clip-path');
    const { parentNode, nextSibling } = elem;
    newElems.push(cloned);
    parentNode.insertBefore(cloned, elem);
    oldElems.unshift({ elem, parentNode, nextSibling });
    elem.remove();
  }
  // Remove unused/duplicated clipPath elements
  const clipPathElems = document.querySelectorAll('#svg_defs clipPath');
  for (let i = 0; i < clipPathElems.length; i += 1) {
    const clipPathElem = clipPathElems[i];
    const { parentNode, nextSibling } = clipPathElem;
    oldElems.unshift({ elem: clipPathElem, parentNode, nextSibling });
    clipPathElem.remove();
  }

  revert = () => {
    oldElems.forEach(({ elem, parentNode, nextSibling }) => {
      if (nextSibling) parentNode.insertBefore(elem, nextSibling);
      else parentNode.appendChild(elem);
    });
    newElems.forEach((elem) => elem.remove());
  };
  return revert;
};

export default convertClipPath;
