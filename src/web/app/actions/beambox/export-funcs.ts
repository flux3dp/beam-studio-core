/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import AwsHelper from 'helpers/aws-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import dialog from 'implementations/dialog';
import DeviceMaster from 'helpers/device-master';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import ImageData from 'helpers/image-data';
import MonitorController from 'app/actions/monitor-controller';
import Progress from 'app/actions/progress-caller';
import svgLaserParser from 'helpers/api/svg-laser-parser';
import SymbolMaker from 'helpers/symbol-maker';
import VersionChecker from 'helpers/version-checker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { Mode } from 'app/constants/monitor-constants';
import { tempSplitFullColorLayers } from 'helpers/layer/full-color/splitFullColorLayer';

let svgCanvas;
let svgedit;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const { $ } = window;
const { lang } = i18n;
const svgeditorParser = svgLaserParser({ type: 'svgeditor' });

// capture the scene of the svgCanvas to bitmap
const fetchThumbnail = async () => {
  function cloneAndModifySvg($svg) {
    const $clonedSvg = $svg.clone(false);

    $clonedSvg.find('text').remove();
    $clonedSvg.find('#selectorParentGroup').remove();
    $clonedSvg.find('#canvasBackground image#background_image').remove();
    $clonedSvg.find('#canvasBackground #previewBoundary').remove();
    $clonedSvg.find('#canvasBackground #guidesLines').remove();
    $clonedSvg.find('#canvasBackground #diode-boundary').remove();

    return $clonedSvg;
  }

  async function DOM2Image($svg) {
    const $modifiedSvg = cloneAndModifySvg($svg);
    const svgString = new XMLSerializer().serializeToString($modifiedSvg.get(0));

    const image = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = `data:image/svg+xml; charset=utf8, ${encodeURIComponent(svgString)}`;
    });
    return image;
  }

  function cropAndDrawOnCanvas(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // cropping
    const ratio = img.width / $('#svgroot').width();
    const W = ratio * $('#svgroot').width();
    const H = ratio * $('#svgroot').height();
    const w = ratio * parseInt($('#canvasBackground').attr('width'), 10);
    const h = ratio * parseInt($('#canvasBackground').attr('height'), 10);
    const x = -(W - w) / 2;
    const y = -(H - h) / 2;

    canvas.width = Math.min(w, 500);
    canvas.height = h * (canvas.width / w);

    ctx.drawImage(img, -x, -y, w, h, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  const $svg = cloneAndModifySvg($('#svgroot'));
  const img = await DOM2Image($svg);
  const canvas = cropAndDrawOnCanvas(img);

  const urls = await new Promise<string[]>((resolve) => {
    canvas.toBlob((blob) => {
      resolve([canvas.toDataURL(), URL.createObjectURL(blob)]);
    });
  });
  return urls;
};

const updateImageResolution = (isFullResolution = true) => new Promise<void>((resolve) => {
  if (BeamboxPreference.read('image_downsampling') === false) {
    resolve();
  }
  const imgs = $('#svgcontent image').toArray();
  const numImgs = imgs.length;
  let done = 0;
  if (numImgs === 0) {
    resolve();
  } else {
    imgs.forEach((img) => {
      if (img.getAttribute('origImage')) {
        const shading = img.getAttribute('data-shading') === 'true';
        const threshold = parseInt(img.getAttribute('data-threshold'), 10);
        ImageData(img.getAttribute('origImage'), {
          grayscale: {
            is_rgba: true,
            is_shading: shading,
            threshold,
            is_svg: false,
          },
          isFullResolution,
          onComplete(result) {
            img.setAttribute('xlink:href', result.pngBase64);
            done += 1;
            if (done === numImgs) {
              resolve();
            }
          },
        });
      } else {
        done += 1;
        if (done === numImgs) {
          resolve();
        }
      }
    });
  }
});

interface WrappedFile {
  data: string | ArrayBuffer;
  name: string;
  uploadName: string;
  extension: string;
  type: string;
  size: number;
  thumbnailSize: number;
  index: number;
  totalFiles: number;
}

const prepareFileWrappedFromSvgStringAndThumbnail = async () => {
  svgedit.utilities.moveDefsIntoSvgContent();
  const [thumbnail, thumbnailBlobURL] = await fetchThumbnail();
  svgedit.utilities.moveDefsOutfromSvgContent();
  Progress.openNonstopProgress({
    id: 'retreive-image-data', message: lang.beambox.bottom_right_panel.retreive_image_data,
  });
  await updateImageResolution(true);
  Progress.popById('retreive-image-data');
  const svgString = svgCanvas.getSvgString();
  console.log('File Size', svgString.length);
  const blob = new Blob([thumbnail, svgString], { type: 'application/octet-stream' });
  const reader = new FileReader();
  const uploadFile = await new Promise<WrappedFile>((resolve) => {
    reader.onload = () => {
      // not sure whether all para is needed
      const file = {
        data: reader.result,
        name: 'svgeditor.svg',
        uploadName: thumbnailBlobURL.split('/').pop(),
        extension: 'svg',
        type: 'application/octet-stream',
        size: blob.size,
        thumbnailSize: thumbnail.length,
        index: 0,
        totalFiles: 1,
      };
      resolve(file);
    };
    reader.readAsArrayBuffer(blob);
  });
  await updateImageResolution(false);
  return {
    uploadFile,
    thumbnailBlobURL,
  };
};

// Send svg string calculate taskcode, output Fcode in default
const fetchTaskCode = async (device: IDeviceInfo = null, shouldOutputGcode = false) => {
  let isErrorOccur = false;
  let isCanceled = false;
  SymbolMaker.switchImageSymbolForAll(false);
  Progress.openNonstopProgress({
    id: 'convert-text',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: lang.beambox.bottom_right_panel.convert_text_to_path_before_export,
  });
  const res = await FontFuncs.tempConvertTextToPathAmoungSvgcontent();
  Progress.popById('convert-text');
  if (!res) {
    SymbolMaker.switchImageSymbolForAll(true);
    return {};
  }
  const revertTempSplitFullColorLayers = await tempSplitFullColorLayers();
  const cleanUp = async () => {
    revertTempSplitFullColorLayers();
    await FontFuncs.revertTempConvert();
    SymbolMaker.switchImageSymbolForAll(true);
  };

  const { uploadFile, thumbnailBlobURL } = await prepareFileWrappedFromSvgStringAndThumbnail();
  Progress.openSteppingProgress({
    id: 'upload-scene',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: '',
    onCancel: async () => {
      svgeditorParser.interruptCalculation();
      await cleanUp();
      isCanceled = true;
    },
  });
  await svgeditorParser.uploadToSvgeditorAPI([uploadFile], {
    model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
    engraveDpi: (isDev() && BeamboxPreference.read('engrave-dpi-value')) || BeamboxPreference.read('engrave_dpi'),
    onProgressing: (data) => {
      Progress.update('upload-scene', {
        caption: i18n.lang.beambox.popup.progress.calculating,
        message: data.message,
        percentage: data.percentage * 100,
      });
    },
    onFinished: () => {
      Progress.update('upload-scene', {
        caption: i18n.lang.beambox.popup.progress.calculating,
        message: lang.message.uploading_fcode,
        percentage: 100,
      });
    },
    onError: (message) => {
      if (isCanceled) return;
      isErrorOccur = true;
      Progress.popById('upload-scene');
      Alert.popUp({
        id: 'get-taskcode-error',
        message: `#806 ${message}\n${lang.beambox.bottom_right_panel.export_file_error_ask_for_upload}`,
        type: AlertConstants.SHOW_POPUP_ERROR,
        buttonType: AlertConstants.YES_NO,
        onYes: () => {
          const svgString = svgCanvas.getSvgString();
          AwsHelper.uploadToS3('output.bvg', svgString);
        },
      });
    },
  });
  if (isCanceled) {
    return {};
  }
  await cleanUp();
  if (isErrorOccur) {
    return {};
  }

  let doesSupportDiodeAndAF = true;
  let shouldUseFastGradient = BeamboxPreference.read('fast_gradient') !== false;
  if (device) {
    const vc = VersionChecker(device.version);
    doesSupportDiodeAndAF = vc.meetRequirement('DIODE_AND_AUTOFOCUS');
    shouldUseFastGradient = shouldUseFastGradient && vc.meetRequirement('FAST_GRADIENT');
  }
  Progress.popById('upload-scene');
  Progress.openSteppingProgress({
    id: 'fetch-task',
    message: '',
    onCancel: () => {
      svgeditorParser.interruptCalculation();
      isCanceled = true;
    },
  });

  const getTaskCode = (codeType: 'gcode' | 'fcode', opts = {}) => new Promise<{
    fileTimeCost: null | number;
    taskCodeBlob: Blob | null;
  }>((resolve) => {
    const names = [];
    svgeditorParser.getTaskCode(
      names,
      {
        onProgressing: (data) => {
          Progress.update('fetch-task', { message: data.message, percentage: data.percentage * 100 });
        },
        onFinished: (taskBlob, fileName, timeCost) => {
          Progress.update('fetch-task', { message: lang.message.uploading_fcode, percentage: 100 });
          resolve({ taskCodeBlob: taskBlob, fileTimeCost: timeCost });
        },
        onError: (message) => {
          Progress.popById('fetch-task');
          Alert.popUp({
            id: 'get-taskcode-error',
            message: `#806 ${message}\n${lang.beambox.bottom_right_panel.export_file_error_ask_for_upload}`,
            type: AlertConstants.SHOW_POPUP_ERROR,
            buttonType: AlertConstants.YES_NO,
            onYes: () => {
              const svgString = svgCanvas.getSvgString();
              AwsHelper.uploadToS3('output.bvg', svgString);
            },
          });
          isErrorOccur = true;
          resolve({
            taskCodeBlob: null,
            fileTimeCost: null,
          });
        },
        fileMode: '-f',
        codeType,
        model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
        enableAutoFocus: (
          doesSupportDiodeAndAF
          && BeamboxPreference.read('enable-autofocus')
          && Constant.addonsSupportList.autoFocus.includes(BeamboxPreference.read('workarea'))
        ),
        enableDiode: (
          doesSupportDiodeAndAF
          && BeamboxPreference.read('enable-diode')
          && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
        ),
        shouldUseFastGradient,
        vectorSpeedConstraint: BeamboxPreference.read('vector_speed_contraint') !== false,
        ...opts,
      },
    );
  });
  const taskCodeRes = await getTaskCode(shouldOutputGcode ? 'gcode' : 'fcode');
  const { taskCodeBlob } = taskCodeRes;
  let { fileTimeCost } = taskCodeRes;

  let gcodeBlobNoFastGradient = null;

  if (shouldOutputGcode) {
    if (shouldUseFastGradient) {
      const mockFastGradientRes = await getTaskCode('gcode', {
        shouldUseFastGradient: false,
        shouldMockFastGradient: true,
      });
      gcodeBlobNoFastGradient = mockFastGradientRes.taskCodeBlob;
    }
    const fcodeRes = await getTaskCode('fcode');
    fileTimeCost = fcodeRes.fileTimeCost;
  }

  Progress.popById('fetch-task');
  if (isCanceled || isErrorOccur) {
    return {};
  }

  if (!shouldOutputGcode) {
    return {
      fcodeBlob: taskCodeBlob,
      thumbnailBlobURL,
      fileTimeCost,
    };
  }
  if (shouldUseFastGradient) {
    return {
      gcodeBlob: gcodeBlobNoFastGradient,
      gcodeBlobFastGradient: taskCodeBlob,
      thumbnailBlobURL,
      fileTimeCost,
    };
  }
  return {
    gcodeBlob: taskCodeBlob,
    gcodeBlobFastGradient: '',
    thumbnailBlobURL,
    fileTimeCost,
  };
};

// Send svg string calculate taskcode, output Fcode in default
const fetchTransferredFcode = async (gcodeString: string, thumbnail: string) => {
  let isErrorOccur = false;
  let isCanceled = false;
  const blob = new Blob([thumbnail, gcodeString], { type: 'application/octet-stream' });
  const arrayBuffer = await blob.arrayBuffer();

  Progress.openSteppingProgress({
    id: 'fetch-task',
    message: '',
    onCancel: () => {
      svgeditorParser.interruptCalculation();
      isCanceled = true;
    },
  });
  const { taskCodeBlob, fileTimeCost } = await new Promise<{
    taskCodeBlob: Blob | null; fileTimeCost: number | null
  }>((resolve) => {
    const codeType = 'fcode';
    svgeditorParser.gcodeToFcode(
      { arrayBuffer, thumbnailSize: thumbnail.length, size: blob.size },
      {
        onProgressing: (data) => {
          Progress.update('fetch-task', { message: data.message, percentage: data.percentage * 100 });
        },
        onFinished: (taskBlob, fileName, timeCost) => {
          Progress.update('fetch-task', { message: lang.message.uploading_fcode, percentage: 100 });
          resolve({ taskCodeBlob: taskBlob, fileTimeCost: timeCost });
        },
        onError: (message) => {
          Progress.popById('fetch-task');
          Alert.popUp({
            id: 'get-taskcode-error',
            message: `#806 ${message}\n${lang.beambox.bottom_right_panel.export_file_error_ask_for_upload}`,
            type: AlertConstants.SHOW_POPUP_ERROR,
            buttonType: AlertConstants.YES_NO,
            onYes: () => {
              const svgString = svgCanvas.getSvgString();
              AwsHelper.uploadToS3('output.bvg', svgString);
            },
          });
          isErrorOccur = true;
          resolve({
            taskCodeBlob: null,
            fileTimeCost: null,
          });
        },
        codeType,
        model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
        vectorSpeedConstraint: BeamboxPreference.read('vector_speed_contraint') !== false,
      },
    );
  });
  Progress.popById('fetch-task');
  if (isCanceled || isErrorOccur) {
    return {};
  }

  return {
    fcodeBlob: taskCodeBlob,
    fileTimeCost,
  };
};

const openTaskInDeviceMonitor = (
  device: IDeviceInfo,
  fcodeBlob: Blob,
  taskImageURL: string,
  taskTime: number,
): void => {
  const fileName = svgCanvas.getLatestImportFileName() || i18n.lang.topbar.untitled;
  MonitorController.showMonitor(device, Mode.PREVIEW, {
    fcodeBlob,
    taskImageURL,
    taskTime,
    fileName,
  });
};

export default {
  uploadFcode: async (device: IDeviceInfo): Promise<void> => {
    const { fcodeBlob, thumbnailBlobURL, fileTimeCost } = await fetchTaskCode(device);
    if (!fcodeBlob) {
      return;
    }
    try {
      const res = await DeviceMaster.select(device);
      if (!res) {
        return;
      }
      openTaskInDeviceMonitor(device, fcodeBlob, thumbnailBlobURL, fileTimeCost);
    } catch (errMsg) {
      console.error(errMsg);
      // TODO: handle err message
      Alert.popUp({
        id: 'menu-item',
        message: `#807 ${errMsg}`,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
    }
  },
  exportFcode: async (): Promise<void> => {
    const { fcodeBlob } = await fetchTaskCode();
    if (!fcodeBlob) {
      return;
    }
    const defaultFCodeName = svgCanvas.getLatestImportFileName() || 'untitled';
    const langFile = i18n.lang.topmenu.file;
    const fileReader = new FileReader();

    fileReader.onload = function onLoad() {
      const getContent = () => new Blob([this.result as ArrayBuffer]);
      dialog.writeFileDialog(getContent, langFile.save_fcode, defaultFCodeName, [
        { name: window.os === 'MacOS' ? `${langFile.fcode_files} (*.fc)` : langFile.fcode_files, extensions: ['fc'] },
        { name: langFile.all_files, extensions: ['*'] },
      ]);
    };

    fileReader.readAsArrayBuffer(fcodeBlob);
  },
  getGcode: async (): Promise<{
    gcodeBlob?: Blob;
    gcodeBlobFastGradient?: Blob | string;
    fileTimeCost: number;
  }> => {
    const { gcodeBlob, gcodeBlobFastGradient, fileTimeCost } = await fetchTaskCode(null, true);
    console.log(fileTimeCost);
    if (!gcodeBlob) {
      return { gcodeBlob, fileTimeCost: 0 };
    }
    return { gcodeBlob, gcodeBlobFastGradient, fileTimeCost: fileTimeCost || 0 };
  },
  estimateTime: async (): Promise<number> => {
    const { fcodeBlob, fileTimeCost } = await fetchTaskCode();
    if (!fcodeBlob) {
      return null;
    }
    return fileTimeCost;
  },
  gcodeToFcode: async (gcodeString: string, thumbnail: string): Promise<{
    fcodeBlob: Blob,
    fileTimeCost: number,
  }> => {
    const { fcodeBlob, fileTimeCost } = await fetchTransferredFcode(gcodeString, thumbnail);
    if (!fcodeBlob) {
      return null;
    }
    return { fcodeBlob, fileTimeCost };
  },
  prepareFileWrappedFromSvgStringAndThumbnail: async (): Promise<{
    uploadFile: WrappedFile,
    thumbnailBlobURL: string
  }> => {
    await FontFuncs.tempConvertTextToPathAmoungSvgcontent();
    const { uploadFile, thumbnailBlobURL } = await prepareFileWrappedFromSvgStringAndThumbnail();
    await FontFuncs.revertTempConvert();
    return { uploadFile, thumbnailBlobURL };
  },
  openTaskInDeviceMonitor,
};
