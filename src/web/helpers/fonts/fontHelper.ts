import getUtilWS from 'helpers/api/utils-ws';
import i18n from 'helpers/i18n';
import localFontHelper from 'implementations/localFontHelper';
import progressCaller from 'app/actions/progress-caller';
import { FontDescriptor, FontDescriptorKeys, FontHelper, WebFont } from 'interfaces/IFont';

import fontNameMap from './fontNameMap';
import googleFonts from './googleFonts';
import monotypeFonts from './monotypeFonts';
import previewSrcMap from './fontPreviewSrc';
import webFonts from './webFonts';

const fontDirectory = '/usr/share/fonts/truetype/beam-studio/';
let previewSourceMap = previewSrcMap;
let availableFonts: FontDescriptor[] | null = null;

const getFonts = async () => {
  const localFonts = localFontHelper.getAvailableFonts();
  const activeLang = i18n.getActiveLang();
  const googleLangFonts = googleFonts.getAvailableFonts(activeLang);
  googleFonts.applyStyle(googleLangFonts);
  const webLangFonts = webFonts.getAvailableFonts(activeLang);
  webFonts.applyStyle(webLangFonts);
  const { monotypeLangFonts, monotypePreviewSrcMap } = await monotypeFonts.getAvailableFonts(
    activeLang
  );
  previewSourceMap = { ...previewSrcMap, ...monotypePreviewSrcMap };
  availableFonts = [...localFonts, ...googleLangFonts, ...webLangFonts, ...monotypeLangFonts];
  return availableFonts;
};

const getAvailableFonts = async () => availableFonts || (await getFonts());

const findFont = async (fontDescriptor: FontDescriptor): Promise<FontDescriptor> => {
  const localRes = localFontHelper.findFont(fontDescriptor);
  if (
    localRes &&
    (localRes.family === fontDescriptor.family ||
      localRes.postscriptName === fontDescriptor.postscriptName)
  )
    return localRes;
  // eslint-disable-next-line no-param-reassign
  fontDescriptor.style = fontDescriptor.style || 'Regular';
  let match = await getAvailableFonts();
  let font = match[0];
  if (fontDescriptor.postscriptName) {
    const filtered = match.filter((f) => f.postscriptName === fontDescriptor.postscriptName);
    if (filtered.length) match = filtered;
    font = filtered[0] || font;
  }
  if (fontDescriptor.family) {
    const filtered = match.filter((f) => f.family === fontDescriptor.family);
    if (filtered.length) match = filtered;
    font = filtered[0] || font;
  }
  if ('italic' in fontDescriptor && fontDescriptor.italic !== undefined) {
    const filtered = match.filter((f) => f.italic === fontDescriptor.italic);
    if (filtered.length) match = filtered;
    font = filtered[0] || font;
  }
  if (fontDescriptor.style) {
    const filtered = match.filter((f) => f.style === fontDescriptor.style);
    if (filtered.length) match = filtered;
    font = filtered[0] || font;
  }
  if (fontDescriptor.weight) {
    const filtered = match.filter((f) => f.weight === fontDescriptor.weight);
    if (filtered.length) match = filtered;
    font = filtered[0] || font;
  }
  return font;
};

const findFonts = async (fontDescriptor: FontDescriptor): Promise<FontDescriptor[]> => {
  const localRes = localFontHelper.findFonts(fontDescriptor);
  if (localRes.length > 0) return localRes;
  const fonts = await getAvailableFonts();
  const matchFamily = fontDescriptor.family
    ? fonts.filter((font) => font.family === fontDescriptor.family)
    : fonts;
  const match = matchFamily.filter((font) => {
    const keys = Object.keys(fontDescriptor);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i] as FontDescriptorKeys;
      if (font[key] !== fontDescriptor[key]) {
        return false;
      }
    }
    return true;
  });
  return match;
};

export default {
  findFont,
  findFonts,
  getAvailableFonts,
  getFontName(font: FontDescriptor): string {
    if (font.family && font.family in fontNameMap) {
      return fontNameMap[font.family] || font.family;
    }
    if (!font.path) {
      return font.family;
    }
    return localFontHelper.getFontName(font) || font.family;
  },
  async getWebFontAndUpload(postscriptName: string) {
    const utilWS = getUtilWS();
    const font = (await getAvailableFonts()).find(
      (f) => f.postscriptName === postscriptName
    ) as WebFont;
    const fileName = font?.fileName || `${postscriptName}.ttf`;
    const isMonotype = font && 'hasLoaded' in font;
    if (isMonotype) return false;
    const fontPath = `${fontDirectory}${fileName}`;
    const isExisting = await utilWS.checkExist(fontPath);
    if (!isExisting) {
      let isCanceled = false;
      let message = i18n.lang.beambox.right_panel.object_panel.actions_panel.fetching_web_font;
      await progressCaller.openSteppingProgress({
        id: 'fetch-web-font',
        message,
        onCancel: () => {
          isCanceled = true;
        },
      });
      const { protocol } = window.location;
      const url = `${protocol}//beam-studio-web.s3.ap-northeast-1.amazonaws.com/fonts/${fileName}`;
      let resp = (await fetch(url, {
        mode: 'cors',
      })) as Response;
      const contentType = resp.headers.get('content-type') as string;
      if (contentType === 'application/json') {
        console.error(await resp.json());
        progressCaller.popById('fetch-web-font');
        return false;
      }
      const contentLength = resp.headers.get('content-length') as string;
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      // getting progress of fetch
      resp = new Response(
        new ReadableStream({
          async start(controller) {
            const reader = resp.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }
            let done = false;
            while (!done) {
              // eslint-disable-next-line no-await-in-loop
              const result = await reader.read();
              done = result.done;
              if (done) break;
              const { value } = result;
              if (value) {
                loaded += value.byteLength;
                progressCaller.update('fetch-web-font', {
                  percentage: (loaded / total) * 100,
                });
              }
              controller.enqueue(value);
            }
            controller.close();
          },
        })
      );
      if (resp.status !== 200) {
        progressCaller.popById('fetch-web-font');
        return false;
      }
      const blob = await resp.blob();
      if (isCanceled) {
        progressCaller.popById('fetch-web-font');
        return false;
      }
      message = i18n.lang.beambox.right_panel.object_panel.actions_panel.uploading_font_to_machine;
      progressCaller.update('fetch-web-font', { message, percentage: 0 });
      try {
        const res = await utilWS.uploadTo(blob, fontPath, (progress: number) => {
          progressCaller.update('fetch-web-font', {
            percentage: 100 * progress,
          });
        });
        progressCaller.popById('fetch-web-font');
        if (!res || isCanceled) return false;
      } catch (e) {
        progressCaller.popById('fetch-web-font');
        return false;
      }
    }
    return true;
  },
  getWebFontPreviewUrl: (fontFamily: string) => previewSourceMap[fontFamily] || null,
  applyMonotypeStyle: monotypeFonts.applyStyle,
  getMonotypeUrl: monotypeFonts.getUrlWithToken,
} as FontHelper;
