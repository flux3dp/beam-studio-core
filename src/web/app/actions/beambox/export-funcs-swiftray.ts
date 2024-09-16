/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import AwsHelper from 'helpers/aws-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import convertClipPath from 'helpers/layer/convertClipPath';
import convertShapeToBitmap from 'helpers/layer/convertShapeToBitmap';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import Progress from 'app/actions/progress-caller';
import SymbolMaker from 'helpers/symbol-maker';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import updateImagesResolution from 'helpers/image/updateImagesResolution';
import VersionChecker from 'helpers/version-checker';
import { getExportOpt } from 'helpers/api/svg-laser-parser';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { IWrappedSwiftrayTaskFile } from 'interfaces/IWrappedFile';
import { swiftrayClient } from 'helpers/api/swiftray-client';
import { tempSplitFullColorLayers } from 'helpers/layer/full-color/splitFullColorLayer';
import generateThumbnail from './export/generate-thumbnail';
import { getAdorPaddingAccel } from './export/ador-utils';

let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { lang } = i18n;
const dpiTextMap = {
  low: 127,
  medium: 254,
  high: 508,
  ultra: 1016,
};

const generateUploadFile = async (thumbnail: string, thumbnailUrl: string): Promise<IWrappedSwiftrayTaskFile> => {
  Progress.openNonstopProgress({
    id: 'retrieve-image-data',
    message: lang.beambox.bottom_right_panel.retreive_image_data,
  });
  await updateImagesResolution(true);
  Progress.popById('retrieve-image-data');
  const svgString = svgCanvas.getSvgString();
  console.log('File Size', svgString.length);
  return {
    data: svgString,
    name: 'svgeditor.svg',
    uploadName: thumbnailUrl.split('/').pop(),
    extension: 'svg',
    thumbnail: thumbnail.toString()
  };
};

const onUploadProgressing = (data): void => {
  Progress.update('upload-scene', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: data.message,
    percentage: data.percentage * 100,
  });
};

const onUploadFinished =  (): void => {
  Progress.update('upload-scene', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: lang.message.uploading_fcode,
    percentage: 100,
  });
};

const uploadToParser = async (uploadFile: IWrappedSwiftrayTaskFile): Promise<boolean> => {
  let errorMessage = null;
  let isCanceled = false;

  // Fetching task code
  Progress.popById('fetch-task-code');
  Progress.openSteppingProgress({
    id: 'upload-scene',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: '',
    onCancel: async () => {
      swiftrayClient.interruptCalculation();
      isCanceled = true;
    },
  });
  const uploadConfig = {
    model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
    rotaryMode: BeamboxPreference.read('rotary_mode'),
    engraveDpi: dpiTextMap[BeamboxPreference.read('engrave_dpi')]
  };
  await swiftrayClient.loadSVG(uploadFile, {
    onProgressing: onUploadProgressing,
    onFinished: onUploadFinished,
    onError: (message: string) => {
      if (isCanceled || errorMessage) return;
      errorMessage = message;
    },
  }, uploadConfig);

  if (errorMessage && !isCanceled) {
    Progress.popById('upload-scene');
    Alert.popUp({
      id: 'get-taskcode-error',
      message: `#806 ${errorMessage}\n${lang.beambox.bottom_right_panel.export_file_error_ask_for_upload}`,
      type: AlertConstants.SHOW_POPUP_ERROR,
      buttonType: AlertConstants.YES_NO,
      onYes: () => {
        const svgString = svgCanvas.getSvgString();
        AwsHelper.uploadToS3('output.bvg', svgString);
      },
    });
  }

  return !isCanceled && !errorMessage;
}

const getTaskCode = (codeType: 'gcode' | 'fcode', taskOptions) =>
  new Promise<{
    fileTimeCost: null | number;
    taskCodeBlob: Blob | null;
  }>((resolve) => {
  swiftrayClient.convert(codeType, {
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
      resolve({
        taskCodeBlob: null,
        fileTimeCost: null,
      });
    },
  }, taskOptions);
});


// Send svg string calculate taskcode, output Fcode in default
const fetchTaskCodeSwiftray = async (
  device: IDeviceInfo = null,
  opts: { output?: 'fcode' | 'gcode'; fgGcode?: boolean } = {}
): Promise<{
  gcodeBlob?: Blob,
  fcodeBlob?: Blob,
  thumbnailBlobURL: string,
  fileTimeCost: number,
} | Record<string, never> > => {
  let isCanceled = false;
  svgCanvas.removeUnusedDefs();
  SymbolMaker.switchImageSymbolForAll(false);
  Progress.openNonstopProgress({
    id: 'fetch-task-code',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: lang.beambox.bottom_right_panel.convert_text_to_path_before_export,
  });
  // Convert text to path
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
  // Generate Thumbnail
  const { thumbnail, thumbnailBlobURL } = await generateThumbnail();
  Progress.update('fetch-task-code', {
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: 'Splitting Full color layer',
  });
  // Prepare for Ador cleanup
  const revertShapesToImage = await convertShapeToBitmap();
  const revertTempSplitFullColorLayers = await tempSplitFullColorLayers();
  const revertClipPath = await convertClipPath();
  const cleanUpTempModification = async () => {
    revertClipPath();
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
  await cleanUpTempModification();
  const didUpload = await uploadToParser(uploadFile);
  if (!didUpload) return {};

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
      swiftrayClient.interruptCalculation();
      isCanceled = true;
    },
  });

  const supportInfo = getSupportInfo(BeamboxPreference.read('workarea'));
  const { output = 'fcode' } = opts;
  const { fgGcode = false } = opts;
  const isNonFGCode = (output === 'gcode' && !fgGcode);
  const model = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
  const taskConfig = {
    model,
    travelSpeed: model === 'fpm1' ? 4000 : 100,
    enableAutoFocus:
      doesSupportDiodeAndAF &&
      BeamboxPreference.read('enable-autofocus') &&
      supportInfo.autoFocus,
    enableDiode:
      doesSupportDiodeAndAF &&
      BeamboxPreference.read('enable-diode') &&
      supportInfo.hybridLaser,
    shouldUseFastGradient: shouldUseFastGradient && !isNonFGCode,
    shouldMockFastGradient: isNonFGCode,
    vectorSpeedConstraint: BeamboxPreference.read('vector_speed_contraint') !== false,
    paddingAccel: await getAdorPaddingAccel(device || TopBarController.getSelectedDevice()),
  };

  if (isCanceled) { // TODO: Copy this logic to regular fetchTaskCode
    return {};
  }

  const getTaskCodeResult = await getTaskCode(
    output,
    output === 'fcode' ? getExportOpt(taskConfig).config : taskConfig
  );
  const { taskCodeBlob } = getTaskCodeResult;
  let { fileTimeCost } = getTaskCodeResult;

  if (isNonFGCode) {
    const fcodeRes = await getTaskCode('fcode', {});
    fileTimeCost = fcodeRes.fileTimeCost;
  }

  Progress.popById('fetch-task');
  if (isCanceled || taskCodeBlob == null) {
    return {};
  }
  if (output === 'gcode') {
    return {
      gcodeBlob: taskCodeBlob,
      thumbnailBlobURL,
      fileTimeCost,
    };
  }
  return {
    fcodeBlob: taskCodeBlob,
    thumbnailBlobURL,
    fileTimeCost,
  };
};

// Send svg string and calculate the frame
const fetchFraming = async (): Promise<boolean> => {
  svgCanvas.removeUnusedDefs();
  SymbolMaker.switchImageSymbolForAll(false);
  Progress.openNonstopProgress({
    id: 'upload-scene',
    caption: i18n.lang.beambox.popup.progress.calculating,
    message: lang.beambox.bottom_right_panel.convert_text_to_path_before_export,
  });
  // Convert text to path
  const res = await FontFuncs.tempConvertTextToPathAmoungSvgcontent();
  if (!res) {
    Progress.popById('upload-scene');
    SymbolMaker.switchImageSymbolForAll(true);
    return false;
  };

  const svgString = svgCanvas.getSvgString();
  const uploadConfig = {
    model: BeamboxPreference.read('workarea') || BeamboxPreference.read('model'),
    rotaryMode: BeamboxPreference.read('rotary_mode'),
    engraveDpi: dpiTextMap[BeamboxPreference.read('engrave_dpi')]
  };
  await FontFuncs.revertTempConvert();

  const loadResult = await swiftrayClient.loadSVG({
    data: svgString,
    name: 'svgeditor.svg',
    uploadName: 'framing.svg',
    extension: 'svg',
    thumbnail: '',
  }, {
    onProgressing: onUploadProgressing,
    onFinished: onUploadFinished,
    onError: (message: string) => {
      Progress.popById('upload-scene');
      Alert.popUp({
        id: 'get-taskcode-error',
        message: `#806 ${message}\n${lang.beambox.bottom_right_panel.export_file_error_ask_for_upload}`,
        type: AlertConstants.SHOW_POPUP_ERROR,
        buttonType: AlertConstants.YES_NO,
        onYes: () => {
          AwsHelper.uploadToS3('output.bvg', svgString);
        },
      });
    },
  }, uploadConfig);
  Progress.popById('upload-scene');
  return loadResult.success;
};

// Send svg string calculate taskcode, output Fcode in default
const fetchTransferredFcodeSwiftray = async (gcodeString: string, thumbnail: string) => {
  console.warn('fetchTransferredFcode is not yet implement4ed, use fetchTaskCodeSwiftray instead');
};

export {
  fetchFraming,
  fetchTaskCodeSwiftray,
  fetchTransferredFcodeSwiftray,
};
