/**
 * Editing text element attribute
 */

import storage from 'implementations/storage';
import textActions from 'app/svgedit/textactions';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ICommand } from 'interfaces/IHistory';

interface TextAttribute {
  fill?: string;
  fill_opacity?: string | number;
  fill_paint?: string;
  font_family?: string;
  font_postscriptName?: string;
  font_size?: string | number;
  opacity?: string | number;
  stroke?: string;
  stroke_dasharray?: string;
  stroke_linecap?: string;
  stroke_linejoin?: string;
  stroke_opacity?: string | number;
  stroke_paint?: string;
  stroke_width?: string | number;
  text_anchor?: string;
}

const { svgedit } = window;
const { NS } = svgedit;

let curText: TextAttribute = {};
let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const updateCurText = (newValue: TextAttribute): void => {
  curText = { ...curText, ...newValue };
};

const useDefaultFont = (): void => {
  const defaultFont = storage.get('default-font');
  if (defaultFont) {
    curText.font_family = defaultFont.family;
    curText.font_postscriptName = defaultFont.postscriptName;
  }
};

const getCurText = (): TextAttribute => curText;

const getTextElement = (elem: SVGTextElement): SVGTextElement => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = elem || selectedElements[0];
  return textElem;
};

const getBold = (): boolean => {
  // should only have one element selected
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = selectedElements[0];
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    return (textElem.getAttribute('font-weight') === 'bold');
  }
  return false;
};

const getFontFamily = (elem: SVGTextElement): string => {
  const textElem = getTextElement(elem);
  if (textElem) {
    return textElem.getAttribute('font-family');
  }
  return curText.font_family;
};

/**
 * Returns the font family data of element
 * Used for mac, because we set font-family to font postscript name
 */
const getFontFamilyData = (elem: SVGTextElement): string => {
  const textElem = getTextElement(elem);
  if (textElem) {
    if (!textElem.getAttribute('data-font-family')) {
      return getFontFamily(elem);
    }
    return textElem.getAttribute('data-font-family');
  }
  return curText.font_family;
};

const getFontPostscriptName = (elem: SVGTextElement): string => {
  const textElem = getTextElement(elem);
  if (textElem) {
    return textElem.getAttribute('font-postscript');
  }
  return curText.font_postscriptName;
};

const getFontSize = (elem?: SVGTextElement): number => {
  const textElem = getTextElement(elem);
  if (textElem) {
    return parseFloat(textElem.getAttribute('font-size'));
  }
  return Number(curText.font_size);
};

const getFontWeight = (elem: SVGTextElement): number => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = getTextElement(elem);
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    return Number(textElem.getAttribute('font-weight'));
  }
  return null;
};

const getIsVertical = (elem: SVGTextElement): boolean => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = getTextElement(elem);
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    const val = textElem.getAttribute('data-verti') === 'true';
    textActions.setIsVertical(val);
    return val;
  }
  return false;
};

const getItalic = (elem?: SVGTextElement): boolean => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = getTextElement(elem);
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    return (textElem.getAttribute('font-style') === 'italic');
  }
  return false;
};

const getLetterSpacing = (elem?: SVGTextElement): number => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = getTextElement(elem);
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    const val = textElem.getAttribute('letter-spacing');
    if (val) {
      if (val.toLowerCase().endsWith('em')) {
        return parseFloat(val.slice(0, -2));
      }
      // eslint-disable-next-line no-console
      console.warn('letter-spacing should be em!');
      return 0;
    }
    return 0;
  }
  return 0;
};

const getLineSpacing = (elem: SVGTextElement): string => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = getTextElement(elem);
  if (textElem != null && textElem.tagName === 'text' && selectedElements[1] == null) {
    const val = textElem.getAttribute('data-line-spacing') || '1';
    return val;
  }
  return '1';
};

const renderTspan = (text: SVGTextElement, val?: string) => {
  const tspans = Array.from(text.childNodes).filter((child: Element) => child.tagName === 'tspan') as SVGTextContentElement[];
  const lines = typeof val === 'string' ? val.split('\x0b') : tspans.map((tspan) => tspan.textContent);
  const isVertical = getIsVertical(text);
  const lineSpacing = parseFloat(getLineSpacing(text));
  const charHeight = getFontSize(text);
  const letterSpacing = getLetterSpacing(text);

  for (let i = 0; i < Math.max(lines.length, tspans.length); i += 1) {
    if (i < lines.length) {
      // Add a space for empty line to render select bbox
      if (lines[i] === '') lines[i] = ' ';
      let tspan;
      if (tspans[i]) {
        tspan = tspans[i];
      } else {
        tspan = document.createElementNS(NS.SVG, 'tspan');
        text.appendChild(tspan);
      }
      tspan.textContent = lines[i];
      tspan.setAttribute('vector-effect', 'non-scaling-stroke');
      if (isVertical) {
        const x = [];
        const y = [];
        const xPos = Number(text.getAttribute('x')) - i * lineSpacing * charHeight;
        let yPos = Number(text.getAttribute('y'));
        for (let j = 0; j < lines[i].length; j += 1) {
          x.push(xPos.toFixed(2));
          y.push(yPos.toFixed(2));
          yPos += (1 + letterSpacing) * charHeight;// text spacing
        }
        tspan.setAttribute('x', x.join(' '));
        tspan.setAttribute('y', y.join(' '));
      } else {
        tspan.setAttribute('x', text.getAttribute('x'));
        tspan.setAttribute('y', Number(text.getAttribute('y')) + i * lineSpacing * charHeight);
        tspan.textContent = lines[i];
        text.appendChild(tspan);
      }
    } else if (tspans[i]) {
      tspans[i].remove();
    }
  }
};

/**
 * Render text element
 * @param text text element
 * @param val text to display, break line with \x0b, use current text content if not provided
 * @param showGrips show grip or not
 */
const renderMultiLineText = (text: SVGTextElement, val?: string, showGrips?: boolean): void => {
  if (!text) {
    return;
  }
  renderTspan(text, val);
  svgedit.recalculate.recalculateDimensions(text);
  if (showGrips) {
    const selectorManager = svgedit.select.getSelectorManager();
    selectorManager.requestSelector(text).resize();
  }
};

const setBold = (val: boolean): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const selected = selectedElements[0];
  if (selected != null && selected.tagName === 'text' && selectedElements[1] == null) {
    svgCanvas.changeSelectedAttribute('font-weight', val ? 'bold' : 'normal');
  }
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
};

/**
 * Set the new font family, in macOS value will be postscript to make text correctly rendered
 * @param val New font family
 * @param isSubCmd Whether this operation is a sub command or a sole command
 */
const setFontFamily = (val: string, isSubCmd = false): ICommand => {
  const selectedElements = svgCanvas.getSelectedElems();
  let cmd = null;
  if (window.os !== 'MacOS') curText.font_family = val;
  if (isSubCmd) {
    svgCanvas.undoMgr.beginUndoableChange('font-family', selectedElements);
    svgCanvas.changeSelectedAttributeNoUndo('font-family', val, selectedElements);
    cmd = svgCanvas.undoMgr.finishUndoableChange();
  } else {
    svgCanvas.changeSelectedAttribute('font-family', val);
  }
  if (selectedElements[0] && !selectedElements[0].textContent) {
    textActions.setCursor();
  }
  return cmd;
};

/**
 * Set the data font family (Used for MacOS only)
 * In mac font-family would be set to font-postscript to make sure text would be rendered correctly.
 * So addition attribution is needed to record it's font family data.
 * @param val New font family
 * @param isSubCmd Whether this operation is a sub command or a sole command
 */
const setFontFamilyData = (val: string, isSubCmd = false): ICommand => {
  const selectedElements = svgCanvas.getSelectedElems();
  let cmd = null;
  curText.font_family = val;
  if (isSubCmd) {
    svgCanvas.undoMgr.beginUndoableChange('data-font-family', selectedElements);
    svgCanvas.changeSelectedAttributeNoUndo('data-font-family', val, selectedElements);
    cmd = svgCanvas.undoMgr.finishUndoableChange();
  } else {
    svgCanvas.changeSelectedAttribute('data-font-family', val);
  }
  return cmd;
};

const setFontPostscriptName = (val: string, isSubCmd: boolean): ICommand => {
  let cmd = null;
  curText.font_postscriptName = val;
  if (isSubCmd) {
    const selectedElements = svgCanvas.getSelectedElems();
    svgCanvas.undoMgr.beginUndoableChange('font-postscript', selectedElements);
    svgCanvas.changeSelectedAttributeNoUndo('font-postscript', val, selectedElements);
    cmd = svgCanvas.undoMgr.finishUndoableChange();
  } else {
    svgCanvas.changeSelectedAttribute('font-postscript', val);
  }
  return cmd;
};

const setFontSize = (val: number): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = selectedElements[0];
  curText.font_size = val;
  svgCanvas.changeSelectedAttribute('font-size', val);
  textActions.setFontSize(val);
  if (!textElem.textContent) {
    textActions.setCursor();
  }
  renderMultiLineText(textElem);
};

const setFontWeight = (fontWeight: number, isSubCmd: boolean): ICommand => {
  const selectedElements = svgCanvas.getSelectedElems();
  const selected = selectedElements[0];
  let cmd = null;
  if (selected != null && selected.tagName === 'text' && selectedElements[1] == null) {
    if (isSubCmd) {
      svgCanvas.undoMgr.beginUndoableChange('font-weight', [selected]);
      svgCanvas.changeSelectedAttributeNoUndo('font-weight', fontWeight || 'normal', [selected]);
      cmd = svgCanvas.undoMgr.finishUndoableChange();
    } else {
      svgCanvas.changeSelectedAttribute('font-weight', fontWeight || 'normal');
    }
  }
  if (!selected.textContent) {
    textActions.setCursor();
  }
  return cmd;
};

const setIsVertical = (val: boolean): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const elem = selectedElements[0];
  svgCanvas.changeSelectedAttribute('data-verti', val);
  if (!elem.textContent) {
    textActions.setCursor();
  }
  textActions.setIsVertical(val);
  const angle = svgedit.utilities.getRotationAngle(elem);
  svgCanvas.setRotationAngle(0, true, elem);
  renderMultiLineText(elem);
  svgCanvas.setRotationAngle(angle, true, elem);
  svgEditor.updateContextPanel();
};

const setItalic = (val: boolean, isSubCmd = false): ICommand => {
  const selectedElements = svgCanvas.getSelectedElems();
  const selected = selectedElements[0];
  let cmd = null;
  if (selected != null && selected.tagName === 'text' && selectedElements[1] == null) {
    if (isSubCmd) {
      svgCanvas.undoMgr.beginUndoableChange('font-style', [selected]);
      svgCanvas.changeSelectedAttributeNoUndo('font-style', val ? 'italic' : 'normal', [selected]);
      cmd = svgCanvas.undoMgr.finishUndoableChange();
    } else {
      svgCanvas.changeSelectedAttribute('font-style', val ? 'italic' : 'normal');
    }
  }
  if (!selectedElements[0].textContent) {
    textActions.setCursor();
  }
  return cmd;
};

const setLetterSpacing = (val: number): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const elem = selectedElements[0];
  if (elem != null && elem.tagName === 'text' && selectedElements[1] == null) {
    svgCanvas.changeSelectedAttribute('letter-spacing', val ? `${val.toString()}em` : '0em');
    renderMultiLineText(selectedElements[0]);
  }
  if (!elem.textContent) {
    textActions.setCursor();
  }
};

const setLineSpacing = (val: number): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const elem = selectedElements[0];
  svgCanvas.changeSelectedAttribute('data-line-spacing', val);
  if (!elem || !elem.textContent) {
    textActions.setCursor();
  }
  const angle = svgedit.utilities.getRotationAngle(elem);
  svgCanvas.setRotationAngle(0, true, elem);
  renderMultiLineText(elem);
  svgCanvas.setRotationAngle(angle, true, elem);
};

/**
 * Updates the text element with the given string
 * @param val new text value
 */
const setTextContent = (val: string): void => {
  const selectedElements = svgCanvas.getSelectedElems();
  const textElem = selectedElements[0];
  renderMultiLineText(textElem, val, true);
  textActions.init();
  textActions.setCursor();
};

export default {
  updateCurText,
  useDefaultFont,
  getCurText,
  getBold,
  setBold,
  getFontFamily,
  setFontFamily,
  getFontFamilyData,
  setFontFamilyData,
  getFontPostscriptName,
  setFontPostscriptName,
  getFontSize,
  setFontSize,
  getFontWeight,
  setFontWeight,
  getIsVertical,
  setIsVertical,
  getItalic,
  setItalic,
  getLineSpacing,
  setLineSpacing,
  getLetterSpacing,
  setLetterSpacing,
  setTextContent,
  renderMultiLineText,
};
