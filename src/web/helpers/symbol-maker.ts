/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/**
 * Make symbol elements for <use> element
 */

import communicator from 'implementations/communicator';
import history from 'app/svgedit/history';
import ImageSymbolWorker from 'helpers/symbol-helper/image-symbol.worker';
import Progress from 'app/actions/progress-caller';
import { IBatchCommand } from 'interfaces/IHistory';

import { getSVGAsync } from './svg-editor-helper';

let svgCanvas;
let svgedit;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgedit = globalSVG.Edit; });

let clipCount = 1;

const makeSymbol = (
  elem: Element,
  attrs: { nodeName: string, value: string }[],
  batchCmd: IBatchCommand,
  defs: Element[],
  type: string,
): SVGSymbolElement => {
  if (!elem) {
    return null;
  }
  const { NS } = svgedit;
  const svgdoc = document.getElementById('svgcanvas').ownerDocument;
  const symbol = svgdoc.createElementNS(NS.SVG, 'symbol') as unknown as SVGSymbolElement;
  const symbolDefs = svgdoc.createElementNS(NS.SVG, 'defs') as unknown as SVGDefsElement;
  const oldLinkMap = new Map();
  defs.forEach((def) => {
    const clonedDef = def.cloneNode(true) as Element;
    const oldId = clonedDef.id;
    if (oldId) {
      const newId = `def${clipCount}`;
      clipCount += 1;
      oldLinkMap.set(oldId, newId);
      clonedDef.id = newId;
    }
    symbolDefs.appendChild(clonedDef);
  });

  symbol.appendChild(symbolDefs);

  symbol.appendChild(elem);
  function traverseForRemappingId(node: Element) {
    if (!node.attributes) {
      return;
    }

    for (let i = 0; i < node.attributes.length; i += 1) {
      const attr = node.attributes.item(i);
      const re = /url\(#([^)]+)\)/g;
      const linkRe = /#(.+)/g;
      const urlMatch = attr.nodeName === 'xlink:href' ? linkRe.exec(attr.value) : re.exec(attr.value);

      if (urlMatch) {
        const oldId = urlMatch[1];
        if (oldLinkMap.get(oldId)) {
          node.setAttribute(attr.nodeName, attr.value.replace(`#${oldId}`, `#${oldLinkMap.get(oldId)}`));
        }
      }
    }
    if (!node.childNodes) {
      return;
    }
    Array.from(node.childNodes).map((child) => traverseForRemappingId(child as Element));
  }
  traverseForRemappingId(symbol);

  (function remapIdOfStyle() {
    Array.from(symbolDefs.childNodes).forEach((child: SVGElement) => {
      if (child.tagName !== 'style') {
        return;
      }
      const originStyle = child.innerHTML;
      const re = /url\(#([^)]+)\)/g;
      const mappedStyle = originStyle.replace(re, (match, p1) => {
        if (oldLinkMap.get(p1)) {
          return `url(#${oldLinkMap.get(p1)})`;
        }
        return '';
      });
      child.innerHTML = mappedStyle;
    });
  }());

  for (let i = 0; i < attrs.length; i += 1) {
    const attr = attrs[i];
    symbol.setAttribute(attr.nodeName, attr.value);
  }
  symbol.id = svgCanvas.getNextId();
  const firstChild = elem.firstChild as Element;
  if (firstChild && (firstChild.id || firstChild.getAttributeNS(svgedit.NS.INKSCAPE, 'label'))) {
    if (firstChild.getAttributeNS(svgedit.NS.INKSCAPE, 'label')) {
      const id = firstChild.getAttributeNS(svgedit.NS.INKSCAPE, 'label');
      symbol.setAttribute('data-id', id);
      firstChild.removeAttributeNS(svgedit.NS.INKSCAPE, 'label');
    } else {
      symbol.setAttribute('data-id', firstChild.id);
    }
  }
  // If import by layer but no valid layer available, use current layer
  const drawing = svgCanvas.getCurrentDrawing();
  const currentLayerName = drawing.getCurrentLayerName();
  if (type === 'layer' && !symbol.getAttribute('data-id')) {
    symbol.setAttribute('data-id', currentLayerName);
  }
  if (firstChild && firstChild.getAttribute('data-color')) {
    symbol.setAttribute('data-color', firstChild.getAttribute('data-color'));
  }

  svgedit.utilities.findDefs().appendChild(symbol);

  // remove invisible nodes (such as invisible layer in Illustrator)
  Array.from(symbol.querySelectorAll('*'))
    .filter((element: HTMLElement) => element.style.display === 'none')
    .forEach((element: HTMLElement) => element.remove());
  Array.from(symbol.querySelectorAll('use'))
    .filter((element) => $(symbol).find(svgedit.utilities.getHref(element)).length === 0)
    .forEach((element) => element.remove());

  // add prefix(which constrain css selector to symbol's id) to prevent class style pollution
  let originStyle = $(symbol).find('style').text();
  if (type === 'nolayer') {
    originStyle = originStyle.replace(/stroke[^a-zA-Z]*:[^;]*;/g, '');
    originStyle = originStyle.replace(/stroke-width[^a-zA-Z]*:[^;]*;/g, '');
  }

  const svgPixelTomm = 254 / 72; // 本來 72 個點代表 1 inch, 現在 254 個點代表 1 inch.
  const unitMap = {
    in: (25.4 * 10) / svgPixelTomm,
    cm: (10 * 10) / svgPixelTomm,
    mm: 10 / svgPixelTomm,
    px: 1,
  };
  const getFontSizeInPixel = (fontSizeCss) => {
    if (!Number.isNaN(fontSizeCss)) {
      return fontSizeCss;
    }
    const unit = fontSizeCss.substr(-2);
    const num = fontSizeCss.substr(0, fontSizeCss.length - 2);
    if (!unit || !unitMap[unit]) {
      return num;
    }
    return num * unitMap[unit];
  };

  const textElems = $(symbol).find('text');
  for (let i = 0; i < textElems.length; i += 1) {
    // Remove text in <text> to <tspan>
    const textElem = textElems[i];
    const fontFamily = $(textElem).css('font-family');
    $(textElem).attr('font-family', fontFamily);
    const fontSize = getFontSizeInPixel($(textElem).css('font-size'));
    $(textElem).attr('font-size', fontSize);
    $(textElem).attr('stroke-width', 2);

    if (!$(textElem).attr('x')) {
      $(textElem).attr('x', 0);
    }
    if (!$(textElem).attr('y')) {
      $(textElem).attr('y', 0);
    }
    const texts = Array.from(textElem.childNodes)
      .filter((child: ChildNode) => child.nodeType === 3);
    for (let j = texts.length - 1; j >= 0; j -= 1) {
      const t = texts[j] as SVGTextContentElement;
      const tspan = document.createElementNS(svgedit.NS.SVG, 'tspan');
      textElem.prepend(tspan);
      tspan.textContent = t.textContent;
      $(t).remove();
      $(tspan).attr({
        x: textElem.getAttribute('x'),
        y: textElem.getAttribute('y'),
        'vector-effect': 'non-scaling-stroke',
      });
    }
  }
  // the regex indicate the css selector
  // but the selector may contain comma, so we replace it again.
  let prefixedStyle = originStyle.replace(/([^{}]+){/g, (match) => {
    const prefix = `#${symbol.id} `;
    const replace = match.replace(',', `,${prefix}`);
    return prefix + replace;
  });
  prefixedStyle = `${prefixedStyle}
        *[data-color] ellipse[fill=none],
        *[data-color] circle[fill=none],
        *[data-color] rect[fill=none],
        *[data-color] path[fill=none],
        *[data-color] polygon[fill=none] {
            fill-opacity: 0 !important;
            stroke-width: 1px !important;
            stroke-opacity: 1 !important;
            vector-effect: non-scaling-stroke !important;
        }

        *[data-color] ellipse[stroke=none],
        *[data-color] circle[stroke=none],
        *[data-color] rect[stroke=none],
        *[data-color] path[stroke=none],
        *[data-color] polygon[stroke=none],
        *[data-color] ellipse:not([stroke]),
        *[data-color] circle:not([stroke]),
        *[data-color] rect:not([stroke]),
        *[data-color] path:not([stroke]),
        *[data-color] polygon:not([stroke]) {
            fill-opacity: 1 !important;
            stroke-width: 0 !important;
        }

        *[data-wireframe] {
            stroke-width: 1px !important;
            stroke-opacity: 1.0 !important;
            stroke-dasharray: 0 !important;
            opacity: 1 !important;
            vector-effect: non-scaling-stroke !important;
            filter: none !important;
        }

        #svg_editor:not(.color) #${symbol.id} * {
            fill-opacity: 0;
            stroke: #000 !important;
            filter: none;
            stroke-width: 1px !important;
            vector-effect: non-scaling-stroke !important;
            stroke-opacity: 1.0;
            stroke-dasharray: 0;
            opacity: 1;
            filter: none;
        }
        #${symbol.id} {
            overflow: visible;
        }

    `;

  if ($(symbol).find('style').length) {
    $(symbol).find('style').text(prefixedStyle);
  } else {
    $(symbol).find('defs').append(
      `<style>${prefixedStyle}</style>`,
    );
  }

  batchCmd.addSubCommand(new history.InsertElementCommand(symbol));

  return symbol;
};

const getStrokeWidth = (imageRatio, scale) => {
  if (!scale) {
    return 1;
  }
  let strokeWidth = (0.8 * imageRatio) / scale;
  const zoomRatio = svgCanvas.getZoom();
  strokeWidth /= zoomRatio;
  if (strokeWidth < 1.5) {
    strokeWidth = (strokeWidth / 1.5) ** (1 / 3) * 1.5;
  }
  return strokeWidth;
};

const sendTaskToWorker = async (data) => new Promise((resolve) => {
  const worker = new ImageSymbolWorker('');
  worker.postMessage(data);
  worker.onerror = (e) => console.log(e);
  worker.onmessage = (e) => {
    resolve(e.data);
    worker.terminate();
  };
});

let requestId = 0;

const getRequestID = () => {
  requestId += 1;
  requestId %= 10000;
  return requestId;
};

// For debug, same as svgToImgUrlByShadowWindow
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const svgToImgUrl = async (data) => new Promise<string>((resolve) => {
  const {
    svgUrl, imgWidth: width, imgHeight: height, strokeWidth,
  } = data;
  const img = new Image(width + parseInt(strokeWidth, 10), height + parseInt(strokeWidth, 10));
  img.onload = async () => {
    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    const ctx = imgCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    if (svgedit.browser.isSafari()) {
      ctx.drawImage(
        img,
        -parseInt(strokeWidth, 10),
        -parseInt(strokeWidth, 10),
        width + parseInt(strokeWidth, 10),
        height + parseInt(strokeWidth, 10),
        0,
        0,
        img.width,
        img.height,
      );
      img.remove();
    } else {
      ctx.drawImage(img, 0, 0, img.width, img.height);
    }
    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.max(1, width);
    outCanvas.height = Math.max(1, height);
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;
    outCtx.filter = 'brightness(0%)';
    outCtx.drawImage(imgCanvas, 0, 0, outCanvas.width, outCanvas.height);
    if (svgedit.browser.isSafari()) {
      const imageData = outCtx.getImageData(0, 0, outCanvas.width, outCanvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] !== 0) {
          d[i] = 0; // red
          d[i + 1] = 0; // green
          d[i + 2] = 0; // blue
        }
      }
      outCtx.putImageData(imageData, 0, 0);
    }
    const imageBase64 = outCanvas.toDataURL('image/png');
    const res = await fetch(imageBase64);
    const imageBlob = await res.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    resolve(imageUrl);
  };
  img.src = svgUrl;
  if (svgedit.browser.isSafari()) {
    document.body.appendChild(img);
  }
});

const svgToImgUrlByShadowWindow = async (data) => new Promise<string>((resolve) => {
  communicator.once(`SVG_URL_TO_IMG_URL_DONE_${requestId}`, (sender, url) => {
    resolve(url);
  });
  communicator.send('SVG_URL_TO_IMG_URL', data);
});

const calculateImageRatio = (bb) => {
  const zoomRatio = Math.max(1, svgCanvas.getZoom());
  const widthRatio = Math.min(4096, window.innerWidth * zoomRatio) / bb.width;
  const heightRatio = Math.min(4096, window.innerHeight * zoomRatio) / bb.height;
  let imageRatio = (Math.ceil(10000 * Math.min(widthRatio, heightRatio))) / 10000;
  imageRatio *= svgedit.browser.isSafari() ? 0.95 : 2;
  return imageRatio;
};

const makeImageSymbol = async (
  symbol: SVGSymbolElement, scale = 1, imageSymbol?: SVGSymbolElement,
): Promise<SVGSymbolElement> => {
  const { NS } = svgedit;
  const svgdoc = document.getElementById('svgcanvas').ownerDocument;
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<SVGSymbolElement>(async (resolve) => {
    const generateTempSvg = () => {
      const tempSvg = svgdoc.createElementNS(NS.SVG, 'svg');
      const tempUse = svgdoc.createElementNS(NS.SVG, 'use');
      const tempSymbol = symbol.cloneNode(true) as SVGSymbolElement;
      tempSvg.appendChild(tempSymbol);
      tempSvg.appendChild(tempUse);
      svgedit.utilities.setHref(tempUse, `#${symbol.id}`);
      return { tempSvg, tempSymbol, tempUse };
    };

    const calculateSVGBBox = () => {
      const bbText = symbol.getAttribute('data-bbox');
      let bb: { height: number, width: number, x: number, y: number };
      if (!bbText) {
        // Unable to getBBox if <use> not mounted
        const useElemForBB = svgedit.utilities.findTempUse();
        svgedit.utilities.setHref(useElemForBB, `#${symbol.id}`);
        bb = useElemForBB.getBBox();
        svgedit.utilities.setHref(useElemForBB, '');
        bb.height = Math.max(1, bb.height);
        bb.width = Math.max(1, bb.width);
        const obj = {
          x: parseFloat(bb.x.toFixed(5)),
          y: parseFloat(bb.y.toFixed(5)),
          width: parseFloat(bb.width.toFixed(5)),
          height: parseFloat(bb.height.toFixed(5)),
        };
        symbol.setAttribute('data-bbox', JSON.stringify(obj));
      } else {
        bb = JSON.parse(bbText);
      }
      const bbObject = {
        x: bb.x, y: bb.y, width: bb.width, height: bb.height,
      };
      return bbObject;
    };

    const { tempSvg, tempSymbol, tempUse } = generateTempSvg();
    const bb = calculateSVGBBox();
    const imageRatio = calculateImageRatio(bb);
    const strokeWidth = getStrokeWidth(imageRatio, scale);
    tempSymbol.setAttribute('x', `${-bb.x}`);
    tempSymbol.setAttribute('y', `${-bb.y}`);
    const descendants = Array.from(tempSymbol.querySelectorAll('*'));
    descendants.forEach((d) => {
      d.setAttribute('stroke-width', `${strokeWidth}px`);
      d.setAttribute('vector-effect', 'non-scaling-stroke');
    });
    const styles = Array.from(tempSymbol.querySelectorAll('style'));
    styles.forEach((styleNode) => {
      let styleText = styleNode.textContent;
      styleText = styleText.replace(/stroke-width: 1px !important;/g, `stroke-width: ${strokeWidth}px !important;`);
      styleNode.textContent = styleText;
    });
    tempUse.setAttribute('transform', `translate(${0.5 * strokeWidth}, ${0.5 * strokeWidth}) scale(${imageRatio})`);

    const svgString = new XMLSerializer().serializeToString(tempSvg);
    const svgBlob = await sendTaskToWorker({ type: 'svgStringToBlob', svgString });
    const svgUrl = URL.createObjectURL(svgBlob);
    const imgWidth = Math.max(bb.width * imageRatio, 1);
    const imgHeight = Math.max(bb.height * imageRatio, 1);
    const id = getRequestID();
    const param = {
      id, svgUrl, imgWidth, imgHeight, bb, imageRatio, strokeWidth,
    };
    const imageUrl = window.FLUX.version === 'web' ? await svgToImgUrl(param) : await svgToImgUrlByShadowWindow(param);
    URL.revokeObjectURL(svgUrl);
    if (!imageSymbol) {
      const image = svgdoc.createElementNS(NS.SVG, 'image');
      imageSymbol = svgdoc.createElementNS(NS.SVG, 'symbol') as unknown as SVGSymbolElement;
      const defs = svgedit.utilities.findDefs();
      defs.appendChild(imageSymbol);
      imageSymbol.appendChild(image);
      image.setAttribute('x', String(bb.x));
      image.setAttribute('y', String(bb.y));
      image.setAttribute('width', String(bb.width));
      image.setAttribute('height', String(bb.height));
      image.setAttribute('href', imageUrl);
      imageSymbol.setAttribute('overflow', 'visible');
      imageSymbol.setAttribute('id', `${symbol.id}_image`);
      imageSymbol.setAttribute('data-origin-symbol', `${symbol.id}`);
      symbol.setAttribute('data-image-symbol', `${imageSymbol.id}`);
    } else {
      const image = imageSymbol.firstChild as SVGElement;
      const oldImageUrl = image.getAttribute('href');
      URL.revokeObjectURL(oldImageUrl);
      image.setAttribute('width', String(bb.width));
      image.setAttribute('height', String(bb.height));
      image.setAttribute('href', imageUrl);
    }
    resolve(imageSymbol);
  });
};

const reRenderImageSymbol = async (useElement: SVGUseElement): Promise<void> => {
  if (!useElement.parentNode) {
    // Element has been deleted
    return;
  }
  const { width, height } = svgCanvas.getSvgRealLocation(useElement);
  const { width: origWidth, height: origHeight } = useElement.getBBox();

  const scale = Math.sqrt((width * height) / (origWidth * origHeight));
  const href = svgCanvas.getHref(useElement);
  const currentSymbol = document.querySelector(href);
  if (currentSymbol && currentSymbol.tagName === 'symbol') {
    const origSymbolId = currentSymbol.getAttribute('data-origin-symbol');
    const imageSymbolId = currentSymbol.getAttribute('data-image-symbol');
    if (origSymbolId) {
      const origSymbol = document.getElementById(origSymbolId) as unknown as SVGSymbolElement;
      if (origSymbol && origSymbol.tagName === 'symbol') {
        await makeImageSymbol(origSymbol, scale, currentSymbol);
      }
    } else if (imageSymbolId) {
      let imageSymbol = document.getElementById(imageSymbolId) as unknown as SVGSymbolElement;
      if (imageSymbol && imageSymbol.tagName === 'symbol') {
        await makeImageSymbol(currentSymbol, scale, imageSymbol);
        useElement.setAttribute('xlink:href', `#${imageSymbolId}`);
      } else {
        imageSymbol = await makeImageSymbol(currentSymbol);
        useElement.setAttribute('xlink:href', `#${imageSymbol.id}`);
      }
    }
  }
};

const reRenderImageSymbolArray = async (useElements: SVGUseElement[]): Promise<void> => {
  const convertAllUses = useElements.map((use) => reRenderImageSymbol(use));
  await Promise.all(convertAllUses);
};

const reRenderAllImageSymbol = async (): Promise<void> => {
  const useElements = [];
  const layers = $('#svgcontent > g.layer').toArray();
  layers.forEach((layer) => {
    const uses = Array.from(layer.querySelectorAll('use'));
    useElements.push(...uses);
  });
  await reRenderImageSymbolArray(useElements);
};

const switchImageSymbol = (elem: SVGUseElement, shouldUseImage: boolean): IBatchCommand => {
  const href = elem.getAttribute('xlink:href');
  if (href.endsWith('_image') && shouldUseImage) {
    console.log(`${elem.id} is already using image`);
    return null;
  }
  if (!href.endsWith('_image') && !shouldUseImage) {
    console.log(`${elem.id} is already using svg symbol`);
    return null;
  }
  const symbolFound = $(href);
  if (symbolFound.length > 0 && symbolFound[0].tagName === 'symbol') {
    const currentSymbol = symbolFound[0] as HTMLElement;
    const targetId = shouldUseImage ? currentSymbol.getAttribute('data-image-symbol') : currentSymbol.getAttribute('data-origin-symbol');
    console.log(targetId);
    if (!targetId) {
      console.warn(`Switcing failed, Unable to find target origin/image symbol ${targetId}.`);
      return null;
    }
    const targetSymbol = $(`#${targetId}`);
    if (targetSymbol.length > 0 && targetSymbol[0].tagName === 'symbol') {
      svgCanvas.undoMgr.beginUndoableChange('xlink:href', [elem]);
      elem.setAttribute('xlink:href', `#${targetId}`);
      const cmd = svgCanvas.undoMgr.finishUndoableChange();
      svgCanvas.updateElementColor(elem);
      return cmd;
    }
    console.warn(`Switcing failed, Unable to find symbol ${targetId}.`);
  } else {
    console.warn(`Switcing failed, Unable to find Current symbol ${href}.`);
  }
  return null;
};

const switchImageSymbolForAll = (shouldUseImage: boolean): void => {
  Progress.openNonstopProgress({ id: 'switch-all-symbol' });
  const layers = $('#svgcontent > g.layer').toArray();
  layers.forEach((layer) => {
    const uses: SVGUseElement[] = Array.from(layer.querySelectorAll('use'));
    uses.forEach((use) => {
      switchImageSymbol(use, shouldUseImage);
    });
  });
  Progress.popById('switch-all-symbol');
};

export default {
  makeSymbol,
  makeImageSymbol,
  reRenderImageSymbol,
  reRenderImageSymbolArray,
  reRenderAllImageSymbol,
  switchImageSymbol,
  switchImageSymbolForAll,
};
