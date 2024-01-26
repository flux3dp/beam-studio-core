/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import * as fontkit from 'fontkit';
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import fontHelper from 'implementations/fontHelper';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import Progress from 'app/actions/progress-caller';
import SvgLaserParser from 'helpers/api/svg-laser-parser';
import storage from 'implementations/storage';
import textPathEdit from 'app/actions/beambox/textPathEdit';
import weldPath from 'helpers/weldPath';
import { FontDescriptor, IFont, IFontQuery, WebFont } from 'interfaces/IFont';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
let svgedit;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const { $ } = window;

const svgWebSocket = SvgLaserParser({ type: 'svgeditor' });
const LANG = i18n.lang.beambox.object_panels;
const usePostscriptAsFamily = window.os === 'MacOS' && window.FLUX.version !== 'web';

const fontObjCache = new Map<string, fontkit.Font>();

enum SubstituteResult {
  DO_SUB = 2,
  DONT_SUB = 1,
  CANCEL_OPERATION = 0,
}

enum ConvertResult {
  CONTINUE = 2,
  UNSUPPORT = 1,
  CANCEL_OPERATION = 0,
}

let tempPaths = [];

// a simple memoize function that takes in a function
// and returns a memoized function
const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const n = args[0]; // just taking one argument here
    if (n in cache) {
      // console.log('Fetching from cache');
      return cache[n];
    }
    // console.log('Calculating result');
    const result = fn(n);
    cache[n] = result;
    return result;
  };
};

// TODO: Fix config
let fontNameMapObj: { [key: string]: string } = storage.get('font-name-map') || {};
if (fontNameMapObj.navigatorLang !== navigator.language) {
  fontNameMapObj = {};
}
const fontNameMap = new Map<string, string>();
const availableFontFamilies = (async function requestAvailableFontFamilies() {
  // get all available fonts in user PC
  const fonts = await fontHelper.getAvailableFonts();
  fonts.forEach((font) => {
    if (!fontNameMap.get(font.family)) {
      let fontName = font.family;
      if (fontNameMapObj[font.family]) {
        fontName = fontNameMapObj[font.family];
      } else {
        fontName = fontHelper.getFontName(font);
      }

      if (typeof fontName === 'string') {
        fontNameMap.set(font.family, fontName);
      } else {
        fontNameMap.set(font.family, font.family);
      }
    }
  });

  // make it unique
  const fontFamilySet = new Set<string>();
  fonts.map((font) => fontFamilySet.add(font.family));

  // transfer to array and sort!
  return Array.from(fontFamilySet).sort((a, b) => {
    if (a?.toLowerCase?.() < b?.toLowerCase?.()) {
      return -1;
    }
    if (a?.toLowerCase?.() > b?.toLowerCase?.()) {
      return 1;
    }
    return 0;
  });
})();

fontNameMap.forEach((value: string, key: string) => {
  fontNameMapObj[key] = value;
});
fontNameMapObj.navigatorLang = navigator.language;
storage.set('font-name-map', fontNameMapObj);

const getFontOfPostscriptName = memoize(async (postscriptName: string) => {
  if (window.os === 'MacOS') {
    const font = await fontHelper.findFont({ postscriptName });
    return font;
  }
  const allFonts = await fontHelper.getAvailableFonts();
  const fit = allFonts.filter((f) => f.postscriptName === postscriptName);
  console.log(fit);
  if (fit.length > 0) {
    return fit[0];
  }
  return allFonts[0];
});

const init = () => {
  getFontOfPostscriptName('ArialMT');
};
init();

const requestFontsOfTheFontFamily = memoize(async (family: string) => {
  const fonts = await fontHelper.findFonts({ family });
  return Array.from(fonts);
});

const requestFontByFamilyAndStyle = async (opts: IFontQuery): Promise<IFont> => {
  const font = await fontHelper.findFont({
    family: opts.family,
    style: opts.style,
    weight: opts.weight,
    italic: opts.italic,
  });
  return font;
};

const getFontObj = async (font: WebFont | FontDescriptor): Promise<fontkit.Font | undefined> => {
  const { postscriptName } = font;
  let fontObj = fontObjCache.get(postscriptName);
  if (!fontObj) {
    if ((font as FontDescriptor).path) {
      fontObj = fontHelper.getLocalFont(font);
    } else {
      const { protocol } = window.location;
      const fileName = (font as WebFont).fileName || `${postscriptName}.ttf`;
      let url = `${protocol}//beam-studio-web.s3.ap-northeast-1.amazonaws.com/fonts/${fileName}`;
      if ('hasLoaded' in font) {
        const monotypeUrl = await fontHelper.getMonotypeUrl(postscriptName);
        if (monotypeUrl) url = monotypeUrl;
      }
      const data = await fetch(url, { mode: 'cors' });
      fontObj = fontkit.create(Buffer.from(await data.arrayBuffer()));
    }
    if (fontObj) {
      fontObjCache.set(postscriptName, fontObj);
    }
  }
  return fontObj;
};

const calculateFontPath = async (textElem: Element): Promise<string> => {
  const postscriptName = textElem.getAttribute('font-postscript');
  const fontSize = +textElem.getAttribute('font-size');
  const letterSpacing = textElem.getAttribute('letter-spacing');
  const letterSpacingSize = letterSpacing
    ? +letterSpacing.slice(0, letterSpacing.length - 2) * fontSize
    : 0;
  const font = await getFontOfPostscriptName(postscriptName);
  const fontObj = await getFontObj(font);
  if (!fontObj) {
    Alert.popUpError({ message: `tUnable to get font ${postscriptName}` });
    return '';
  }
  const sizeRatio = fontSize / fontObj.unitsPerEm;

  let d = '';
  const textPaths = textElem.querySelectorAll('textPath');
  textPaths.forEach((textPath) => {
    let alignOffset = 0;
    const text = textPath.textContent;
    const alignmentBaseline = textPath.getAttribute('alignment-baseline');
    const dominantBaseline = textPath.getAttribute('dominant-baseline');
    if (alignmentBaseline || dominantBaseline) {
      textPath.textContent = 'i';
      const { x, y } = textPath.getBBox();
      textPath.removeAttribute('alignment-baseline');
      textPath.removeAttribute('dominant-baseline');
      const { x: x2, y: y2 } = textPath.getBBox();
      alignOffset = Math.hypot(x - x2, y - y2);
      textPath.setAttribute('alignment-baseline', alignmentBaseline);
      textPath.setAttribute('dominant-baseline', dominantBaseline);
      textPath.textContent = text;
    }

    const run = fontObj.layout(text);
    d += run.glyphs
      .map((char, i) => {
        const start = textPath.getStartPositionOfChar(i);
        const end = textPath.getStartPositionOfChar(i);
        if ([start.x, start.y, end.x, end.y].every((v) => v === 0)) return '';
        const rot = (textPath.getRotationOfChar(i) / 180) * Math.PI;
        return char.path
          .scale(sizeRatio, -sizeRatio)
          .translate(0, alignOffset)
          .rotate(rot)
          .translate(start.x, start.y)
          .toSVG();
      })
      .join('');
  });

  const tspans = textElem.querySelectorAll('tspan');
  tspans.forEach((tspan) => {
    const text = tspan.textContent;
    const xArry = tspan
      .getAttribute('x')
      .split(' ')
      .map((v) => +v);
    const yArry = tspan
      .getAttribute('y')
      .split(' ')
      .map((v) => +v);

    let fontX = 0;
    let canvasX = 0;
    let canvasY = 0;
    const run = fontObj.layout(text);
    d += run.glyphs
      .map((char, i) => {
        const x = xArry[i];
        const y = yArry[i];
        if (x && y) {
          fontX = 0;
          canvasX = x;
          canvasY = y;
        }
        const svg = char.path
          .translate(fontX, 0)
          .scale(sizeRatio, -sizeRatio)
          .translate(canvasX, canvasY)
          .toSVG();
        fontX += char.advanceWidth;
        canvasX += letterSpacingSize;
        return svg;
      })
      .join('');
  });

  return d;
};

const substitutedFont = async (textElement: Element) => {
  const originFont = await getFontOfPostscriptName(textElement.getAttribute('font-postscript'));
  const fontFamily = textElement.getAttribute('font-family');
  const text = textElement.textContent;

  // Escape for Whitelists
  const whiteList = ['標楷體'];
  const whiteKeyWords = ['華康', 'Adobe', '文鼎'];
  if (whiteList.indexOf(fontFamily) >= 0) {
    return { font: originFont };
  }
  for (let i = 0; i < whiteKeyWords.length; i += 1) {
    const keyword = whiteKeyWords[i];
    if (fontFamily && fontFamily.indexOf(keyword) >= 0) {
      return { font: originFont };
    }
  }
  // if only contain basic character (123abc!@#$...), don't substitute.
  // because my Mac cannot substituteFont properly handing font like 'Windings'
  // but we have to subsittue text if text contain both English and Chinese
  const textOnlyContainBasicLatin = Array.from(text).every(
    (char: string) => char.charCodeAt(0) <= 0x007f
  );
  if (textOnlyContainBasicLatin) {
    return { font: originFont };
  }
  // array of used family which are in the text

  const originPostscriptName = originFont.postscriptName;
  const unsupportedChar = [];
  const fontOptions: { [postscriptName: string]: FontDescriptor } = {};
  const textContent = Array.from(text);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < textContent.length; i++) {
    const char = textContent[i];
    // eslint-disable-next-line no-await-in-loop
    const sub = await fontHelper.substituteFont(originPostscriptName, char);
    if (sub.postscriptName !== originPostscriptName) unsupportedChar.push(char);
    if (!fontOptions[sub.postscriptName]) fontOptions[sub.postscriptName] = sub;
  }
  const fontList = Object.values(fontOptions);

  if (fontList.length === 1) {
    return {
      font: fontList[0],
      unsupportedChar,
    };
  }
  // Test all found fonts if they contain all
  for (let i = 0; i < fontList.length; i += 1) {
    let allFit = true;
    for (let j = 0; j < text.length; j += 1) {
      // eslint-disable-next-line no-await-in-loop
      const foundfont = await fontHelper.substituteFont(fontList[i].postscriptName, text[j]);
      if (fontList[i].postscriptName !== foundfont.postscriptName) {
        allFit = false;
        break;
      }
    }
    if (allFit) {
      console.log(`Find ${fontList[i].postscriptName} fit for all char`);
      return {
        font: fontList[i],
        unsupportedChar,
      };
    }
  }
  console.log('Cannot find a font fit for all');
  return {
    font: fontList.filter((font) => font.family !== fontFamily)[0],
    unsupportedChar,
  };
};

const showSubstitutedFamilyPopup = (textElement: Element, newFont, origFont, unsupportedChar) =>
  new Promise<SubstituteResult>((resolve) => {
    const message = sprintf(
      LANG.text_to_path.font_substitute_pop,
      textElement.textContent,
      unsupportedChar.join(', '),
      fontNameMap.get(origFont),
      fontNameMap.get(newFont)
    );
    const buttonLabels = [
      i18n.lang.alert.confirm,
      LANG.text_to_path.use_current_font,
      i18n.lang.alert.cancel,
    ];
    const callbacks = [
      () => resolve(SubstituteResult.DO_SUB),
      () => resolve(SubstituteResult.DONT_SUB),
      () => resolve(SubstituteResult.CANCEL_OPERATION),
    ];
    Alert.popUp({
      type: AlertConstants.SHOW_POPUP_WARNING,
      message,
      buttonLabels,
      callbacks,
      primaryButtonIndex: 0,
    });
  });

const calculateFilled = (textElement: Element) => {
  if (parseInt(textElement.getAttribute('fill-opacity'), 10) === 0) {
    return false;
  }
  const fillAttr = textElement.getAttribute('fill');
  if (['#fff', '#ffffff', 'none'].includes(fillAttr)) {
    return false;
  }
  if (fillAttr || fillAttr === null) {
    return true;
  }
  return false;
};

const setTextPostscriptnameIfNeeded = async (textElement: Element) => {
  if (!textElement.getAttribute('font-postscript')) {
    const font = await requestFontByFamilyAndStyle({
      family: textElement.getAttribute('font-family'),
      weight: parseInt(textElement.getAttribute('font-weight'), 10),
      italic: textElement.getAttribute('font-style') === 'italic',
      style: null,
    });
    textElement.setAttribute('font-postscript', font.postscriptName);
  }
};

const convertTextToPath = async (
  textElement: Element,
  opts?: { isTempConvert?: boolean; weldingTexts?: boolean }
): Promise<ConvertResult> => {
  if (!textElement.textContent) {
    return ConvertResult.CONTINUE;
  }
  await Progress.openNonstopProgress({ id: 'parsing-font', message: LANG.wait_for_parsing_font });
  const { isTempConvert, weldingTexts } = opts || { isTempConvert: false, weldingTexts: false };

  await setTextPostscriptnameIfNeeded(textElement);
  let hasUnsupportedFont = false;
  const batchCmd = new history.BatchCommand('Text to Path');
  const origFontFamily = textElement.getAttribute('font-family');
  const origFontPostscriptName = textElement.getAttribute('font-postscript');
  if (BeamboxPreference.read('font-substitute') !== false) {
    const { font: newFont, unsupportedChar } = await substitutedFont(textElement);
    if (
      newFont.postscriptName !== origFontPostscriptName &&
      unsupportedChar &&
      unsupportedChar.length > 0
    ) {
      hasUnsupportedFont = true;
      const familyName = usePostscriptAsFamily
        ? textElement.getAttribute('data-font-family')
        : origFontFamily;
      const doSub = await showSubstitutedFamilyPopup(
        textElement,
        newFont.family,
        familyName,
        unsupportedChar
      );
      if (doSub === SubstituteResult.DO_SUB) {
        svgCanvas.undoMgr.beginUndoableChange('font-family', [textElement]);
        textElement.setAttribute('font-family', newFont.family);
        batchCmd.addSubCommand(svgCanvas.undoMgr.finishUndoableChange());
        svgCanvas.undoMgr.beginUndoableChange('font-postscript', [textElement]);
        textElement.setAttribute('font-postscript', newFont.postscriptName);
        batchCmd.addSubCommand(svgCanvas.undoMgr.finishUndoableChange());
      } else if (doSub === SubstituteResult.CANCEL_OPERATION) {
        Progress.popById('parsing-font');
        return ConvertResult.CANCEL_OPERATION;
      }
    }
  }
  if (usePostscriptAsFamily) {
    svgCanvas.undoMgr.beginUndoableChange('font-family', [textElement]);
    textElement.setAttribute('font-family', textElement.getAttribute('font-postscript'));
    batchCmd.addSubCommand(svgCanvas.undoMgr.finishUndoableChange());
  }
  console.log(textElement.getAttribute('font-family'), textElement.getAttribute('font-postscript'));

  textElement.removeAttribute('stroke-width');
  const isFilled = calculateFilled(textElement);
  let color = textElement.getAttribute('stroke');
  color = color !== 'none' ? color : textElement.getAttribute('fill');
  const transform = textElement.getAttribute('transform');

  let d = await calculateFontPath(textElement);

  if (d) {
    if (weldingTexts) {
      d = weldPath(d);
    }
    const newPathId = svgCanvas.getNextId();
    const path = document.createElementNS(svgedit.NS.SVG, 'path');
    path.setAttribute('id', newPathId);
    path.setAttribute('d', d);
    path.setAttribute('transform', transform);
    path.setAttribute('fill', isFilled ? color : 'none');
    path.setAttribute('fill-opacity', isFilled ? '1' : '0');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-opacity', '1');
    path.setAttribute('stroke-dasharray', 'none');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    textElement.parentNode.insertBefore(path, textElement.nextSibling);
    path.addEventListener('mouseover', svgCanvas.handleGenerateSensorArea);
    path.addEventListener('mouseleave', svgCanvas.handleGenerateSensorArea);
    svgCanvas.pathActions.fixEnd(path);
    batchCmd.addSubCommand(new history.InsertElementCommand(path));

    if (isTempConvert) {
      textElement.setAttribute('display', 'none');
      textElement.setAttribute('font-family', origFontFamily);
      textElement.setAttribute('font-postscript', origFontPostscriptName);
      textElement.setAttribute('stroke-width', '2');
      textElement.setAttribute('data-path-id', newPathId);
      tempPaths.push(path);
    }
    svgedit.recalculate.recalculateDimensions(path);
  }

  if (!isTempConvert) {
    const parent = textElement.parentNode;
    const { nextSibling } = textElement;
    const elem = parent.removeChild(textElement);
    batchCmd.addSubCommand(new history.RemoveElementCommand(elem, nextSibling, parent));

    if (textElement.getAttribute('data-textpath')) {
      const cmd = textPathEdit.ungroupTextPath(parent as SVGGElement);
      if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    }

    if (!batchCmd.isEmpty()) {
      svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    }
  }
  Progress.popById('parsing-font');
  return hasUnsupportedFont ? ConvertResult.UNSUPPORT : ConvertResult.CONTINUE;
};

const tempConvertTextToPathAmoungSvgcontent = async () => {
  let isAnyFontUnsupported = false;
  const texts = [
    ...document.querySelectorAll('#svgcontent g.layer:not([display="none"]) text'),
    ...document.querySelectorAll('#svg_defs text'),
  ];
  for (let i = 0; i < texts.length; i += 1) {
    const el = texts[i];
    // eslint-disable-next-line no-await-in-loop
    const convertRes = await convertTextToPath(el, { isTempConvert: true });
    if (convertRes === ConvertResult.CANCEL_OPERATION) {
      return false;
    }
    if (convertRes === ConvertResult.UNSUPPORT) {
      isAnyFontUnsupported = true;
    }
  }

  if (isAnyFontUnsupported && !AlertConfig.read('skip_check_thumbnail_warning')) {
    await new Promise<void>((resolve) => {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_WARNING,
        message: LANG.text_to_path.check_thumbnail_warning,
        callbacks: () => resolve(null),
        checkbox: {
          text: i18n.lang.beambox.popup.dont_show_again,
          callbacks: () => {
            AlertConfig.write('skip_check_thumbnail_warning', true);
            resolve(null);
          },
        },
      });
    });
  }
  return true;
};

const revertTempConvert = async (): Promise<void> => {
  const texts = [
    ...$('#svgcontent').find('text').toArray(),
    ...$('#svg_defs').find('text').toArray(),
  ];
  texts.forEach((t) => {
    $(t).removeAttr('display');
  });
  for (let i = 0; i < tempPaths.length; i += 1) {
    tempPaths[i].remove();
  }
  tempPaths = [];
};

export default {
  availableFontFamilies,
  fontNameMap,
  requestFontsOfTheFontFamily,
  requestFontByFamilyAndStyle,
  convertTextToPath,
  tempConvertTextToPathAmoungSvgcontent,
  revertTempConvert,
  getFontOfPostscriptName,
};
