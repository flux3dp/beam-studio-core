/* eslint-disable no-param-reassign */
import fontFuncs, { convertTextToPathByFontkit, getFontObj } from 'app/actions/beambox/font-funcs';
import NS from 'app/constants/namespaces';
import history from 'app/svgedit/history/history';
import undoManager from 'app/svgedit/history/undoManager';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { FontDescriptor } from 'interfaces/IFont';
import ISVGCanvas from 'interfaces/ISVGCanvas';

let svgCanvas: ISVGCanvas;

getSVGAsync(({ Canvas }) => {
  svgCanvas = Canvas;
});

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
        isBold === postscriptName.includes('Bold') && isItalic === postscriptName.includes('Italic')
    ) || fontInfos[0]
  );
}

function preProcessTextTag(svgElement: SVGElement): SVGElement {
  const texts = svgElement.querySelectorAll('text');

  if (!texts.length) {
    return svgElement;
  }

  texts.forEach((text) => {
    const { fontFamily, fontSize, isBold, isItalic } = extractFontDetails(
      text.getAttribute('style')
    );
    const fonts: Array<FontDescriptor> = fontFuncs.requestFontsOfTheFontFamily(fontFamily);
    const font = findMatchingFont(fonts, isBold, isItalic);

    text.setAttribute('font-family', `'${font.family}'`);
    text.setAttribute('font-size', fontSize.toString());
    text.setAttribute('font-style', isItalic ? 'italic' : 'normal');
    text.setAttribute('font-weight', font.weight.toString());
    text.setAttribute('font-postscript', font.postscriptName);
    text.removeAttribute('style');
  });

  return svgElement;
}

function getTranslateValues(transform: string): { x: number; y: number } {
  const match = transform.match(/translate\(([^,]+),?\s*([^)]+)?\)/);

  if (match) {
    const x = parseFloat(match[1]);
    // default to 0 if missing
    const y = match[2] ? parseFloat(match[2]) : 0;

    return { x, y };
  }

  return { x: 0, y: 0 };
}

/* Barcode */
export async function importBarcodeSvgElement(
  svgElement: SVGElement,
  isInvert = false
): Promise<void> {
  const batchCmd = new history.BatchCommand('Import Barcode');
  const doc = preProcessTextTag(svgElement);
  const group = Array.of<SVGElement>();
  const gElements = doc.querySelectorAll('g');
  const fontObj = await getFontObj(
    fontFuncs.getFontOfPostscriptName(doc.querySelector('text')?.getAttribute('font-postscript'))
  );

  gElements.forEach((g) => {
    const transform = getTranslateValues(g.getAttribute('transform'));

    g.querySelectorAll('rect').forEach((rect) => {
      const { x, y, width, height } = rect.getBBox();

      group.push(
        svgCanvas.addSvgElementFromJson({
          element: 'rect',
          curStyles: false,
          attr: {
            x: x + transform.x,
            y: y + transform.y,
            width,
            height,
            stroke: '#000',
            fill: 'black',
            opacity: 1,
            'fill-opacity': 1,
            id: svgCanvas.getNextId(),
          },
        })
      );
    });

    g.querySelectorAll('text').forEach((text) => {
      const { textContent } = text;

      if (!textContent) {
        return;
      }

      const tspan = document.createElementNS(NS.SVG, 'tspan');

      tspan.setAttribute('x', `${Number.parseFloat(text.getAttribute('x')) + transform.x}`);
      tspan.setAttribute('y', `${Number.parseFloat(text.getAttribute('y')) + transform.y}`);
      tspan.textContent = textContent;
      text.textContent = '';
      text.appendChild(tspan);

      const { d } = convertTextToPathByFontkit(text, fontObj);

      group.push(
        svgCanvas.addSvgElementFromJson({
          element: 'path',
          curStyles: true,
          attr: {
            d,
            fill: 'black',
            opacity: 1,
            'fill-opacity': 1,
            id: svgCanvas.getNextId(),
          },
        })
      );
    });
  });

  // reverse to prevent doApply cannot find the next sibling
  [...group].reverse().forEach((element) => {
    batchCmd.addSubCommand(new history.InsertElementCommand(element));
  });

  doc.remove();

  svgCanvas.selectOnly(group);

  const groupElementSubCmd = svgCanvas.groupSelectedElements(true);

  if (groupElementSubCmd) {
    batchCmd.addSubCommand(groupElementSubCmd);
  }

  svgCanvas.zoomSvgElem(10);

  if (!batchCmd.isEmpty()) {
    console.log('batchCmd', batchCmd);
    undoManager.addCommandToHistory(batchCmd);
  }
}

/* QR Code */
function handleQrCodeInvertColor(svgElement: SVGElement): string {
  const size = svgElement.getAttribute('viewBox')?.split(' ')[2];
  const svg = document.createElementNS(NS.SVG, 'svg');

  svg.setAttribute('xmlns', NS.SVG);
  svg.setAttribute('height', '1000');
  svg.setAttribute('width', '1000');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const [backgroundPath, codePath] = extractSvgTags(
    new XMLSerializer().serializeToString(svgElement),
    'path'
  );
  const subtractedPath = svgCanvas.pathActions.booleanOperation(backgroundPath, codePath, 2);
  const path = document.createElementNS(NS.SVG, 'path');

  path.setAttribute('fill', 'black');
  path.setAttribute('d', subtractedPath);

  svg.appendChild(path);

  const svgString = new XMLSerializer().serializeToString(svg);

  svg.remove();

  return svgString;
}

export async function importQrCodeSvgElement(
  svgElement: SVGElement,
  isInvert = false
): Promise<void> {
  const svgString = isInvert
    ? handleQrCodeInvertColor(svgElement)
    : new XMLSerializer().serializeToString(svgElement);

  await importSvgString(svgString, { type: 'layer' });
}
