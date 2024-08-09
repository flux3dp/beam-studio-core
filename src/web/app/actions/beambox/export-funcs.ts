/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import AwsHelper from 'helpers/aws-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import convertShapeToBitmap from 'helpers/layer/convertShapeToBitmap';
import currentFileManager from 'app/svgedit/currentFileManager';
import deviceMaster from 'helpers/device-master';
import dialog from 'implementations/dialog';
import FontFuncs from 'app/actions/beambox/font-funcs';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import MonitorController from 'app/actions/monitor-controller';
import Progress from 'app/actions/progress-caller';
import SymbolMaker from 'helpers/symbol-maker';
import svgLaserParser from 'helpers/api/svg-laser-parser';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import updateImagesResolution from 'helpers/image/updateImagesResolution';
import VersionChecker from 'helpers/version-checker';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { Mode } from 'app/constants/monitor-constants';
import { tempSplitFullColorLayers } from 'helpers/layer/full-color/splitFullColorLayer';

let svgCanvas: ISVGCanvas;
let svgedit;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const { $ } = window;
const { lang } = i18n;
const svgeditorParser = svgLaserParser({ type: 'svgeditor' });

const getAdorPaddingAccel = async (device: IDeviceInfo | null): Promise<number | null> => {
  if (!constant.adorModels.includes(device?.model)) return null;
  try {
    await deviceMaster.select(device);
    const deviceDetailInfo = await deviceMaster.getDeviceDetailInfo();
    const xAcc = parseInt(deviceDetailInfo.x_acc, 10);
    // handle nan and 0
    return Number.isNaN(xAcc) || !xAcc ? null : xAcc;
  } catch (error) {
    console.error(error);
    return null;
  }
};

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

const generateThumbnail = async () => {
  svgedit.utilities.moveDefsIntoSvgContent();
  const [thumbnail, thumbnailBlobURL] = await fetchThumbnail();
  svgedit.utilities.moveDefsOutfromSvgContent();
  return { thumbnail, thumbnailBlobURL };
};

const generateUploadFile = async (thumbnail: string, thumbnailUrl: string) => {
  Progress.openNonstopProgress({
    id: 'retreive-image-data',
    message: lang.beambox.bottom_right_panel.retreive_image_data,
  });
  await updateImagesResolution(true);
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
        uploadName: thumbnailUrl.split('/').pop(),
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
  return uploadFile;
};

// Send svg string calculate taskcode, output Fcode in default
const fetchTaskCode = async (
  device: IDeviceInfo = null,
  opts: { output?: 'fcode' | 'gcode'; fgGcode?: boolean } = {}
) => {
  svgCanvas.removeUnusedDefs();
  let didErrorOccur = false;
  let isCanceled = false;

  SymbolMaker.switchImageSymbolForAll(false);
  Progress.openNonstopProgress({
    id: 'fetch-task-code',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: lang.beambox.bottom_right_panel.convert_text_to_path_before_export,
  });
  const res = await FontFuncs.tempConvertTextToPathAmoungSvgcontent();
  if (!res) {
    Progress.popById('fetch-task-code');
    SymbolMaker.switchImageSymbolForAll(true);
    return {};
  }
  Progress.update('fetch-task-code', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: 'Generating Thumbnail',
  });
  const { thumbnail, thumbnailBlobURL } = await generateThumbnail();
  Progress.update('fetch-task-code', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: 'Spliting Full color layer',
  });
  const revertShapesToImage = await convertShapeToBitmap();
  const revertTempSplitFullColorLayers = await tempSplitFullColorLayers();
  const cleanUp = async () => {
    revertTempSplitFullColorLayers();
    revertShapesToImage();
    await FontFuncs.revertTempConvert();
    SymbolMaker.switchImageSymbolForAll(true);
  };
  Progress.update('fetch-task-code', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: 'Generating Upload File',
  });
  const uploadFile = await generateUploadFile(thumbnail, thumbnailBlobURL);
  await cleanUp();
  Progress.popById('fetch-task-code');
  Progress.openSteppingProgress({
    id: 'upload-scene',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: '',
    onCancel: async () => {
      svgeditorParser.interruptCalculation();
      isCanceled = true;
    },
  });
  await svgeditorParser.uploadToSvgeditorAPI([uploadFile], {
    model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
    rotaryMode: BeamboxPreference.read('rotary_mode'),
    engraveDpi:
      // (isDev() && BeamboxPreference.read('engrave-dpi-value')) ||
      BeamboxPreference.read('engrave_dpi'),
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
      if (isCanceled || didErrorOccur) return;
      didErrorOccur = true;
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
  if (isCanceled || didErrorOccur) {
    return {};
  }

  let doesSupportDiodeAndAF = true;
  let shouldUseFastGradient = BeamboxPreference.read('fast_gradient') !== false;
  let disablePwm = false;
  if (device) {
    const vc = VersionChecker(device.version);
    const isAdor = constant.adorModels.includes(device.model);
    doesSupportDiodeAndAF = vc.meetRequirement('DIODE_AND_AUTOFOCUS');
    shouldUseFastGradient = shouldUseFastGradient && vc.meetRequirement('FAST_GRADIENT');
    disablePwm = !vc.meetRequirement(isAdor ? 'ADOR_PWM' : 'PWM')
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

  const paddingAccel = await getAdorPaddingAccel(device || TopBarController.getSelectedDevice());
  const supportInfo = getSupportInfo(BeamboxPreference.read('workarea'));
  const getTaskCode = (codeType: 'gcode' | 'fcode', getTaskCodeOpts = {}) =>
    new Promise<{
      fileTimeCost: null | number;
      taskCodeBlob: Blob | null;
    }>((resolve) => {
      const names = [];
      svgeditorParser.getTaskCode(names, {
        onProgressing: (data) => {
          Progress.update('fetch-task', {
            message: data.message,
            percentage: data.percentage * 100,
          });
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
          didErrorOccur = true;
          resolve({
            taskCodeBlob: null,
            fileTimeCost: null,
          });
        },
        fileMode: '-f',
        codeType,
        model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
        enableAutoFocus:
          doesSupportDiodeAndAF &&
          BeamboxPreference.read('enable-autofocus') &&
          supportInfo.autoFocus,
        enableDiode:
          doesSupportDiodeAndAF &&
          BeamboxPreference.read('enable-diode') &&
          supportInfo.hybridLaser,
        shouldUseFastGradient,
        vectorSpeedConstraint: BeamboxPreference.read('vector_speed_contraint') !== false,
        ...getTaskCodeOpts,
        paddingAccel,
        disablePwm,
      });
    });
  const { output = 'fcode' } = opts;
  const { fgGcode = false } = opts;
  const taskCodeRes = await getTaskCode(
    output,
    output === 'gcode' && !fgGcode
      ? {
          shouldUseFastGradient: false,
          shouldMockFastGradient: true,
        }
      : undefined
  );
  const { taskCodeBlob } = taskCodeRes;
  let { fileTimeCost } = taskCodeRes;

  if (output === 'gcode' && !fgGcode) {
    const fcodeRes = await getTaskCode('fcode');
    fileTimeCost = fcodeRes.fileTimeCost;
  }

  Progress.popById('fetch-task');
  if (isCanceled || didErrorOccur) {
    return {};
  }

  if (output === 'fcode') {
    return {
      fcodeBlob: taskCodeBlob,
      thumbnailBlobURL,
      fileTimeCost,
    };
  }
  return {
    gcodeBlob: taskCodeBlob,
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
    taskCodeBlob: Blob | null;
    fileTimeCost: number | null;
  }>((resolve) => {
    const codeType = 'fcode';
    svgeditorParser.gcodeToFcode(
      { arrayBuffer, thumbnailSize: thumbnail.length, size: blob.size },
      {
        onProgressing: (data) => {
          Progress.update('fetch-task', {
            message: data.message,
            percentage: data.percentage * 100,
          });
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
      }
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
  taskTime: number
): void => {
  const fileName = currentFileManager.getName() || i18n.lang.topbar.untitled;
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
      const res = await deviceMaster.select(device);
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
    const defaultFCodeName = currentFileManager.getName() || 'untitled';
    const langFile = i18n.lang.topmenu.file;
    const fileReader = new FileReader();

    fileReader.onload = function onLoad() {
      const getContent = () => new Blob([this.result as ArrayBuffer]);
      dialog.writeFileDialog(getContent, langFile.save_fcode, defaultFCodeName, [
        {
          name: window.os === 'MacOS' ? `${langFile.fcode_files} (*.fc)` : langFile.fcode_files,
          extensions: ['fc'],
        },
        { name: langFile.all_files, extensions: ['*'] },
      ]);
    };

    fileReader.readAsArrayBuffer(fcodeBlob);
  },
  getGcode: async (): Promise<{
    gcodeBlob?: Blob;
    fileTimeCost: number;
  }> => {
    const { gcodeBlob, fileTimeCost } = await fetchTaskCode(null, { output: 'gcode' });
    if (!gcodeBlob) {
      return { gcodeBlob, fileTimeCost: 0 };
    }
    return { gcodeBlob, fileTimeCost: fileTimeCost || 0 };
  },
  getFastGradientGcode: async (): Promise<Blob> => {
    const { gcodeBlob } = await fetchTaskCode(null, { output: 'gcode', fgGcode: true });
    return gcodeBlob;
  },
  estimateTime: async (): Promise<number> => {
    const { fcodeBlob, fileTimeCost } = await fetchTaskCode();
    if (!fcodeBlob) {
      return null;
    }
    return fileTimeCost;
  },
  gcodeToFcode: async (
    gcodeString: string,
    thumbnail: string
  ): Promise<{
    fcodeBlob: Blob;
    fileTimeCost: number;
  }> => {
    const { fcodeBlob, fileTimeCost } = await fetchTransferredFcode(gcodeString, thumbnail);
    if (!fcodeBlob) {
      return null;
    }
    return { fcodeBlob, fileTimeCost };
  },
  prepareFileWrappedFromSvgStringAndThumbnail: async (): Promise<{
    uploadFile: WrappedFile;
    thumbnailBlobURL: string;
  }> => {
    await FontFuncs.tempConvertTextToPathAmoungSvgcontent();
    const { thumbnail, thumbnailBlobURL } = await generateThumbnail();
    const uploadFile = await generateUploadFile(thumbnail, thumbnailBlobURL);
    await FontFuncs.revertTempConvert();
    return { uploadFile, thumbnailBlobURL };
  },
  openTaskInDeviceMonitor,
};
