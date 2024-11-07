/* eslint-disable max-len */
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import fontFuncs, { convertTextToPathByFontkit, getFontObj } from 'app/actions/beambox/font-funcs';
import { FontDescriptor } from 'interfaces/IFont';
import history from 'app/svgedit/history/history';

let svgCanvas: ISVGCanvas;

getSVGAsync(({ Canvas }) => {
  svgCanvas = Canvas;
});

const SVG_NS = 'http://www.w3.org/2000/svg';

export function removeFirstRectTag(svgString: string): string {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');

  doc.querySelector('rect')?.remove();

  return new XMLSerializer().serializeToString(doc);
}

export function extractSvgTags(svgString: string, tag: string): Array<string> {
  const elements = new DOMParser()
    .parseFromString(svgString, 'image/svg+xml')
    .querySelectorAll(tag);

  return Array.from(elements).map(({ outerHTML }) => outerHTML);
}

function extractFontDetails(fontStyle: string): {
  fontFamily: string;
  fontSize: string;
  isBold: boolean;
  isItalic: boolean;
} {
  const isBold = /bold/i.test(fontStyle);
  const isItalic = /italic/i.test(fontStyle);
  const fontSize = fontStyle.match(/(\d+px|\d+em|\d+rem|\d+pt)/)?.[0] || '16px';
  const fontFamily = fontStyle
    .replace(/font:\s*|bold|italic|(\d+px|\d+em|\d+rem|\d+pt)/g, '')
    .trim();

  return { fontFamily, fontSize, isBold, isItalic };
}

function findMatchingFont(
  fontInfos: Array<FontDescriptor>,
  isBold: boolean,
  isItalic: boolean
): FontDescriptor {
  return (
    fontInfos.find(
      ({ postscriptName }) =>
        (isBold ? /Bold/.test(postscriptName) : !/Bold/.test(postscriptName)) &&
        (isItalic ? /Italic/.test(postscriptName) : !/Italic/.test(postscriptName))
    ) || fontInfos[0]
  );
}

function preProcessTextTag(svgString: string): string {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const text = doc.querySelector('text');

  if (!text) {
    return svgString;
  }

  const { fontFamily, fontSize, isBold, isItalic } = extractFontDetails(text.getAttribute('style'));
  const fonts: Array<FontDescriptor> = fontFuncs.requestFontsOfTheFontFamily(fontFamily);
  const font = findMatchingFont(fonts, isBold, isItalic);

  text.setAttribute('font-family', `'${font.family}'`);
  text.setAttribute('font-size', fontSize);
  text.setAttribute('font-style', isItalic ? 'italic' : 'normal');
  text.setAttribute('font-weight', font.weight.toString());
  text.setAttribute('font-postscript', font.postscriptName);
  text.removeAttribute('style');

  return new XMLSerializer().serializeToString(doc);
}

/* Barcode */
function preProcessBarcodeSvgString(svgString: string): string {
  return preProcessTextTag(removeFirstRectTag(svgString));
}

// this function is not implemented yet, it is just a placeholder
function handleBarcodeInvertColor(svgString: string) {
  return svgString;
}

export async function importBarcodeSvgString(svgString: string, isInvert = false): Promise<void> {
  const processedSvgString = preProcessBarcodeSvgString(svgString);
  const svg = isInvert ? handleBarcodeInvertColor(processedSvgString) : processedSvgString;

  const batchCmd = new history.BatchCommand('Import Barcode');
  const element = await importSvgString(svg, { type: 'layer', parentCmd: batchCmd });

  batchCmd.addSubCommand(await svgCanvas.disassembleUse2Group([element], true, false, false));
  batchCmd.addSubCommand(svgCanvas.groupSelectedElements(true));

  if (!batchCmd.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  }
}

/* QR Code */
function handleQrCodeInvertColor(svgString: string, size: string): string {
  const svgElement = document.createElementNS(SVG_NS, 'svg');

  svgElement.setAttribute('xmlns', SVG_NS);
  svgElement.setAttribute('height', '1000');
  svgElement.setAttribute('width', '1000');
  svgElement.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const fullBlackPath = document.createElementNS(SVG_NS, 'path');

  fullBlackPath.setAttribute('fill', 'black');
  fullBlackPath.setAttribute('d', `M0 0h${size}v${size}H0z`);

  const codePathData = extractSvgTags(svgString, 'path')[1];
  const pathData = svgCanvas.pathActions.booleanOperation(fullBlackPath.outerHTML, codePathData, 2);
  const pathElement = document.createElementNS(SVG_NS, 'path');

  pathElement.setAttribute('fill', 'black');
  pathElement.setAttribute('d', pathData);
  pathElement.setAttribute('shape-rendering', 'crispEdges');

  svgElement.appendChild(pathElement);

  return new XMLSerializer().serializeToString(svgElement);
}

export function importQrCodeSvgString(svgString: string, size: string, isInvert = false): void {
  const svg = isInvert ? handleQrCodeInvertColor(svgString, size) : svgString;

  importSvgString(svg, { type: 'layer' });
}

// 'path method' to import barcode text element
// but the font capability is worse than 'text method'
export async function importBarcodeSvgStringRaw(
  svgString: string,
  isInvert = false
): Promise<void> {
  const processedSvgString = preProcessBarcodeSvgString(svgString);
  const svg = isInvert ? handleBarcodeInvertColor(processedSvgString) : processedSvgString;
  const svgElement = document.createElement('svg');

  document.body.appendChild(svgElement);
  svgElement.innerHTML = svg;

  const innterG = svgElement.querySelector('g');
  const text = innterG.querySelector('text');
  const { textContent } = text;

  text.textContent = '';

  const tspan = document.createElementNS(SVG_NS, 'tspan');

  tspan.setAttribute('x', text.getAttribute('x'));
  tspan.setAttribute('y', text.getAttribute('y'));
  text.setAttribute('font-size', '20');
  tspan.textContent = textContent;
  text.appendChild(tspan);

  const postscript = text.getAttribute('font-postscript');
  const font = fontFuncs.getFontOfPostscriptName(postscript);
  const fontObj = await getFontObj(font);
  const { d } = convertTextToPathByFontkit(text, fontObj);
  const path = document.createElementNS(SVG_NS, 'path');

  text.parentNode.insertBefore(path, text);
  path.setAttribute('d', d);
  text.remove();

  const g = document.createElementNS(SVG_NS, 'g');

  g.innerHTML = innterG.innerHTML;
  svgElement.remove();

  const layer = document.querySelector('g.layer');

  // use add from json
  // give id
  // scale to 1
  layer.appendChild(g);
}
