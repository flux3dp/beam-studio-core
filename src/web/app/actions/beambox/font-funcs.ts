/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import fontkit from 'fontkit';
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import communicator from 'implementations/communicator';
import fontScanner from 'implementations/fontScanner';
import history from 'app/svgedit/history';
import i18n from 'helpers/i18n';
import Progress from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import SvgLaserParser from 'helpers/api/svg-laser-parser';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IFont, IFontQuery } from 'interfaces/IFont';

let svgCanvas;
let svgedit;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const { electron, $ } = window;

const svgWebSocket = SvgLaserParser({ type: 'svgeditor' });
const LANG = i18n.lang.beambox.object_panels;

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

const hashCode = (s) => {
  const l = s.length;
  let h = 0;
  let i = 0;
  if (l > 0) {
    while (i < l) {
      // eslint-disable-next-line no-bitwise
      h = (h << 5) - h + s.charCodeAt(i += 1) | 0;
    }
  }
  return Math.abs(h);
};

// TODO: Fix config
let fontNameMapObj: { [key: string]: string } = storage.get('font-name-map') || {};
if (fontNameMapObj.navigatorLang !== navigator.language) {
  fontNameMapObj = {};
}
const fontNameMap = new Map<string, string>();
const availableFontFamilies = (function requestAvailableFontFamilies() {
  // get all available fonts in user PC
  const fonts = communicator.sendSync('GET_AVAILABLE_FONTS');
  fonts.forEach((font) => {
    if (!fontNameMap.get(font.family)) {
      let fontName = font.family;
      if (fontNameMapObj[font.family]) {
        fontName = fontNameMapObj[font.family];
      } else {
        try {
          let fontInfo = fontkit.openSync(font.path);
          if (fontInfo.fonts && fontInfo.fonts[0]) {
            fontInfo = fontInfo.fonts.find((f) => {
              if (f.familyName === font.family) return true;
              if (f.name.records.fontFamily[navigator.language] === font.family) return true;
              return false;
            }) || fontInfo.fonts[0];
          }
          if (fontInfo) {
            const firstNotEn = Object.keys(fontInfo.name.records.fontFamily).find((key) => key !== 'en');
            fontName = (fontInfo.name.records.fontFamily[navigator.language]
              || fontInfo.name.records.fontFamily[firstNotEn]
              || fontInfo.name.records.fontFamily.en
              || fontName);
          }
        } catch (err) {
          console.warn(`Error when get font name of ${font.family}:`, err);
        }
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
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
}());

fontNameMap.forEach((value: string, key: string) => {
  fontNameMapObj[key] = value;
});
fontNameMapObj.navigatorLang = navigator.language;
storage.set('font-name-map', fontNameMapObj);

const getFontOfPostscriptName = memoize((postscriptName) => {
  if (window.os === 'MacOS') {
    const font = fontScanner.findFont({ postscriptName });
    return font;
  }
  const allFonts = fontScanner.getAvailableFonts();
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

const requestFontsOfTheFontFamily = memoize((family) => {
  const fonts = communicator.sendSync('FIND_FONTS', { family });
  return Array.from(fonts);
});
const requestFontByFamilyAndStyle = (opts: IFontQuery): IFont => {
  const font = communicator.sendSync('FIND_FONT', {
    family: opts.family,
    style: opts.style,
    weight: opts.weight,
    italic: opts.italic,
  });
  return font;
};

const substitutedFont = (textElement: Element) => {
  const originFont = getFontOfPostscriptName(textElement.getAttribute('font-postscript'));
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
    (char: string) => char.charCodeAt(0) <= 0x007F,
  );
  if (textOnlyContainBasicLatin) {
    return { font: originFont };
  }
  // array of used family which are in the text

  const originPostscriptName = originFont.postscriptName;
  const unSupportedChar = [];
  const fontList = Array.from(text).map((char) => {
    const sub = fontScanner.substituteFont(originPostscriptName, char);
    if (sub.postscriptName !== originPostscriptName) unSupportedChar.push(char);
    return sub;
  });

  if (fontList.length === 1) {
    return {
      font: fontList[0],
      unSupportedChar,
    };
  }
  // Test all found fonts if they contain all
  for (let i = 0; i < fontList.length; i += 1) {
    let allFit = true;
    for (let j = 0; j < text.length; j += 1) {
      const foundfont = fontScanner.substituteFont(fontList[i].postscriptName, text[j]);
      if (fontList[i].postscriptName !== foundfont.postscriptName) {
        allFit = false;
        break;
      }
    }
    if (allFit) {
      console.log(`Find ${fontList[i].postscriptName} fit for all char`);
      return {
        font: fontList[i],
        unSupportedChar,
      };
    }
  }
  console.log('Cannot find a font fit for all');
  return {
    font: (fontList.filter((font) => font.family !== fontFamily))[0],
    unSupportedChar,
  };
};

const showSubstitutedFamilyPopup = (
  textElement: Element, newFont, origFont, unSupportedChar,
) => new Promise<SubstituteResult>(
  (resolve) => {
    const message = sprintf(LANG.text_to_path.font_substitute_pop, textElement.textContent, fontNameMap.get(origFont), unSupportedChar.join(', '), fontNameMap.get(newFont));
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
  },
);

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

const setTextPostscriptnameIfNeeded = (textElement: Element) => {
  if (!textElement.getAttribute('font-postscript')) {
    const font = requestFontByFamilyAndStyle({
      family: textElement.getAttribute('font-family'),
      weight: parseInt(textElement.getAttribute('font-weight'), 10),
      italic: (textElement.getAttribute('font-style') === 'italic'),
      style: null,
    });
    textElement.setAttribute('font-postscript', font.postscriptName);
  }
};

const convertTextToPathFluxsvg = async (
  textElement: Element, bbox, isTempConvert?: boolean,
): Promise<ConvertResult> => {
  if (!textElement.textContent) {
    return ConvertResult.CONTINUE;
  }
  Progress.openNonstopProgress({ id: 'parsing-font', message: LANG.wait_for_parsing_font });

  setTextPostscriptnameIfNeeded(textElement);
  let isUnsupported = false;
  const batchCmd = new history.BatchCommand('Text to Path');
  const origFontFamily = textElement.getAttribute('font-family');
  const origFontPostscriptName = textElement.getAttribute('font-postscript');
  if (BeamboxPreference.read('font-substitute') !== false) {
    const { font: newFont, unSupportedChar } = substitutedFont(textElement);
    if (
      newFont.postscriptName !== origFontPostscriptName
      && unSupportedChar
      && unSupportedChar.length > 0
    ) {
      isUnsupported = true;
      const familyName = window.os === 'MacOS' ? textElement.getAttribute('data-font-family') : origFontFamily;
      const doSub = await showSubstitutedFamilyPopup(
        textElement, newFont.family, familyName, unSupportedChar,
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
  if (window.os === 'MacOS') {
    svgCanvas.undoMgr.beginUndoableChange('font-family', [textElement]);
    textElement.setAttribute('font-family', textElement.getAttribute('font-postscript'));
    batchCmd.addSubCommand(svgCanvas.undoMgr.finishUndoableChange());
  }
  console.log(textElement.getAttribute('font-family'), textElement.getAttribute('font-postscript'));
  textElement.removeAttribute('stroke-width');
  const isFill = calculateFilled(textElement);
  let color = textElement.getAttribute('stroke');
  color = color !== 'none' ? color : textElement.getAttribute('fill');

  await svgWebSocket.uploadPlainTextSVG(textElement, bbox);
  const outputs = await svgWebSocket.divideSVG({ scale: 1, timeout: 15000 });
  if (!outputs.res) {
    console.error('Error when convert text by fluxsvg', outputs.data);
    Alert.popUp({
      type: AlertConstants.SHOW_POPUP_ERROR,
      message: `#846 ${sprintf(LANG.text_to_path.error_when_parsing_text, outputs.data)}`,
    });
    Progress.popById('parsing-font');
    return ConvertResult.CONTINUE;
  }

  const { pathD, transform } = await new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      const svgString = e.target.result as string;
      // console.log(svgString);
      const d = svgString.match(/(?<= d=")[^"]+/g);
      const trans = svgString.match(/(?<= transform=")[^"]+/g);
      resolve({ pathD: d, transform: trans });
    };
    if (isFill) {
      fileReader.readAsText(outputs.data.colors);
    } else {
      fileReader.readAsText(outputs.data.strokes);
    }
  });

  if (pathD) {
    const newPathId = svgCanvas.getNextId();
    const path = document.createElementNS(svgedit.NS.SVG, 'path');
    $(path).attr({
      id: newPathId,
      d: pathD.join(''),
      // Note: Assuming transform matrix for all d are the same
      transform: transform ? transform[0] : '',
      fill: isFill ? color : 'none',
      'fill-opacity': isFill ? 1 : 0,
      stroke: color,
      'stroke-opacity': 1,
      'stroke-dasharray': 'none',
      'vector-effect': 'non-scaling-stroke',
    });
    $(path).insertAfter($(textElement));
    path.addEventListener('mouseover', svgCanvas.handleGenerateSensorArea);
    path.addEventListener('mouseleave', svgCanvas.handleGenerateSensorArea);
    batchCmd.addSubCommand(new history.InsertElementCommand(path));
    // output of fluxsvg will locate at (0,0), so move it.
    svgCanvas.moveElements([bbox.x], [bbox.y], [path], false);

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

    if (!batchCmd.isEmpty()) {
      svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    }
  }
  Progress.popById('parsing-font');
  return isUnsupported ? ConvertResult.UNSUPPORT : ConvertResult.CONTINUE;
};

const requestToConvertTextToPath = async ($textElement, args): Promise<void> => {
  const { isTempConvert } = args;
  const d = $.Deferred();
  const fontStyle = requestFontByFamilyAndStyle({
    family: args.family,
    weight: args.weight,
    style: args.style,
    italic: ($textElement.attr('font-style') === 'italic'),
  }).style;

  const transform = $textElement.attr('transform') || '';

  const letterSpacing = (() => {
    const letterSpacingAttr = $textElement.attr('letter-spacing');
    if (!letterSpacingAttr) {
      return 0;
    }
    return letterSpacingAttr.replace('em', '');
  })();

  // use key (which hash from $textElement html string) to prevent ipc event confliction
  const key = hashCode($textElement.prop('outerHTML'));
  communicator.once('RESOLVE_PATH_D_OF_TEXT' + key, (sender, pathD) => {
    d.resolve(pathD);
  });

  communicator.send('REQUEST_PATH_D_OF_TEXT', {
    text: $textElement.text(),
    x: $textElement.attr('x'),
    y: $textElement.attr('y'),
    fontFamily: $textElement.attr('font-family'),
    fontSize: $textElement.attr('font-size'),
    fontStyle,
    letterSpacing,
    key,
  });
  const pathD = await d;

  const path = document.createElementNS(svgedit.NS.SVG, 'path');

  const isFill = calculateFilled($textElement[0]);
  let color = $textElement.attr('stroke');
  color = color !== 'none' ? color : $textElement.attr('fill');

  $(path).attr({
    id: svgCanvas.getNextId(),
    d: pathD,
    transform,
    fill: isFill ? color : 'none',
    'fill-opacity': isFill ? 1 : 0,
    stroke: color,
    'stroke-opacity': 1,
    'stroke-dasharray': 'none',
    'vector-effect': 'non-scaling-stroke',
  });
  const batchCmd = new history.BatchCommand('Text to Path');
  $(path).insertAfter($textElement);
  $(path)
    .mouseover(svgCanvas.handleGenerateSensorArea)
    .mouseleave(svgCanvas.handleGenerateSensorArea);
  batchCmd.addSubCommand(new history.InsertElementCommand(path));
  if (!isTempConvert) {
    const textElem = $textElement[0];
    const parent = textElem.parentNode;
    const { nextSibling } = textElem;
    const elem = parent.removeChild(textElem);
    batchCmd.addSubCommand(new history.RemoveElementCommand(elem, nextSibling, parent));

    if (!batchCmd.isEmpty()) { svgCanvas.undoMgr.addCommandToHistory(batchCmd); }
  } else {
    $textElement.attr('display', 'none');
    tempPaths.push(path);
  }
  svgedit.recalculate.recalculateDimensions(path);
};

const tempConvertTextToPathAmoungSvgcontent = async () => {
  let isAnyFontUnsupported = false;
  const texts = [...$('#svgcontent').find('text').toArray(), ...$('#svg_defs').find('text').toArray()];
  for (let i = 0; i < texts.length; i += 1) {
    const el = texts[i];
    const bbox = svgCanvas.calculateTransformedBBox($(el)[0]);
    // eslint-disable-next-line no-await-in-loop
    const convertRes = await convertTextToPathFluxsvg(el, bbox, true);
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
  const texts = [...$('#svgcontent').find('text').toArray(), ...$('#svg_defs').find('text').toArray()];
  texts.forEach((t) => {
    $(t).removeAttr('display');
  });
  for (let i = 0; i < tempPaths.length; i += 1) {
    tempPaths[i].remove();
  }
  tempPaths = [];
};

// <Map> family -> fullName
// const fontNameMap = (function requestEachFontFullname() {
//     if (activeLang === 'en') {
//         return new Map(
//             availableFontFamilies.map(family => [family, family])
//         );
//     }

//     const nameMap = new Map([
//         ['Hannotate TC', '手扎體-繁'],
//         ['Hannotate SC', '手扎體-簡'],
//         ['Hiragino Sans GB', '冬青黑體簡體中文'],
//         ['STFangsong', '華文仿宋'],
//         ['STSong', '華文宋體'],
//         ['STXihei', '華文黑體'],
//         ['STKaiti', '華文楷體'],
//         ['Songti TC', '宋體-繁'],
//         ['Songti SC', '宋體-簡'],
//         ['Heiti TC', '黑體-繁'],
//         ['Heiti SC', '黑體-簡'],
//         ['PingFang HK', '蘋方-繁'],
//         ['PingFang TC', '蘋方-繁'],
//         ['PingFang SC', '蘋方-簡'],
//         ['Xingkai TC', '行楷-繁'],
//         ['Xingkai SC', '行楷-簡'],
//         ['Wawati TC', '娃娃體-繁'],
//         ['Wawati SC', '娃娃體-簡'],
//         ['LingWai TC', '凌慧體-繁'],
//         ['LingWai SC', '凌慧體-簡'],
//         ['Baoli TC', '報隸-繁'],
//         ['Baoli SC', '報隸-簡'],
//         ['Yuppy TC', '雅痞-繁'],
//         ['Yuppy SC', '雅痞-簡'],
//         ['Yuanti TC', '圓體-繁'],
//         ['Yuanti SC', '圓體-簡'],
//         ['Kaiti TC', '楷體-繁'],
//         ['Kaiti SC', '楷體-簡'],
//         ['HanziPen TC', '翩翩體-繁'],
//         ['HanziPen SC', '翩翩體-簡'],
//         ['Libian TC', '隸變-繁'],
//         ['Libian SC', '隸變-簡'],
//         ['Weibei TC', '魏碑-繁'],
//         ['Weibei SC', '魏碑-簡'],
//         ['Lantinghei TC', '蘭亭黑-繁'],
//         ['Lantinghei SC', '蘭亭黑-簡'],
//         ['Apple LiSung Light', '蘋果儷細宋'],

//         ['SimSun', '宋體'],
//         ['SimHei', '黑體'],
//         ['Microsoft YaHei', '微軟雅黑'],
//         ['Microsoft JhengHei', '微軟正黑體'],
//         ['NSimSun', '新宋體'],
//         ['PMingLiU', '新细明體'],
//         ['MingLiU', '细明體'],
//         ['DFKai-SB', '標楷體'],
//         ['FangSong', '仿宋'],
//         ['KaiTi', '楷體'],
//         ['FangSong_GB2312', '仿宋_GB2312'],
//         ['KaiTi_GB2312', '楷體_GB2312'],
//         ['STHeiti Light [STXihei]', '華文细黑'],
//         ['STHeiti', '華文黑體'],
//         ['STKaiti', '華文楷體'],
//         ['STSong', '華文宋體'],
//         ['STFangsong', '華文仿宋'],
//         ['LiHei Pro Medium', '儷黑 Pro'],
//         ['LiSong Pro Light', '儷宋 Pro'],
//         ['BiauKai', '標楷體'],
//         ['Apple LiGothic Medium', '蘋果儷中黑'],
//         ['Apple LiSung Light', '蘋果儷細宋'],

//         ['PMingLiU', '新細明體'],
//         ['MingLiU', '細明體'],
//         ['DFKai-SB', '標楷體'],
//         ['SimHei', '黑體'],
//         ['NSimSun', '新宋體'],
//         ['FangSong', '仿宋'],
//         ['KaiTi', '楷體'],
//         ['FangSong_GB2312', '仿宋_GB2312'],
//         ['KaiTi_GB2312', '楷體_GB2312'],
//         ['Microsoft JhengHei', '微軟正黑體'],
//         ['Microsoft YaHei', '微軟雅黑體'],

//         ['LiSu', '隸書'],
//         ['YouYuan', '幼圓'],
//         ['STXihei', '華文细黑'],
//         ['STKaiti', '華文楷體'],
//         ['STSong', '華文宋體'],
//         ['STZhongsong', '華文中宋'],
//         ['STFangsong', '華文仿宋'],
//         ['FZShuTi', '方正舒體'],
//         ['FZYaoti', '方正姚體'],
//         ['STCaiyun', '華文彩云'],
//         ['STHupo', '華文琥珀'],
//         ['STLiti', '華文隸書'],
//         ['STXingkai', '華文行楷'],
//         ['STXinwei', '華文新魏'],
//     ]);

//     return new Map(
//         availableFontFamilies.map(family => {
//             return [family, nameMap.get(family) || family];
//         })
//     );
// })();
export default {
  availableFontFamilies,
  fontNameMap,
  requestFontsOfTheFontFamily,
  requestFontByFamilyAndStyle,
  convertTextToPathFluxsvg,
  tempConvertTextToPathAmoungSvgcontent,
  revertTempConvert,
  getFontOfPostscriptName,
};
