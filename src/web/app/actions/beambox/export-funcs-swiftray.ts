/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import AwsHelper from 'helpers/aws-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import convertClipPath from 'helpers/layer/convertClipPath';
import convertShapeToBitmap from 'helpers/layer/convertShapeToBitmap';
import curveEngravingModeController from 'app/actions/canvas/curveEngravingModeController';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import moduleOffsets from 'app/constants/layer-module/module-offsets';
import presprayArea from 'app/actions/canvas/prespray-area';
import Progress from 'app/actions/progress-caller';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import storage from 'implementations/storage';
import SymbolMaker from 'helpers/symbol-maker';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import updateImagesResolution from 'helpers/image/updateImagesResolution';
import VersionChecker from 'helpers/version-checker';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IBaseConfig, IFcodeConfig } from 'interfaces/ITaskConfig';
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

const getExportOpt = (opt: IBaseConfig) => {
  const { model } = opt;
  const config: IFcodeConfig = {
    model,
    hardware_name: 'beambox',
    travel_speed: 7500,
    path_travel_speed: 7500,
    acc: 4000,
  };

  const isDevMode = isDev();
  const paddingAccel = BeamboxPreference.read('padding_accel');
  const useDevPaddingAcc = isDevMode && paddingAccel;
  const { minSpeed: modelMinSpeed, rotary } = getWorkarea(model);
  if (model === 'fhexa1') {
    config.hardware_name = 'hexa';
    if (!useDevPaddingAcc) config.acc = 7500;
  } else if (model === 'fbb1p') config.hardware_name = 'beambox-pro';
  else if (model === 'fbm1') config.hardware_name = 'beamo';
  else if (model === 'ado1') {
    config.hardware_name = 'ador';
    if (!useDevPaddingAcc) config.acc = opt.paddingAccel || 3200;
  }
  if (useDevPaddingAcc) config.acc = paddingAccel;

  const rotaryMode = BeamboxPreference.read('rotary_mode');
  if (rotaryMode) {
    config.spinning_axis_coord = rotaryAxis.getPosition();
    if (rotaryMode !== 1 && rotary.includes(rotaryMode)) {
      config.rotary_y_ratio = Math.round(constant.rotaryYRatio[rotaryMode] * 10 ** 6) / 10 ** 6;
    }
  }

  if (constant.adorModels.includes(model)) {
    const { x, y, w, h } = presprayArea.getPosition(true);
    const workareaWidth = getWorkarea(model).width;
    config.prespray = rotaryMode ? [workareaWidth - 12, 45, 12, h] : [x, y, w, h];
    if (!isDevMode || BeamboxPreference.read('multipass-compensation') !== false)
      config.multipass_compensation = true;
    if (!isDevMode || BeamboxPreference.read('one-way-printing') !== false)
      config.one_way_printing = true;
  }

  if (
    i18n.getActiveLang() === 'zh-cn' &&
    BeamboxPreference.read('blade_radius') &&
    BeamboxPreference.read('blade_radius') > 0
  ) {
    config.blade_radius = BeamboxPreference.read('blade_radius');
    if (BeamboxPreference.read('blade_precut')) {
      config.precut_at = [
        BeamboxPreference.read('precut_x') || 0,
        BeamboxPreference.read('precut_y') || 0,
      ];
    }
  }

  if (opt.enableAutoFocus) {
    config.enable_autofocus = true;
    if (BeamboxPreference.read('af-offset')) config.z_offset = BeamboxPreference.read('af-offset');
  }
  if (opt.enableDiode) {
    config.support_diode = true;
    config.diode_offset = [
      BeamboxPreference.read('diode_offset_x') || 0,
      BeamboxPreference.read('diode_offset_y') || 0,
    ];
    if (BeamboxPreference.read('diode-one-way-engraving') !== false) {
      config.diode_one_way_engraving = true;
    }
  }
  const isBorderLess = BeamboxPreference.read('borderless') && getSupportInfo(model).openBottom;
  if (BeamboxPreference.read('enable_mask') || isBorderLess) {
    const clipRect: [number, number, number, number] = [0, 0, 0, 0]; // top right bottom left
    if (isBorderLess) clipRect[1] = constant.borderless.safeDistance.X;
    config.clip = clipRect;
  }
  if (opt.shouldUseFastGradient) config.support_fast_gradient = true;
  if (opt.shouldMockFastGradient) config.mock_fast_gradient = true;
  if (opt.vectorSpeedConstraint) config.has_vector_speed_constraint = true;
  if (modelMinSpeed < 3) config.min_speed = modelMinSpeed;
  else if (BeamboxPreference.read('enable-low-speed')) config.min_speed = 1;
  if (BeamboxPreference.read('reverse-engraving')) config.is_reverse_engraving = true;
  if (BeamboxPreference.read('enable-custom-backlash')) config.custom_backlash = true;
  let printingTopPadding: number;
  let printingBotPadding: number;
  if (rotaryMode && constant.adorModels.includes(model)) {
    printingTopPadding = 43;
    printingBotPadding = 43;
  }
  if (isDevMode) {
    let storageValue = localStorage.getItem('min_engraving_padding');
    if (storageValue) {
      config.min_engraving_padding = Number(storageValue);
    }
    storageValue = localStorage.getItem('min_printing_padding');
    if (storageValue) {
      config.min_printing_padding = Number(storageValue);
    }
    storageValue = localStorage.getItem('printing_top_padding');
    if (storageValue && !Number.isNaN(Number(storageValue))) {
      printingTopPadding = Number(storageValue);
    }
    storageValue = localStorage.getItem('printing_bot_padding');
    if (storageValue && !Number.isNaN(Number(storageValue))) {
      printingBotPadding = Number(storageValue);
    }
    storageValue = localStorage.getItem('nozzle_votage');
    if (storageValue) {
      config.nozzle_votage = Number(storageValue);
    }
    storageValue = localStorage.getItem('nozzle_pulse_width');
    if (storageValue) {
      config.nozzle_pulse_width = Number(storageValue);
    }
    storageValue = localStorage.getItem('travel_speed');
    if (storageValue && !Number.isNaN(Number(storageValue))) {
      config.travel_speed = Number(storageValue);
    }
    storageValue = localStorage.getItem('path_travel_speed');
    if (storageValue && !Number.isNaN(Number(storageValue))) {
      config.path_travel_speed = Number(storageValue);
    }
    storageValue = localStorage.getItem('a_travel_speed');
    if (storageValue && !Number.isNaN(Number(storageValue))) {
      config.a_travel_speed = Number(storageValue);
    }
  }
  if (printingTopPadding !== undefined) {
    config.printing_top_padding = printingTopPadding;
  }
  if (printingBotPadding !== undefined) {
    config.printing_bot_padding = printingBotPadding;
  }
  if (model === 'ado1') {
    const offsets = { ...moduleOffsets, ...BeamboxPreference.read('module-offsets') };
    config.module_offsets = offsets;
  }

  const loopCompensation = Number(storage.get('loop_compensation') || '0');
  if (loopCompensation > 0) config.loop_compensation = loopCompensation;

  if (curveEngravingModeController.hasArea()) {
    const data = {
      bbox: curveEngravingModeController.data.bbox,
      points: curveEngravingModeController.data.points.flat().filter((p) => p[2] !== null),
      gap: curveEngravingModeController.data.gap,
    };
    config.curve_engraving = data;
  }
  return config;
};

const generateUploadFile = async (thumbnail: Blob, thumbnailUrl: string): Promise<IWrappedSwiftrayTaskFile> => {
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
  const revertClipPath = convertClipPath();
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
    output === 'fcode' ? getExportOpt(taskConfig) : taskConfig
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
