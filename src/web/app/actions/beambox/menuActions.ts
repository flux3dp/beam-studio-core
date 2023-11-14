import { Buffer } from 'buffer';

import Alert from 'app/actions/alert-caller';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import browser from 'implementations/browser';
import checkQuestionnaire from 'helpers/check-questionnaire';
import constant from 'app/actions/beambox/constant';
import clipboard from 'app/svgedit/operations/clipboard';
import Dialog from 'app/actions/dialog-caller';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import FileExportHelper from 'helpers/file-export-helper';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import imageEdit from 'helpers/image-edit';
import OutputError from 'helpers/output-error';
import Tutorials from 'app/actions/beambox/tutorials';
import viewMenu from 'helpers/menubar/view';
import { externalLinkMemberDashboard, signOut } from 'helpers/api/flux-id';
import { gestureIntroduction } from 'app/constants/media-tutorials';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { importBvgString } from 'app/svgedit/operations/import/importBvg';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const { lang } = i18n;

const getExampleFileName = (key: string) => {
  const workarea = BeamboxPreference.read('workarea') || 'fbm1';
  if (!constant.adorModels.includes(workarea)) {
    return {
      example: 'examples/badge.bvg',
      mat_test_old: 'examples/mat_test_old.bvg',
      mat_test_simple_cut: 'examples/mat_test_simple_cut.bvg',
      mat_test_cut: 'examples/mat_test_cut.bvg',
      mat_test_engrave: 'examples/mat_test_engrave.bvg',
      mat_test_line: 'examples/mat_test_line.bvg',
      focus_probe: 'examples/focus_probe.bvg',
      hello_beambox: 'examples/hello-beambox.bvg',
    }[key];
  }
  return {
    example: 'examples/badge.bvg',
    hello_beambox: 'examples/hello-beambox.bvg',
    mat_test_old: 'examples/ador_engraving_test_classic.bvg',
    mat_test_simple_cut: 'examples/ador_cutting_test_simple.bvg',
    mat_test_cut: 'examples/ador_cutting_test.bvg',
    mat_test_engrave: 'examples/ador_engraving_test.bvg',
    mat_test_printing: 'examples/ador_color_ring.bvg',
    ador_example_laser: 'examples/ador_example_laser.bvg',
    ador_example_printing_full: 'examples/ador_example_printing_full.bvg',
    ador_example_printing_single: 'examples/ador_example_printing_single.bvg',
  }[key];
};

const loadExampleFile = async (path: string) => {
  if (!path) {
    Alert.popUp({ message: lang.message.unsupported_example_file });
    return;
  }
  const res = await FileExportHelper.toggleUnsavedChangedDialog();
  if (!res) return;
  const oReq = new XMLHttpRequest();
  oReq.open(
    'GET',
    window.FLUX.version === 'web' ? `https://beam-studio-web.s3.ap-northeast-1.amazonaws.com/${path}` : path,
    true
  );
  oReq.responseType = 'blob';

  oReq.onload = async function onload() {
    const resp = oReq.response;
    const buf = Buffer.from(await new Response(resp).arrayBuffer());
    let string = buf.toString();
    if (i18n.getActiveLang() && i18n.getActiveLang() !== 'en') {
      const LANG = i18n.lang.beambox.right_panel.layer_panel;
      string = string.replace(/Engraving/g, LANG.layer_engraving).replace(/Cutting/g, LANG.layer_cutting);
    }
    await importBvgString(string);
  };

  oReq.send();
};

export default {
  PREFERENCE: async (): Promise<void> => {
    Dialog.clearAllDialogComponents();
    const res = await FileExportHelper.toggleUnsavedChangedDialog();
    if (res) window.location.hash = '#studio/settings';
  },
  OPEN: (): void => {
    FnWrapper.importImage();
  },
  ADD_NEW_MACHINE: async () => {
    const res = await FileExportHelper.toggleUnsavedChangedDialog();
    if (res) window.location.hash = '#initialize/connect/select-machine-model';
  },
  SIGN_IN: (): void => Dialog.showLoginDialog(),
  IMPORT_EXAMPLE: () => loadExampleFile(getExampleFileName('example')),
  IMPORT_EXAMPLE_ADOR_LASER: () => loadExampleFile(getExampleFileName('ador_example_laser')),
  IMPORT_EXAMPLE_ADOR_PRINT_SINGLE: () => loadExampleFile(getExampleFileName('ador_example_printing_single')),
  IMPORT_EXAMPLE_ADOR_PRINT_FULL: () => loadExampleFile(getExampleFileName('ador_example_printing_full')),
  IMPORT_MATERIAL_TESTING_OLD: () => loadExampleFile(getExampleFileName('mat_test_old')),
  IMPORT_MATERIAL_TESTING_SIMPLECUT: () => loadExampleFile(getExampleFileName('mat_test_simple_cut')),
  IMPORT_MATERIAL_TESTING_CUT: () => loadExampleFile(getExampleFileName('mat_test_cut')),
  IMPORT_MATERIAL_TESTING_ENGRAVE: () => loadExampleFile(getExampleFileName('mat_test_engrave')),
  IMPORT_MATERIAL_TESTING_LINE: () => loadExampleFile(getExampleFileName('mat_test_line')),
  IMPORT_MATERIAL_TESTING_PRINT: () => loadExampleFile(getExampleFileName('mat_test_printing')),
  IMPORT_ACRYLIC_FOCUS_PROBE: () => loadExampleFile(getExampleFileName('focus_probe')),
  IMPORT_HELLO_BEAMBOX: () => loadExampleFile(getExampleFileName('hello_beambox')),
  SAVE_SCENE: () => FileExportHelper.saveFile(),
  SAVE_AS: () => FileExportHelper.saveAsFile(),
  EXPORT_BVG: () => FileExportHelper.exportAsBVG(),
  EXPORT_SVG: () => FileExportHelper.exportAsSVG(),
  EXPORT_PNG: () => FileExportHelper.exportAsImage('png'),
  EXPORT_JPG: () => FileExportHelper.exportAsImage('jpg'),
  EXPORT_FLUX_TASK: (): void => {
    ExportFuncs.exportFcode();
    // if (window.FLUX.version === 'web') Dialog.forceLoginWrapper(() => ExportFuncs.exportFcode());
    // else ExportFuncs.exportFcode();
  },
  UNDO: () => svgEditor.clickUndo(),
  REDO: () => svgEditor.clickRedo(),
  GROUP: () => FnWrapper.groupSelected(),
  UNGROUP: () => FnWrapper.ungroupSelected(),
  DELETE: () => svgEditor.deleteSelected(),
  DUPLICATE: () => clipboard.cloneSelectedElements(20, 20),
  OFFSET: () => svgEditor.triggerOffsetTool(),
  IMAGE_SHARPEN: () => Dialog.showPhotoEditPanel('sharpen'),
  IMAGE_CROP: () => Dialog.showCropPanel(),
  IMAGE_INVERT: () => imageEdit.colorInvert(),
  IMAGE_STAMP: () => imageEdit.generateStampBevel(),
  IMAGE_VECTORIZE: () => imageEdit.traceImage(),
  IMAGE_CURVE: () => Dialog.showPhotoEditPanel('curve'),
  ALIGN_TO_EDGES: () => svgCanvas.toggleBezierPathAlignToEdge(),
  DISASSEMBLE_USE: () => svgCanvas.disassembleUse2Group(),
  DECOMPOSE_PATH: () => svgCanvas.decomposePath(),
  SVG_NEST: () => Dialog.showSvgNestButtons(),
  LAYER_COLOR_CONFIG: () => Dialog.showLayerColorConfig(),
  DOCUMENT_SETTING: () => Dialog.showDocumentSettings(),
  CLEAR_SCENE: () => svgEditor.clearScene(),
  START_TUTORIAL: () => {
    const continuousDrawing = BeamboxPreference.read('continuous_drawing');
    BeamboxPreference.write('continuous_drawing', false);
    Tutorials.startNewUserTutorial(() => {
      BeamboxPreference.write('continuous_drawing', continuousDrawing);
      Alert.popUp({ message: lang.tutorial.tutorial_complete });
    });
  },
  START_UI_INTRO: () => Tutorials.startInterfaceTutorial(() => { }),
  START_GESTURE_INTRO: (): Promise<void> => Dialog.showMediaTutorial(gestureIntroduction),
  ZOOM_IN: () => svgEditor.zoomIn(),
  ZOOM_OUT: () => svgEditor.zoomOut(),
  FITS_TO_WINDOW: () => svgEditor.resetView(),
  ZOOM_WITH_WINDOW: () => viewMenu.toggleZoomWithWindow(),
  SHOW_GRIDS: () => viewMenu.toggleGrid(),
  SHOW_RULERS: () => viewMenu.toggleRulers(),
  SHOW_LAYER_COLOR: () => viewMenu.toggleLayerColor(),
  ANTI_ALIASING: () => viewMenu.toggleAntiAliasing(),
  NETWORK_TESTING: () => Dialog.showNetworkTestingPanel(),
  ABOUT_BEAM_STUDIO: () => Dialog.showAboutBeamStudio(),
  MANAGE_ACCOUNT: () => externalLinkMemberDashboard(),
  SIGN_OUT: () => signOut(),
  QUESTIONNAIRE: async () => {
    const res = await checkQuestionnaire();
    if (!res) {
      Alert.popUp({ message: i18n.lang.beambox.popup.questionnaire.unable_to_get_url });
      return;
    }
    let url: null;
    if (res.version > 0 && res.urls) {
      url = res.urls[i18n.getActiveLang()] || res.urls.en;
    }
    if (!url) {
      Alert.popUp({
        message: i18n.lang.beambox.popup.questionnaire.no_questionnaire_available,
      });
      return;
    }
    browser.open(url);
  },
  CHANGE_LOGS: () => Dialog.showChangLog(),
  CUT: () => svgEditor.cutSelected(),
  COPY: () => svgEditor.copySelected(),
  PASTE: () => clipboard.pasteInCenter(),
  PASTE_IN_PLACE: () => clipboard.pasteElements('in_place'),
  BUG_REPORT: () => {
    OutputError.downloadErrorLog();
  },
};
