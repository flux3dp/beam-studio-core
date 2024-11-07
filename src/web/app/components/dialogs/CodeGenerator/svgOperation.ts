/* eslint-disable max-len */
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import fontFuncs, { convertTextToPathByFontkit, getFontObj } from 'app/actions/beambox/font-funcs';
import { FontDescriptor } from 'interfaces/IFont';
import history from 'app/svgedit/history/history';
import undoManager from 'app/svgedit/history/undoManager';

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
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
} {
  const isBold = /bold/i.test(fontStyle);
  const isItalic = /italic/i.test(fontStyle);
  const fontSizeInfo = fontStyle.match(/(\d+px|\d+em|\d+rem|\d+pt)/)?.[0] || '16px';
  const fontSize = Number.parseFloat(fontSizeInfo.match(/^(\d+(\.\d+)?)/)?.[0]) || 16;
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

function preProcessTextTag(svgElement: SVGElement): SVGElement {
  const text = svgElement.querySelector('text');

  if (!text) {
    return svgElement;
  }

  const { fontFamily, fontSize, isBold, isItalic } = extractFontDetails(text.getAttribute('style'));
  const fonts: Array<FontDescriptor> = fontFuncs.requestFontsOfTheFontFamily(fontFamily);
  const font = findMatchingFont(fonts, isBold, isItalic);

  text.setAttribute('font-family', `'${font.family}'`);
  text.setAttribute('font-size', fontSize.toString());
  text.setAttribute('font-style', isItalic ? 'italic' : 'normal');
  text.setAttribute('font-weight', font.weight.toString());
  text.setAttribute('font-postscript', font.postscriptName);
  text.removeAttribute('style');

  return svgElement;
}

/* Barcode */
export async function importBarcodeSvgElement(
  svgElement: SVGElement,
  isInvert = false
): Promise<void> {
  const batchCmd = new history.BatchCommand('Import Barcode');
  const doc = preProcessTextTag(svgElement);
  const innerG = doc.querySelector('g');
  const rects = innerG.querySelectorAll('rect');
  const group = Array.of<SVGElement>();

  rects.forEach((rect) => {
    const { x, y, width, height } = rect.getBBox();

    group.push(
      svgCanvas.addSvgElementFromJson({
        element: 'rect',
        curStyles: false,
        attr: {
          x,
          y,
          width,
          height,
          stroke: '#000',
          id: svgCanvas.getNextId(),
          fill: 'black',
          'fill-opacity': 1,
          opacity: 1,
        },
      })
    );
  });

  const text = innerG.querySelector('text');
  const { textContent } = text;
  const tspan = document.createElementNS(SVG_NS, 'tspan');

  text.textContent = '';
  tspan.setAttribute('x', text.getAttribute('x'));
  tspan.setAttribute('y', text.getAttribute('y'));
  text.setAttribute('font-size', text.getAttribute('font-size'));
  tspan.textContent = textContent;
  text.appendChild(tspan);

  const postscript = text.getAttribute('font-postscript');
  const font = fontFuncs.getFontOfPostscriptName(postscript);
  const fontObj = await getFontObj(font);
  const { d } = convertTextToPathByFontkit(text, fontObj);

  group.push(
    svgCanvas.addSvgElementFromJson({
      element: 'path',
      curStyles: true,
      attr: {
        d,
        id: svgCanvas.getNextId(),
        fill: 'black',
        'fill-opacity': 1,
        opacity: 1,
      },
    })
  );

  group.forEach((element) => {
    batchCmd.addSubCommand(new history.InsertElementCommand(element));
  });

  text.remove();
  doc.remove();

  svgCanvas.selectOnly(group);
  batchCmd.addSubCommand(svgCanvas.groupSelectedElements(true));
  svgCanvas.zoomSvgElem(10);

  if (!batchCmd.isEmpty()) {
    undoManager.addCommandToHistory(batchCmd);
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

export function importQrCodeSvgElement(svgElement: SVGElement, isInvert = false): void {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const size = svgElement.getAttribute('viewBox')?.split(' ')[2];
  const svg = isInvert ? handleQrCodeInvertColor(svgString, size) : svgString;

  importSvgString(svg, { type: 'layer' });
}
