/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import beamFileHelper from 'helpers/beam-file-helper';
import communicator from 'implementations/communicator';
import dialog from 'implementations/dialog';
import fs from 'implementations/fileSystem';
import i18n from 'helpers/i18n';
import Progress from 'app/actions/progress-caller';
import SymbolMaker from 'helpers/symbol-maker';
import { getSVGAsync } from 'helpers/svg-editor-helper';

const { $ } = window;
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
  const imageSource = await svgCanvas.getImageSource();
  const getContent = () => beamFileHelper.getBeamBlob(output, imageSource);
  const filePath = await dialog.writeFileDialog(
    getContent,
    langFile.save_scene,
    window.os === 'Linux' ? `${defaultFileName}.beam` : defaultFileName,
    [
      {
        name: window.os === 'MacOS' ? `${langFile.scene_files} (*.beam)` : langFile.scene_files,
        extensions: ['beam'],
      },
      {
        name: i18n.lang.topmenu.file.all_files,
        extensions: ['*'],
      },
    ],
  );
  if (filePath) {
    svgCanvas.currentFilePath = filePath;
    setCurrentFileName(filePath);
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
  console.log(svgCanvas.currentFilePath);
  if (svgCanvas.currentFilePath.endsWith('.bvg')) {
    fs.writeFile(svgCanvas.currentFilePath, output);
    svgCanvas.setHasUnsavedChange(false, false);
    return true;
  }
  if (svgCanvas.currentFilePath.endsWith('.beam')) {
    const imageSource = await svgCanvas.getImageSource();
    await beamFileHelper.saveBeam(svgCanvas.currentFilePath, output, imageSource);
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
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  const langFile = LANG.topmenu.file;
  const getContent = () => removeNPElementsWrapper(
    () => switchSymbolWrapper(
      () => svgCanvas.getSvgString(),
    ),
  );
  const currentFilePath = await dialog.writeFileDialog(
    getContent,
    langFile.save_scene,
    defaultFileName,
    [
      { name: window.os === 'MacOS' ? `${langFile.scene_files} (*.bvg)` : langFile.scene_files, extensions: ['bvg'] },
      { name: langFile.all_files, extensions: ['*'] },
    ],
  );
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
  const getContent = () => removeNPElementsWrapper(
    () => switchSymbolWrapper(
      () => svgCanvas.getSvgString('mm'),
    ),
  );
  $('g.layer').attr('clip-path', 'url(#scene_mask)');
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  const langFile = LANG.topmenu.file;

  await dialog.writeFileDialog(getContent, langFile.save_svg, defaultFileName, [
    { name: window.os === 'MacOS' ? `${langFile.svg_files} (*.svg)` : langFile.svg_files, extensions: ['svg'] },
    { name: langFile.all_files, extensions: ['*'] },
  ]);
};

const exportAsImage = async (type: 'png' | 'jpg'): Promise<void> => {
  svgCanvas.clearSelection();
  const output = switchSymbolWrapper(() => svgCanvas.getSvgString());
  const langFile = LANG.topmenu.file;
  Progress.openNonstopProgress({ id: 'export_image', message: langFile.converting });
  const defaultFileName = (svgCanvas.getLatestImportFileName() || 'untitled').replace('/', ':');
  let image = await svgCanvas.svgStringToImage(type, output);
  image = image.replace(/^data:image\/\w+;base64,/, '');
  const getContent = () => {
    const sliceSize = 512;
    const byteCharacters = atob(image);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i += 1) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays);
    return blob;
  };
  Progress.popById('export_image');
  if (type === 'png') {
    dialog.writeFileDialog(getContent, langFile.save_png, defaultFileName, [
      { name: window.os === 'MacOS' ? `${langFile.png_files} (*.png)` : langFile.png_files, extensions: ['png'] },
      { name: langFile.all_files, extensions: ['*'] },
    ]);
  } else if (type === 'jpg') {
    dialog.writeFileDialog(getContent, langFile.save_jpg, defaultFileName, [
      { name: window.os === 'MacOS' ? `${langFile.jpg_files} (*.jpg)` : langFile.jpg_files, extensions: ['jpg'] },
      { name: langFile.all_files, extensions: ['*'] },
    ]);
  }
};

const toggleUnsavedChangedDialog = async (): Promise<boolean> => new Promise((resolve) => {
  communicator.send('SAVE_DIALOG_POPPED');
  if (!svgCanvas.getHasUnsaveChanged() || window.location.hash !== '#/studio/beambox') {
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
