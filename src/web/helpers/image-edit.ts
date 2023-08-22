import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import alertConfig from 'helpers/api/alert-config';
import alertConstants from 'app/constants/alert-constants';
import browser from 'implementations/browser';
import dialogCaller from 'app/actions/dialog-caller';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import imageData from 'helpers/image-data';
import jimpHelper from 'helpers/jimp-helper';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import progress from 'app/actions/progress-caller';
import requirejsHelper from 'helpers/requirejs-helper';
import { axiosFluxId, getDefaultHeader, ResponseWithError } from 'helpers/api/flux-id';
import { deleteElements } from 'app/svgedit/operations/delete';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';
import { moveElements } from 'app/svgedit/operations/move';

import { posterize, trace } from './potrace';

let svgCanvas: ISVGCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const getSelectedElem = (): SVGImageElement => {
  const selectedElements = svgCanvas.getSelectedElems();
  const len = selectedElements.length;
  if (len > 1) {
    return null;
  }
  const element = selectedElements[0] as SVGImageElement;
  if (element.tagName !== 'image') {
    return null;
  }
  return element;
};

const getImageAttributes = (elem: Element) => {
  const imgUrl = elem.getAttribute('origImage') || elem.getAttribute('xlink:href');
  const shading = elem.getAttribute('data-shading') === 'true';
  let threshold = parseInt(elem.getAttribute('data-threshold'), 10);
  if (Number.isNaN(threshold)) {
    threshold = 128;
  }
  return {
    imgUrl,
    shading,
    threshold,
  };
};

const generateBase64Image = (
  imgSrc: string, shading: boolean, threshold: number,
) => new Promise<string>((resolve) => {
  imageData(imgSrc, {
    grayscale: {
      is_rgba: true,
      is_shading: shading,
      threshold,
      is_svg: false,
    },
    isFullResolution: true,
    onComplete(result) {
      resolve(result.pngBase64);
    },
  });
});

const addBatchCommand = (
  commandName: string, elem: Element, changes: { [key: string]: string | number | boolean },
) => {
  const batchCommand: IBatchCommand = new history.BatchCommand(commandName);
  const setAttribute = (key: string, value) => {
    svgCanvas.undoMgr.beginUndoableChange(key, [elem]);
    elem.setAttribute(key, value);
    const cmd = svgCanvas.undoMgr.finishUndoableChange();
    if (!cmd.isEmpty()) {
      batchCommand.addSubCommand(cmd);
    }
  };
  const keys = Object.keys(changes);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    setAttribute(key, changes[key]);
  }
  if (!batchCommand.isEmpty()) {
    svgCanvas.undoMgr.addCommandToHistory(batchCommand);
  }
  return batchCommand;
};

const colorInvert = async (elem?: SVGImageElement): Promise<void> => {
  const element = elem || getSelectedElem();
  if (!element) return;
  progress.openNonstopProgress({
    id: 'photo-edit-processing',
    message: i18n.lang.beambox.photo_edit_panel.processing,
  });
  const { imgUrl, shading, threshold } = getImageAttributes(element);
  const newImgUrl = await jimpHelper.colorInvert(imgUrl);
  if (newImgUrl) {
    const newThreshold = shading ? threshold : 256 - threshold;
    const base64Img = await generateBase64Image(newImgUrl, shading, newThreshold);
    addBatchCommand('Image Edit: invert', element, {
      origImage: newImgUrl,
      'data-threshold': newThreshold,
      'xlink:href': base64Img,
    });
    svgCanvas.selectOnly([element], true);
  }
  progress.popById('photo-edit-processing');
  ObjectPanelController.updateActiveKey(null);
};

const generateStampBevel = async (elem?: SVGImageElement): Promise<void> => {
  const element = elem || getSelectedElem();
  if (!element) return;
  progress.openNonstopProgress({
    id: 'photo-edit-processing',
    message: i18n.lang.beambox.photo_edit_panel.processing,
  });
  const { imgUrl, shading, threshold } = getImageAttributes(element);
  const newImgUrl = await jimpHelper.generateStampBevel(imgUrl, shading ? 128 : threshold);
  if (newImgUrl) {
    const base64Img = await generateBase64Image(newImgUrl, shading, threshold);
    addBatchCommand('Image Edit: bevel', element, {
      origImage: newImgUrl,
      'data-shading': true,
      'data-threshold': 255,
      'xlink:href': base64Img,
    });
    svgCanvas.selectOnly([element], true);
  }
  progress.popById('photo-edit-processing');
  ObjectPanelController.updateActiveKey(null);
};

const traceImage = async (img?: SVGImageElement): Promise<void> => {
  const element = img || getSelectedElem();
  if (!element) return;
  const { imgUrl, shading, threshold } = getImageAttributes(element);
  if (shading) {
    alertCaller.popUp({
      message: i18n.lang.beambox.popup.vectorize_shading_image,
    });
    return;
  }
  progress.openNonstopProgress({
    id: 'vectorize-image',
    message: i18n.lang.beambox.photo_edit_panel.processing,
  });
  const ImageTracer = await requirejsHelper('imagetracer');
  const batchCmd = new history.BatchCommand('Vectorize Image');
  const imgBBox = element.getBBox();
  const angle = svgedit.utilities.getRotationAngle(element);
  const grayScaleUrl = await new Promise((resolve) => imageData(
    imgUrl,
    {
      width: Number(element.getAttribute('width')),
      height: Number(element.getAttribute('height')),
      grayscale: {
        is_rgba: true,
        is_shading: false,
        threshold: shading ? 128 : threshold,
        is_svg: false
      },
      onComplete: (result) => resolve(result.pngBase64),
    }
  ));
  const svgStr = (await new Promise<string>((resolve) => ImageTracer.imageToSVG(
    grayScaleUrl, (str) => resolve(str), 'detailed'
  ))).replace(/<\/?svg[^>]*>/g, '');
  const gId = svgCanvas.getNextId();
  const g = svgCanvas.addSvgElementFromJson<SVGGElement>({ element: 'g', attr: { id: gId } });
  ImageTracer.appendSVGString(svgStr, gId);

  svgCanvas.selectOnly([g]);
  let gBBox = g.getBBox();
  if (imgBBox.width !== gBBox.width) svgCanvas.setSvgElemSize('width', imgBBox.width);
  if (imgBBox.height !== gBBox.height) svgCanvas.setSvgElemSize('height', imgBBox.height);
  gBBox = g.getBBox();
  const dx = (imgBBox.x + 0.5 * imgBBox.width) - (gBBox.x + 0.5 * gBBox.width);
  const dy = (imgBBox.y + 0.5 * imgBBox.height) - (gBBox.y + 0.5 * gBBox.height);
  let d = '';
  for (let i = 0; i < g.childNodes.length; i += 1) {
    const child = g.childNodes[i] as SVGPathElement;
    if (child.getAttribute('opacity') !== '0') {
      d += child.getAttribute('d');
    }
    child.remove();
    i -= 1;
  }
  g.remove();

  if (!d) {
    progress.popById('vectorize-image');
    svgCanvas.selectOnly([element]);
    return;
  }

  const path = svgCanvas.addSvgElementFromJson({
    element: 'path',
    attr: {
      id: svgCanvas.getNextId(),
      fill: '#000000',
      'stroke-width': 1,
      'vector-effect': 'non-scaling-stroke',
    }
  });
  path.setAttribute('d', d);
  moveElements([dx], [dy], [path], false);
  svgCanvas.setRotationAngle(angle, true, path);
  if (svgCanvas.isUsingLayerColor) svgCanvas.updateElementColor(path);
  svgCanvas.selectOnly([path], true);
  batchCmd.addSubCommand(new history.InsertElementCommand(path));
  const cmd = deleteElements([img], true);
  if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
  svgCanvas.addCommandToHistory(batchCmd);
  progress.popById('vectorize-image');
};

const removeBackground = async (elem?: SVGImageElement): Promise<void> => {
  const element = elem || getSelectedElem();
  if (!element) return;
  alertConfig.write('skip_bg_removal_warning', undefined);

  if (!alertConfig.read('skip_bg_removal_warning')) {
    const res = await new Promise<boolean>((resolve) => {
      alertCaller.popUp({
        message: i18n.lang.beambox.right_panel.object_panel.actions_panel.ai_bg_removal_reminder,
        buttonType: alertConstants.CONFIRM_CANCEL,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        checkbox: {
          text: i18n.lang.beambox.popup.dont_show_again,
          callbacks: [
            () => {
              alertConfig.write('skip_bg_removal_warning', true);
              resolve(true);
            },
            () => resolve(false),
          ],
        },
      });
    });
    if (!res) {
      ObjectPanelController.updateActiveKey(null);
      return;
    }
  }

  progress.openNonstopProgress({
    id: 'photo-edit-processing',
    message: i18n.lang.beambox.photo_edit_panel.processing,
  });
  const { imgUrl } = getImageAttributes(element);
  if (!imgUrl) return;
  const imgGet = await fetch(imgUrl);
  const imgData = await imgGet.blob();
  const form = new FormData();
  form.append('image', imgData);

  try {
    const removeResult = await axiosFluxId.post('/api/remove-background', form, {
      withCredentials: true,
      headers: getDefaultHeader(),
      responseType: 'blob',
      timeout: 1000 * 60 * 3, // 3 min
    }) as ResponseWithError;
    if (removeResult.error) {
      alertCaller.popUpError({
        message: `Server Error: ${removeResult.error}`,
      });
      return;
    }
    const contentType = removeResult.headers['content-type'];
    if (contentType === 'application/json') {
      const { status, info, message } = await new Promise<{
        info: string; status: string; message?: string;
      }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const str = e.target.result as string;
          const d = JSON.parse(str);
          resolve(d);
        };
        reader.readAsText(removeResult.data);
      });
      if (status === 'error') {
        if (info === 'NOT_LOGGED_IN') dialogCaller.showLoginDialog();
        else if (info === 'INSUFFICIENT_CREDITS') {
          alertCaller.popUp({
            caption: i18n.lang.beambox.popup.ai_credit.insufficient_credit,
            message: sprintf(
              i18n.lang.beambox.popup.ai_credit.insufficient_credit_msg,
              i18n.lang.beambox.right_panel.object_panel.actions_panel.ai_bg_removal,
            ),
            buttonType: alertConstants.CUSTOM_CANCEL,
            buttonLabels: [i18n.lang.beambox.popup.ai_credit.go],
            callbacks: () => browser.open(i18n.lang.beambox.popup.ai_credit.buy_link),
          });
        } else if (info === 'API_ERROR') alertCaller.popUpError({ message: `API Error: ${message}` });
        else alertCaller.popUpError({ message: `Error: ${info}` });
      }
      return;
    }
    if (contentType !== 'image/png') {
      console.error('unknown response type', contentType);
      alertCaller.popUpError({ message: `Unknown Response Type: ${contentType}` });
      return;
    }
    const blob = removeResult.data as Blob;
    const blobUrl = URL.createObjectURL(blob);
    // 2023/08/11 No compare dialog after discussion, remove this code and BackgroundRemovalPanel after they make sure.
    // const doApply = await new Promise<boolean>((resolve) => {
    //   dialogCaller.showBackgroundRemovalPanel(imgUrl, blobUrl, () => resolve(true), () => resolve(false));
    // });
    // if (!doApply) return;
    const newThreshold = 255;
    const base64Img = await generateBase64Image(blobUrl, true, newThreshold);
    addBatchCommand('Image Edit: Remove background', element, {
      origImage: blobUrl,
      'data-threshold': newThreshold,
      'data-no-bg': 'true',
      'xlink:href': base64Img,
    });
    svgCanvas.selectOnly([element], true);
  } finally {
    ObjectPanelController.updateActiveKey(null);
    progress.popById('photo-edit-processing');
  }
};

const potrace = async (elem?: SVGImageElement): Promise<void> => {
  const element = elem || getSelectedElem();
  if (!element) return;
  progress.openNonstopProgress({
    id: 'potrace',
    message: i18n.lang.beambox.photo_edit_panel.processing,
  });

  const isTransparentBackground = elem.getAttribute('data-no-bg');
  const imgBBox = element.getBBox();
  const imgRotation = svgedit.utilities.getRotationAngle(element);
  let { imgUrl } = getImageAttributes(element);
  if (!imgUrl) return;
  if (isTransparentBackground) {
    imgUrl = await generateBase64Image(imgUrl, false, 254);
  }
  const image = await jimpHelper.urlToImage(imgUrl);

  let final = '';
  if (isTransparentBackground) {
    final = await trace(image, {});
  } else {
    final = await posterize(image, {});
  }

  const svgStr = final.replace(/<\/?svg[^>]*>/g, '');
  const gId = svgCanvas.getNextId();
  const g = svgCanvas.addSvgElementFromJson<SVGGElement>({ element: 'g', attr: { id: gId } });
  const ImageTracer = await requirejsHelper('imagetracer');
  ImageTracer.appendSVGString(svgStr, gId);

  const path = svgCanvas.addSvgElementFromJson({
    element: 'path',
    attr: {
      id: svgCanvas.getNextId(),
      fill: '#000000',
      'stroke-width': 1,
      'vector-effect': 'non-scaling-stroke',
    }
  });
  svgCanvas.selectOnly([g]);
  const dx = imgBBox.x;
  const dy = imgBBox.y;
  let fillOpacity = 0;
  let d = '';
  for (let i = 0; i < g.childNodes.length; i += 1) {
    const child = g.childNodes[i] as SVGPathElement;
    if (child.tagName === 'path') {
      const opacity = Number(child.getAttribute('fill-opacity'));
      if (opacity >= fillOpacity) {
        fillOpacity = opacity;
        const pathD = child.getAttribute('d');
        if (isTransparentBackground) {
          const longestPath = pathD.split('M').reduce((a, b) => (a.length > b.length ? a : b));
          d = `M${longestPath}`;
        } else {
          d = pathD;
        }
        console.log(d);
      }
    }
  }

  g.remove();
  path.setAttribute('d', d);
  moveElements([dx], [dy], [path], false);
  svgCanvas.setRotationAngle(imgRotation, true, path);
  svgCanvas.selectOnly([path], true);
  const tempOuterContour = await svgCanvas.offsetElements(1, 5, 'round', null, true);
  svgCanvas.selectOnly([tempOuterContour], true);
  const finalContour = await svgCanvas.offsetElements(0, 5, 'round', null, true);
  console.log('path', path);
  console.log('tempOuterContour', tempOuterContour);
  path.remove();
  tempOuterContour.remove();
  const batchCmd = new history.BatchCommand('Potrace Image');
  if (svgCanvas.isUsingLayerColor) svgCanvas.updateElementColor(finalContour);
  svgCanvas.selectOnly([finalContour], true);
  batchCmd.addSubCommand(new history.InsertElementCommand(finalContour));
  svgCanvas.addCommandToHistory(batchCmd);
  progress.popById('potrace');
};

export default {
  colorInvert,
  generateStampBevel,
  traceImage,
  removeBackground,
  potrace,
};
