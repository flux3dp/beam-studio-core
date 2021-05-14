/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import Progress from 'app/actions/progress-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamFileHelper from './beam-file-helper';
import SymbolMaker from './symbol-maker';
import i18n from 'helpers/i18n';
import { getSVGAsync } from './svg-editor-helper';

const { $, electron } = window;
let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang;

const setCurrentFileName = (filePath: string) => {
  let currentFileName: string | string[];
  if (window.os === 'Windows') {
    currentFileName = filePath.split('\\');
  } else {
    currentFileName = filePath.split('/');
  }
  currentFileName = currentFileName[currentFileName.length - 1];
  currentFileName = currentFileName.slice(0, currentFileName.lastIndexOf('.')).replace(':', '/');
  svgCanvas.setLatestImportFileName(currentFileName);
  svgCanvas.filePath = filePath;
  svgCanvas.updateRecentFiles(filePath);
};

const saveAsFile = async (): Promise<boolean> => {
  svgCanvas.clearSelection();
  const output = svgCanvas.getSvgString();
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  const langFile = LANG.topmenu.file;
  const ImageSource = await svgCanvas.getImageSource();
  const currentFilePath = await BeamFileHelper.getFilePath(langFile.save_scene, langFile.all_files, langFile.scene_files, ['beam'], defaultFileName);
  if (currentFilePath) {
    svgCanvas.currentFilePath = currentFilePath;
    await BeamFileHelper.saveBeam(currentFilePath, output, ImageSource);
    setCurrentFileName(currentFilePath);
    svgCanvas.setHasUnsavedChange(false, false);
    return true;
  }
  return false;
};

const saveFile = async (): Promise<boolean> => {
  if (!svgCanvas.currentFilePath) {
    const result = await saveAsFile();
    return result;
  }
  svgCanvas.clearSelection();
  const output = svgCanvas.getSvgString();
  const fs = requireNode('fs');
  console.log(svgCanvas.currentFilePath);
  if (svgCanvas.currentFilePath.endsWith('.bvg')) {
    fs.writeFile(svgCanvas.currentFilePath, output, (err) => {
      if (err) {
        console.log('Save Err', err);
        return;
      }
      console.log('saved');
    });
    svgCanvas.setHasUnsavedChange(false, false);
    return true;
  }
  if (svgCanvas.currentFilePath.endsWith('.beam')) {
    const ImageSource = await svgCanvas.getImageSource();
    await BeamFileHelper.saveBeam(svgCanvas.currentFilePath, output, ImageSource);
    svgCanvas.setHasUnsavedChange(false, false);
    return true;
  }
  return false;
};

const checkNounProjectElements = () => {
  const svgContent = document.getElementById('svgcontent');
  const npElements = svgContent.querySelectorAll('[data-np="1"]');
  if (npElements.length === 0) {
    return true;
  }
  return new Promise<boolean>((resolve) => {
    Alert.popUp({
      id: 'export-noun-project-svg',
      buttonType: AlertConstants.YES_NO,
      caption: LANG.noun_project_panel.export_svg_title,
      message: LANG.noun_project_panel.export_svg_warning,
      onYes: () => resolve(true),
      onNo: () => resolve(false),
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeNPElementsWrapper = (fn: () => any) => {
  const svgContent = document.getElementById('svgcontent');
  const npElements = svgContent.querySelectorAll('[data-np="1"]');
  const removedElements = [] as { elem: Element, parentNode: Element, nextSibling: Element }[];
  for (let i = 0; i < npElements.length; i += 1) {
    const elem = npElements[i];
    const parentNode = elem.parentNode as Element;
    if (parentNode && parentNode.getAttribute('data-np') === '1') {
      const nextSibling = elem.nextSibling as Element;
      removedElements.push({ elem, parentNode, nextSibling });
      elem.remove();
    }
  }
  const res = fn();
  for (let i = removedElements.length - 1; i >= 0; i -= 1) {
    const { elem, parentNode, nextSibling } = removedElements[i];
    try {
      parentNode.insertBefore(elem, nextSibling);
    } catch (error) {
      parentNode.appendChild(elem);
    }
  }
  return res;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const switchSymbolWrapper = (fn: () => any) => {
  SymbolMaker.switchImageSymbolForAll(false);
  const res = fn();
  SymbolMaker.switchImageSymbolForAll(true);
  return res;
};

const exportAsBVG = async (): Promise<boolean> => {
  if (!await checkNounProjectElements()) {
    return false;
  }
  svgCanvas.clearSelection();
  const output = removeNPElementsWrapper(() => switchSymbolWrapper(() => svgCanvas.getSvgString()));
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  const langFile = LANG.topmenu.file;
  const currentFilePath = electron.ipc.sendSync('save-dialog', langFile.save_scene, langFile.all_files, langFile.scene_files, ['bvg'], defaultFileName, output, localStorage.getItem('lang'));
  if (currentFilePath) {
    setCurrentFileName(currentFilePath);
    svgCanvas.setHasUnsavedChange(false, false);
    return true;
  }
  return false;
};

const exportAsSVG = async (): Promise<void> => {
  if (!await checkNounProjectElements()) {
    return;
  }
  svgCanvas.clearSelection();
  $('g.layer').removeAttr('clip-path');
  const output = removeNPElementsWrapper(() => switchSymbolWrapper(() => svgCanvas.getSvgString('mm')));
  $('g.layer').attr('clip-path', 'url(#scene_mask)');
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  const langFile = LANG.topmenu.file;
  electron.ipc.sendSync('save-dialog', langFile.save_svg, langFile.all_files, langFile.svg_files, ['svg'], defaultFileName, output, localStorage.getItem('lang'));
};

const exportAsImage = async (type: 'png'|'jpg'): Promise<void> => {
  svgCanvas.clearSelection();
  const output = switchSymbolWrapper(() => svgCanvas.getSvgString());
  const langFile = LANG.topmenu.file;
  Progress.openNonstopProgress({ id: 'export_image', message: langFile.converting });
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  let image = await svgCanvas.svgStringToImage(type, output);
  image = image.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(image, 'base64');
  Progress.popById('export_image');
  if (type === 'png') {
    electron.ipc.sendSync('save-dialog', langFile.save_png, langFile.all_files, langFile.png_files, ['png'], defaultFileName, buf, localStorage.getItem('lang'));
  } else if (type === 'jpg') {
    electron.ipc.sendSync('save-dialog', langFile.save_jpg, langFile.all_files, langFile.jpg_files, ['jpg'], defaultFileName, buf, localStorage.getItem('lang'));
  }
};

const toggleUnsavedChangedDialog = async (): Promise<boolean> => new Promise((resolve) => {
  electron.ipc.send('SAVE_DIALOG_POPPED');
  if (!svgCanvas.getHasUnsaveChanged() || window.location.hash !== '#studio/beambox') {
    resolve(true);
  } else {
    Alert.popById('unsaved_change_dialog');
    Alert.popUp({
      id: 'unsaved_change_dialog',
      message: LANG.beambox.popup.save_unsave_changed,
      buttonLabels: [LANG.alert.save, LANG.alert.dont_save, LANG.alert.cancel],
      callbacks: [
        async () => {
          if (await saveFile()) {
            resolve(true);
          }
        },
        () => {
          resolve(true);
        },
        () => {
          resolve(false);
        },
      ],
      primaryButtonIndex: 0,
    });
  }
});

export default {
  saveAsFile,
  saveFile,
  exportAsBVG,
  exportAsSVG,
  exportAsImage,
  toggleUnsavedChangedDialog,
};
