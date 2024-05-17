/*globals svgEditor:true, globalStorage, widget, svgedit, canvg, jQuery, $, DOMParser, FileReader */
/*jslint vars: true, eqeq: true, todo: true, forin: true, continue: true, regexp: true */
/*
 * svg-editor.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Pavol Rusnak
 * Copyright(c) 2010 Jeff Schiller
 * Copyright(c) 2010 Narendra Sisodiya
 * Copyright(c) 2014 Brett Zamir
 *
 */

// Dependencies:
// 1) units.js
// 2) browser.js
// 3) svgcanvas.js

/*
TODOS
1. JSDoc
*/
import clipboard from 'app/svgedit/operations/clipboard';
import history from 'app/svgedit/history/history';
import svgCanvasClass from 'app/svgedit/svgcanvas';
import textActions from 'app/svgedit/text/textactions';
import textEdit from 'app/svgedit/text/textedit';
import textPathEdit from 'app/actions/beambox/textPathEdit';
import workareaManager from 'app/svgedit/workarea';
import { deleteSelectedElements } from 'app/svgedit/operations/delete';
import { moveSelectedElements } from 'app/svgedit/operations/move';

import canvasEvents from 'app/actions/canvas/canvasEvents';
import ToolPanelsController from './toolPanelsController';
import RightPanelController from 'app/views/beambox/Right-Panels/contexts/RightPanelController';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import { getNextStepRequirement } from 'app/views/tutorials/tutorialController';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { NounProjectPanelController } from 'app/views/beambox/Noun-Project-Panel';
import BeamboxPreference from './beambox-preference';
import Constant from './constant';
import OpenBottomBoundaryDrawer from './open-bottom-boundary-drawer';
import PreviewModeController from './preview-mode-controller';
import Alert from '../alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import TutorialConstants from 'app/constants/tutorial-constants';
import Progress from '../progress-caller';
import BeamFileHelper from 'helpers/beam-file-helper';
import ImageData from 'helpers/image-data';
import storage from 'implementations/storage';
import pdfHelper from 'implementations/pdfHelper';
import Shortcuts from 'helpers/shortcuts';
import i18n from 'helpers/i18n';
import SvgLaserParser from 'helpers/api/svg-laser-parser';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { IFont } from 'interfaces/IFont';
import { IIcon } from 'interfaces/INoun-Project'
import { IStorage, StorageKey } from 'interfaces/IStorage';
import ISVGConfig from 'interfaces/ISVGConfig';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import getExifRotationFlag from 'helpers/image/getExifRotationFlag';
import importBitmap from 'app/svgedit/operations/import/importBitmap';
import importBvg from 'app/svgedit/operations/import/importBvg';
import importDxf from 'app/svgedit/operations/import/importDxf';
import importSvg from 'app/svgedit/operations/import/importSvg';
import readBitmapFile from 'app/svgedit/operations/import/readBitmapFile';
import { isMobile } from 'helpers/system-helper';

if (svgCanvasClass) {
  console.log('svgCanvas loaded successfully');
}

const LANG = i18n.lang.beambox;
const svgWebSocket = SvgLaserParser({ type: 'svgeditor' });
// TODO: change to require('svgedit')
const { svgedit, $ } = window;

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');
const workareaEvents = eventEmitterFactory.createEventEmitter('workarea');

declare global {
  interface JQueryStatic {
    pref: any
    jGraduate: any
    confirm: any
    getSvgIcon: any
    select: any
    prompt: any
    alert: any
    svgIcons: any
    SvgCanvas: any
    deparam: any
    process_cancel: any
  }

  interface JQuery {
    andSelf(): JQuery
    SpinButton(options: any): JQuery
    slider(arg0?: any, arg1?: any, arg3?: any): JQuery
    draggable(options: any): JQuery
    contextMenu: any
    jGraduate: any
  }
}

interface ISVGEditor {
  addExtension: () => void
  canvas: any
  clickSelect: (clearSelection?: boolean) => void
  curConfig: ISVGConfig
  curPrefs: ISVGPref
  init: () => void
  putLocale(lang: string | number | string[], good_langs: any[])
  readSVG: (blob: any, type: any, layerName: any) => Promise<unknown>
  replaceBitmap: any
  runCallbacks: () => void
  setConfig: (opts: any, cfgCfg: any) => void
  setIcon: (elem: any, icon_id: any) => void
  setImageURL: (url: any) => void
  setLang: (lang: any, allStrings: any) => void
  setPanning: (active: any) => void
  storage: IStorage
  toolButtonClick: (button: any, noHiding: any) => boolean
  updateRulers: () => void
  triggerGridTool: () => void
  triggerOffsetTool: () => void
  handleFile: (file: any) => Promise<void>
  importLaserConfig: (file: any) => Promise<void>
  openPrep(arg0: (ok: any) => void)
  ready(arg0: () => void)
  clickUndo: () => void
  clickRedo: () => void
  clipboardData: any
  isClipboardDataReady: any
  triggerNestTool: () => void
  deleteSelected: () => void
  tool_scale: number
  exportWindowCt: number
  langChanged: boolean
  showSaveWarning: boolean
  storagePromptClosed: boolean
  dimensions: number[]
  uiStrings: any
  updateContextPanel: () => void
  clearScene: () => void
  cutSelected: () => void;
  copySelected: () => void;
}

interface ISVGPref {
  // EDITOR OPTIONS (DIALOG)
  lang?: string, // Default to "en" if locale.js detection does not detect another language
  bkgd_color?: string,
  bkgd_url?: string,
  // DOCUMENT PROPERTIES (DIALOG)
  // ALERT NOTICES
  // Only shows in UI as far as alert notices, but useful to remember, so keeping as pref
  save_notice_done?: boolean,
  export_notice_done?: boolean
}

const svgEditor = window['svgEditor'] = (function () {
  // set workarea according to default model.
  const defaultModel = BeamboxPreference.read('model');
  if (defaultModel !== undefined) {
    BeamboxPreference.write('workarea', defaultModel);
  }
  // EDITOR PROPERTIES: (defined below)
  //		curPrefs, curConfig, canvas, storage, uiStrings
  //
  // STATE MAINTENANCE PROPERTIES
  const workarea = BeamboxPreference.read('workarea') as WorkAreaModel;
  const { pxWidth, pxHeight, pxDisplayHeight } = getWorkarea(workarea);
  const editor: ISVGEditor = {
    addExtension: () => { },
    canvas: null,
    clickSelect: () => { },
    curConfig: null,
    curPrefs: null,
    init: () => { },
    putLocale: (lang: string | number | string[], good_langs: any[]) => { },
    readSVG: async (blob: any, type: any, layerName: any) => { },
    replaceBitmap: null,
    runCallbacks: () => { },
    setConfig: (opts: any, cfgCfg: any) => { },
    setIcon: (elem: any, icon_id: any) => { },
    setImageURL: (url: any) => { },
    setLang: (lang: any, allStrings: any) => { },
    setPanning: (active: any) => { },
    storage: storage,
    toolButtonClick: (button: any, noHiding: any) => { return false },
    updateRulers: () => { },
    triggerGridTool: () => { },
    triggerOffsetTool: () => { },
    handleFile: async (file) => { },
    importLaserConfig: async (file) => { },
    openPrep: () => { },
    ready: () => { },
    clickUndo: () => { },
    clickRedo: () => { },
    clipboardData: null,
    isClipboardDataReady: false,
    triggerNestTool: () => { },
    deleteSelected: () => { },
    tool_scale: 1, // Dependent on icon size, so any use to making configurable instead? Used by JQuerySpinBtn.js
    exportWindowCt: 0,
    langChanged: false,
    showSaveWarning: false,
    storagePromptClosed: false, // For use with ext-storage.js
    dimensions: [pxWidth, pxDisplayHeight ?? pxHeight],
    uiStrings: {},
    updateContextPanel: () => {},
    clearScene: () => {},
    cutSelected: () => {},
    copySelected: () => {},
  };

  const availableLangMap = {
    'de': 'de',
    'en': 'en',
    'es': 'es',
    'pt': 'pt',
    'ja': 'ja',
    'kr': 'kr',
    'zh-tw': 'zh-TW',
    'zh-cn': 'zh-CN',
    fr: 'fr',
    nl: 'nl',
    pl: 'pl',
    da: 'da',
    el: 'el',
    fi: 'fi',
    id: 'id',
    it: 'it',
    ms: 'ms',
    no: 'no',
    se: 'se',
    th: 'th',
    vi: 'vi',
  }
  const defaultFont = storage.get('default-font') as IFont;
  let pressedKey = [];

  document.addEventListener('keydown', (e) => {
    if (!pressedKey.includes(e.key)) {
      pressedKey.push(e.key);
    }
  });

  document.addEventListener('keyup', (e) => {
    const index = pressedKey.findIndex((key) => key === e.key);
    if (index > 0) {
      pressedKey.splice(index, 1);
    }
  });

  window.addEventListener('blur', (e) => {
    pressedKey = [];
  });

  let svgCanvas: ISVGCanvas;
  var urldata,
    Utils = window['svgedit'].utilities,
    isReady = false,
    customExportImage = false,
    customExportPDF = false,
    callbacks = [],
    /**
         * PREFS AND CONFIG
         */
    // The iteration algorithm for defaultPrefs does not currently support array/objects
    defaultPrefs: ISVGPref = {
      // EDITOR OPTIONS (DIALOG)
      lang: availableLangMap[i18n.getActiveLang()] || 'en', // Default to "en" if locale.js detection does not detect another language
      bkgd_color: '#FFF',
      bkgd_url: '',
      // DOCUMENT PROPERTIES (DIALOG)
      // ALERT NOTICES
      // Only shows in UI as far as alert notices, but useful to remember, so keeping as pref
      save_notice_done: false,
      export_notice_done: false
    },
    curPrefs: ISVGPref = {},
    // Note: The difference between Prefs and Config is that Prefs
    //   can be changed in the UI and are stored in the browser,
    //   while config cannot
    curConfig: ISVGConfig = {
      // We do not put on defaultConfig to simplify object copying
      //   procedures (we obtain instead from defaultExtensions)
      extensions: [],
      /**
           * Can use window.location.origin to indicate the current
           * origin. Can contain a '*' to allow all domains or 'null' (as
           * a string) to support all file:// URLs. Cannot be set by
           * URL for security reasons (not safe, at least for
           * privacy or data integrity of SVG content).
           * Might have been fairly safe to allow
           *   `new URL(window.location.href).origin` by default but
           *   avoiding it ensures some more security that even third
           *   party apps on the same domain also cannot communicate
           *   with this app by default.
           * For use with ext-xdomain-messaging.js
           * @todo We might instead make as a user-facing preference.
           */
      allowedOrigins: []
    },
    defaultExtensions = [
      'ext-markers.js',
      'ext-connector.js',
      'ext-imagelib.js',
      'ext-polygon.js',
      'ext-star.js',
      'ext-panning.js',
      'ext-multiselect.js',
      // 'ext-storage.js',
      // 'ext-eyedropper.js',
      'ext-closepath.js',
    ],
    defaultConfig: ISVGConfig = {
      // Todo: svgcanvas.js also sets and checks: selectNew; add here?
      // Change the following to preferences and add pref controls to the UI (e.g., initTool, wireframe, showlayers)?
      canvasName: 'default',
      initFill: {
        color: 'FFFFFF',
        opacity: 0
      },
      initStroke: {
        width: 1,
        color: '000000', // solid black
        opacity: 1
      },
      text: {
        stroke_width: 1,
        font_size: window.FLUX.version === 'web' ? 200 : 100,
        font_family: defaultFont ? defaultFont.family : 'Arial',
        font_postscriptName: defaultFont ? defaultFont.postscriptName : 'ArialMT',
        fill: '#fff',
        fill_opacity: '0',
        text_anchor: 'start'
      },
      initOpacity: 1,
      initTool: 'select',
      exportWindowType: 'new', // 'same' (todo: also support 'download')
      wireframe: true,
      showlayers: true,
      no_save_warning: true,
      // PATH CONFIGURATION
      // The following path configuration items are disallowed in the URL (as should any future path configurations)
      imgPath: 'js/lib/svgeditor/images/',
      langPath: 'js/lib/svgeditor/locale/',
      extPath: 'js/lib/svgeditor/extensions/',
      jGraduatePath: 'js/lib/svgeditor/jgraduate/images/',
      // DOCUMENT PROPERTIES
      // Change the following to a preference (already in the Document Properties dialog)?
      dimensions: editor.dimensions,
      // EDITOR OPTIONS
      // Change the following to preferences (already in the Editor Options dialog)?
      gridSnapping: false,
      baseUnit: 'px',
      defaultUnit: storage.get('default-units') || 'mm',
      snappingStep: 10,
      showRulers: true,
      // URL BEHAVIOR CONFIGURATION
      preventAllURLConfig: true,
      preventURLContentLoading: true,
      // EXTENSION CONFIGURATION (see also preventAllURLConfig)
      lockExtensions: false, // Disallowed in URL setting
      noDefaultExtensions: false, // noDefaultExtensions can only be meaningfully used in config.js or in the URL
      // EXTENSION-RELATED (GRID)
      showGrid: true, // Set by ext-grid.js
      // EXTENSION-RELATED (STORAGE)
      noStorageOnLoad: false, // Some interaction with ext-storage.js; prevent even the loading of previously saved local storage
      forceStorage: false, // Some interaction with ext-storage.js; strongly discouraged from modification as it bypasses user privacy by preventing them from choosing whether to keep local storage or not
      emptyStorageOnDecline: false // Used by ext-storage.js; empty any prior storage if the user declines to store
    },
    /**
         * LOCALE
         * @todo Can we remove now that we are always loading even English? (unless locale is set to null)
         */
    uiStrings = editor.uiStrings = {
      common: {
        ok: 'OK',
        cancel: 'Cancel',
        key_up: 'Up',
        key_down: 'Down',
        key_backspace: 'Backspace',
        key_del: 'Del'
      },
      // This is needed if the locale is English, since the locale strings are not read in that instance.
      layers: {
        layer: 'Layer'
      },
      notification: {
        invalidAttrValGiven: 'Invalid value given',
        noContentToFitTo: 'No content to fit to',
        dupeLayerName: 'There is already a layer named that!',
        enterUniqueLayerName: 'Please enter a unique layer name',
        enterNewLayerName: 'Please enter the new layer name',
        layerHasThatName: 'Layer already has that name',
        QwantToOpen: 'Do you want to open a new file?\nThis will also erase your undo history!',
        QerrorsRevertToSource: 'There were parsing errors in your SVG source.\nRevert back to original SVG source?',
        QignoreSourceChanges: 'Ignore changes made to SVG source?',
        featNotSupported: 'Feature not supported',
        enterNewImgURL: 'Enter the new image URL',
        defsFailOnSave: 'NOTE: Due to a bug in your browser, this image may appear wrong (missing gradients or elements). It will however appear correct once actually saved.',
        saveFromBrowser: 'Select \'Save As...\' in your browser to save this image as a %s file.',
        noteTheseIssues: 'Also note the following issues: ',
        unsavedChanges: 'There are unsaved changes.',
        enterNewLinkURL: 'Enter the new hyperlink URL',
        URLloadFail: 'Unable to load from URL',
        retrieving: 'Retrieving \'%s\' ...'
      }
    };
  /**
       * EXPORTS
       */

  /**
       * Store and retrieve preferences
       * @param {string} key The preference name to be retrieved or set
       * @param {string} [val] The value. If the value supplied is missing or falsey, no change to the preference will be made.
       * @returns {string} If val is missing or falsey, the value of the previously stored preference will be returned.
       * @todo Can we change setting on the jQuery namespace (onto editor) to avoid conflicts?
       * @todo Review whether any remaining existing direct references to
       *	getting curPrefs can be changed to use $.pref() getting to ensure
       *	defaultPrefs fallback (also for sake of allowInitialUserOverride); specifically, bkgd_color could be changed so that
       *	the pref dialog has a button to auto-calculate background, but otherwise uses $.pref() to be able to get default prefs
       *	or overridable settings
       */
  $.pref = function (key, val) {
    if (val) {
      curPrefs[key] = val;
      editor.curPrefs = curPrefs; // Update exported value
      return;
    }
    return (key in curPrefs) ? curPrefs[key] : defaultPrefs[key];
  };

  /**
       * EDITOR PUBLIC METHODS
       * locale.js also adds "putLang" and "readLang" as editor methods
       * @todo Sort these methods per invocation order, ideally with init at the end
       * @todo Prevent execution until init executes if dependent on it?
       */

  /**
       * Allows setting of preferences or configuration (including extensions).
       * @param {object} opts The preferences or configuration (including extensions)
       * @param {object} [cfgCfg] Describes configuration which applies to the particular batch of supplied options
       * @param {boolean} [cfgCfg.allowInitialUserOverride=false] Set to true if you wish
       *	to allow initial overriding of settings by the user via the URL
       *	(if permitted) or previously stored preferences (if permitted);
       *	note that it will be too late if you make such calls in extension
       *	code because the URL or preference storage settings will
       *   have already taken place.
       * @param {boolean} [cfgCfg.overwrite=true] Set to false if you wish to
       *	prevent the overwriting of prior-set preferences or configuration
       *	(URL settings will always follow this requirement for security
       *	reasons, so config.js settings cannot be overridden unless it
       *	explicitly permits via "allowInitialUserOverride" but extension config
       *	can be overridden as they will run after URL settings). Should
       *   not be needed in config.js.
       */
  editor.setConfig = function (opts, cfgCfg) {
    cfgCfg = cfgCfg || {};

    function extendOrAdd(cfgObj, key, val) {
      if (cfgObj[key] && typeof cfgObj[key] === 'object') {
        $.extend(true, cfgObj[key], val);
      } else {
        cfgObj[key] = val;
      }
      return;
    }
    $.each(opts, function (key: string, val) {
      if (opts.hasOwnProperty(key)) {
        // Only allow prefs defined in defaultPrefs
        if (defaultPrefs.hasOwnProperty(key)) {
          if (cfgCfg.overwrite === false && (
            curConfig.preventAllURLConfig ||
            curPrefs.hasOwnProperty(key)
          )) {
            return;
          }
          if (cfgCfg.allowInitialUserOverride === true) {
            defaultPrefs[key] = val;
          } else {
            $.pref(key, val);
          }
        } else if (['extensions', 'allowedOrigins'].indexOf(key) > -1) {
          if (cfgCfg.overwrite === false &&
            (
              curConfig.preventAllURLConfig ||
              key === 'allowedOrigins' ||
              (key === 'extensions' && curConfig.lockExtensions)
            )
          ) {
            return;
          }
          curConfig[key] = curConfig[key].concat(val); // We will handle any dupes later
        }
        // Only allow other curConfig if defined in defaultConfig
        else if (defaultConfig.hasOwnProperty(key)) {
          if (cfgCfg.overwrite === false && (
            curConfig.preventAllURLConfig ||
            curConfig.hasOwnProperty(key)
          )) {
            return;
          }
          // Potentially overwriting of previously set config
          if (curConfig.hasOwnProperty(key)) {
            if (cfgCfg.overwrite === false) {
              return;
            }
            extendOrAdd(curConfig, key, val);
          } else {
            if (cfgCfg.allowInitialUserOverride === true) {
              extendOrAdd(defaultConfig, key, val);
            } else {
              if (defaultConfig[key] && typeof defaultConfig[key] === 'object') {
                curConfig[key] = {};
                $.extend(true, curConfig[key], val); // Merge properties recursively, e.g., on initFill, initStroke objects
              } else {
                curConfig[key] = val;
              }
            }
          }
        }
      }
    });
    editor.curConfig = curConfig; // Update exported value
  };

  editor.init = function () {

    // var host = location.hostname,
    //	onWeb = host && host.indexOf('.') >= 0;
    // Some FF versions throw security errors here when directly accessing
    try {
      if ('localStorage' in window) { // && onWeb removed so Webkit works locally
        editor.storage = storage;
      }
    } catch (err) { console.log(err); }

    // Todo: Avoid var-defined functions and group functions together, etc. where possible
    var good_langs = [];
    $('#lang_select option').each(function (this: HTMLOptionElement) {
      good_langs.push(this.value);
    });

    function setupCurPrefs() {
      curPrefs = $.extend(true, {}, defaultPrefs, curPrefs); // Now safe to merge with priority for curPrefs in the event any are already set
      // Export updated prefs
      editor.curPrefs = curPrefs;
    }

    function setupCurConfig() {
      curConfig = $.extend(true, {}, defaultConfig, curConfig); // Now safe to merge with priority for curConfig in the event any are already set

      // Now deal with extensions and other array config
      if (!curConfig.noDefaultExtensions) {
        curConfig.extensions = curConfig.extensions.concat(defaultExtensions);
      }
      // ...and remove any dupes
      $.each(['extensions', 'allowedOrigins'], function (i, cfg) {
        curConfig[cfg] = $.grep(curConfig[cfg], function (n, i) {
          return i === curConfig[cfg].indexOf(n);
        });
      });
      // Export updated config
      editor.curConfig = curConfig;
    }
    setupCurConfig();
    setupCurPrefs();

    const shouldShowRulers = !!BeamboxPreference.read('show_rulers');
    curConfig.showRulers = shouldShowRulers;
    document.getElementById('rulers').style.display = shouldShowRulers ? '' : 'none';

    var setIcon = editor.setIcon = function (elem, icon_id) {
      var icon = (typeof icon_id === 'string') ? $.getSvgIcon(icon_id, true) : icon_id.clone();
      if (!icon) {
        console.log('NOTE: Icon image missing: ' + icon_id);
        return;
      }
      $(elem).empty().append(icon);
    };

    var extFunc = function () {
      $.each(curConfig.extensions, function () {
        var extname = this;
        if (!extname.match(/^ext-.*\.js/)) { // Ensure URL cannot specify some other unintended file in the extPath
          return;
        }
        $.getScript(curConfig.extPath + extname, function (d) {
          // Fails locally in Chrome 5
          if (!d) {
            var s = document.createElement('script');
            s.src = curConfig.extPath + extname;
            document.querySelector('head').appendChild(s);
          }
        }).fail(function (jqxhr, settings, exception) {
          console.log(exception);
        });
      });

      // var lang = ('lang' in curPrefs) ? curPrefs.lang : null;
      editor.putLocale(null, good_langs);
    };

    // Load extensions
    // Bit of a hack to run extensions in local Opera/IE9
    if (document.location.protocol === 'file:') {
      setTimeout(extFunc, 100);
    } else {
      extFunc();
    }
    editor.runCallbacks();
    window['svgCanvas'] = editor.canvas = svgCanvas = new $.SvgCanvas(document.getElementById('svgcanvas'), curConfig);
    OpenBottomBoundaryDrawer.update();
    var resize_timer, Actions,
      path = svgCanvas.pathActions,
      undoMgr = svgCanvas.undoMgr,
      defaultImageURL = curConfig.imgPath + 'logo.png',
      workarea = $('#workarea'),
      // layer_menu = $('#cmenu_layers'), // Unused
      exportWindow = null,
      zoomInIcon = 'crosshair',
      zoomOutIcon = 'crosshair';

    // For external openers
    (function () {
      // let the opener know SVG Edit is ready (now that config is set up)
      var svgEditorReadyEvent,
        w = window.opener || window.parent;
      if (w) {
        try {
          svgEditorReadyEvent = w.document.createEvent('Event');
          svgEditorReadyEvent.initEvent('svgEditorReady', true, true);
          w.document.documentElement.dispatchEvent(svgEditorReadyEvent);
        } catch (e) { console.log(e); }
      }
    })();

    // This sets up alternative dialog boxes. They mostly work the same way as
    // their UI counterparts, expect instead of returning the result, a callback
    // needs to be included that returns the result as its first parameter.
    // In the future we may want to add additional types of dialog boxes, since
    // they should be easy to handle this way.
    (function () {
      $('#dialog_container').draggable({
        cancel: '#dialog_content, #dialog_buttons *',
        containment: 'window'
      });
      var box = $('#dialog_box'),
        btn_holder = $('#dialog_buttons'),
        dialog_content = $('#dialog_content'),
        dbox = function (type, msg?, callback?, defaultVal?, opts?, changeCb?, checkbox?) {
          var ok, ctrl, chkbx;
          dialog_content.html('<p>' + msg.replace(/\n/g, '</p><p>') + '</p>')
            .toggleClass('prompt', (type === 'prompt'));
          btn_holder.empty();

          ok = $('<input type="button" value="' + uiStrings.common.ok + '">').appendTo(btn_holder);

          if (type !== 'alert') {
            $('<input type="button" value="' + uiStrings.common.cancel + '">')
              .appendTo(btn_holder)
              .click(function () {
                box.hide();
                if (callback) {
                  callback(false);
                }
              });
          }

          if (type === 'prompt') {
            ctrl = $('<input type="text">').prependTo(btn_holder);
            ctrl.val(defaultVal || '');
            ctrl.bind('keydown', 'return', function () {
              ok.click();
            });
          } else if (type === 'select') {
            var div = $('<div style="text-align:center;">');
            ctrl = $('<select>').appendTo(div);
            if (checkbox) {
              var label = $('<label>').text(checkbox.label);
              chkbx = $('<input type="checkbox">').appendTo(label);
              chkbx.val(checkbox.value);
              if (checkbox.tooltip) {
                label.attr('title', checkbox.tooltip);
              }
              chkbx.prop('checked', !!checkbox.checked);
              div.append($('<div>').append(label));
            }
            $.each(opts || [], function (opt, val) {
              if (typeof val === 'object') {
                ctrl.append($('<option>').val(val.value).html(val.text));
              } else {
                ctrl.append($('<option>').html(val));
              }
            });
            dialog_content.append(div);
            if (defaultVal) {
              ctrl.val(defaultVal);
            }
            if (changeCb) {
              ctrl.bind('change', 'return', changeCb);
            }
            ctrl.bind('keydown', 'return', function () {
              ok.click();
            });
          } else if (type === 'process') {
            ok.hide();
          }

          box.show();

          ok.click(function () {
            box.hide();
            var resp = (type === 'prompt' || type === 'select') ? ctrl.val() : true;
            if (callback) {
              if (chkbx) {
                callback(resp, chkbx.prop('checked'));
              } else {
                callback(resp);
              }
            }
          }).focus();

          if (type === 'prompt' || type === 'select') {
            ctrl.focus();
          }
        };

      $.alert = function (msg, cb) {
        dbox('alert', msg, cb);
      };
      $.confirm = function (msg, cb) {
        dbox('confirm', msg, cb);
      };
      $.process_cancel = function (msg, cb) {
        dbox('process', msg, cb);
      };
      $.prompt = function (msg, txt, cb) {
        dbox('prompt', msg, cb, txt);
      };
      $.select = function (msg, opts, cb, changeCb, txt, checkbox) {
        dbox('select', msg, cb, txt, opts, changeCb, checkbox);
      };
    })();

    var setSelectMode = function () {
      svgCanvas.setMode('select');
      workarea.css('cursor', 'auto');
      if (PreviewModeController.isPreviewMode() || TopBarController.getTopBarPreviewMode()) {
        $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
      }
    };

    // used to make the flyouts stay on the screen longer the very first time
    // var flyoutspeed = 1250; // Currently unused
    var selectedElement = null;
    var multiselected = false;
    var origTitle = $('title:first').text();

    var togglePathEditMode = function (editmode, elems) {
      $('#path_node_panel').toggle(editmode);
      if (editmode) {
        multiselected = false;
        if (elems.length) {
          selectedElement = elems[0];
        }
      }
    };

    var saveHandler = function (wind, svg) {
      editor.showSaveWarning = false;

      // by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs)
      // can just provide their own custom save handler and might not want the XML prolog
      svg = '<?xml version="1.0"?>\n' + svg;

      // Opens the SVG in new window
      var win = wind.open('data:image/svg+xml;base64,' + Utils.encode64(svg));

      // Alert will only appear the first time saved OR the first time the bug is encountered
      var done = $.pref('save_notice_done');
      if (done !== 'all') {
        var note = uiStrings.notification.saveFromBrowser.replace('%s', 'SVG');

        // Check if FF and has <defs/>
        if (svgedit.browser.isGecko()) {
          if (svg.indexOf('<defs') !== -1) {
            // warning about Mozilla bug #308590 when applicable (seems to be fixed now in Feb 2013)
            note += '\n\n' + uiStrings.notification.defsFailOnSave;
            $.pref('save_notice_done', 'all');
            done = 'all';
          } else {
            $.pref('save_notice_done', 'part');
          }
        } else {
          $.pref('save_notice_done', 'all');
        }
        if (done !== 'part') {
          win.alert(note);
        }
      }
    };

    var exportHandler = function (win, data) {
      var issues = data.issues,
        exportWindowName = data.exportWindowName;

      if (exportWindowName) {
        exportWindow = window.open('', exportWindowName); // A hack to get the window via JSON-able name without opening a new one
      }

      exportWindow.location.href = data.datauri;
      var done = $.pref('export_notice_done');
      if (done !== 'all') {
        var note = uiStrings.notification.saveFromBrowser.replace('%s', data.type);

        // Check if there's issues
        if (issues.length) {
          var pre = '\n \u2022 ';
          note += ('\n\n' + uiStrings.notification.noteTheseIssues + pre + issues.join(pre));
        }

        // Note that this will also prevent the notice even though new issues may appear later.
        // May want to find a way to deal with that without annoying the user
        $.pref('export_notice_done', 'all');
        exportWindow.alert(note);
      }
    };

    // This is a common function used when a tool has been clicked (chosen)
    // It does several common things:
    // - removes the tool_button_current class from whatever tool currently has it
    // - hides any flyouts
    // - adds the tool_button_current class to the button passed in
    var toolButtonClick = editor.toolButtonClick = function (button, noHiding?: boolean) {
      if ($(button).hasClass('disabled')) {
        return false;
      }
      var fadeFlyouts = 'normal';
      workarea.css('cursor', 'auto');
      $('.tool_button_current').removeClass('tool_button_current').addClass('tool_button');
      $(button).addClass('tool_button_current').removeClass('tool_button');
      return true;
    };

    var clickSelect = editor.clickSelect = function (clearSelection: boolean = true) {
      if ([TutorialConstants.DRAW_A_CIRCLE, TutorialConstants.DRAW_A_RECT].includes(getNextStepRequirement())) {
        return;
      }
      svgCanvas.setMode('select');
      if (clearSelection) svgCanvas.clearSelection();
    };

    var setImageURL = editor.setImageURL = function (url) {
      if (!url) {
        url = defaultImageURL;
      }
      svgCanvas.setImageURL(url);

      if (url.indexOf('data:') === 0) {
        // data URI found
      } else {
        // regular URL
        svgCanvas.embedImage(url, function (dataURI) {
          // Couldn't embed, so show warning
          $('#url_notice').toggle(!dataURI);
          defaultImageURL = url;
        });
      }
    };

    function promptImgURL() {
      var curhref = svgCanvas.getHref(selectedElement);
      curhref = curhref.indexOf('data:') === 0 ? '' : curhref;
      $.prompt(uiStrings.notification.enterNewImgURL, curhref, function (url) {
        if (url) {
          setImageURL(url);
        }
      });
    }

    function updateRulers() {
      // draw x ruler then y ruler
      /* 這裡code很亂 值得注意的點有：
          1. ruler的位置由css下 如top和margin
          2. 當超過limit時 會畫很多個canvas 因瀏覽器canvas不能畫太長 (大約30000px) 第一個canvas畫不下時就比第二個canvas拿出來繼續畫
          3. 上述這些canvas根據css margin排列 因某種神秘原因ruler_y的canvas要加上margin-top:-3px
      */
      const unit = storage.get('default-units');

      function updateRuler(axis: string) {
        // axis = x or y
        const isX = (axis === 'x');
        const side = isX ? 'width' : 'height';
        const otherSide = isX ? 'height' : 'width';

        const $rulersWrapper = $('#ruler_' + axis + ' > div');
        const svgcanvas = document.getElementById('svgcanvas');
        if (!svgcanvas) return;
        const total_len = isX ? svgcanvas.clientWidth : svgcanvas.clientHeight;
        const limit = 3000;
        const rulersCount = parseInt(String(total_len / limit), 10) + 1;


        $rulersWrapper.empty();
        $rulersWrapper[side](total_len + 'px');

        const rulers = (new Array(rulersCount))
          .fill(null)
          .map(x => document.createElement('canvas'));
        (function generateEmptyCanvas() {
          const devicePixelRatio = window.devicePixelRatio; // Retina support
          rulers.map((ruler, index) => {
            if (index > 0) {
              if (isX) {
                $(ruler).css('margin-left', 0);
              } else {
                $(ruler).css('margin-top', -3); //magic number
              }
            }
            return ruler;
          }).map((ruler, index) => {
            const lastIndex = rulersCount - 1;
            if (index < lastIndex) {
              ruler[side] = limit;
            } else {
              ruler[side] = total_len % limit;
            }
            return ruler;
          }).map((ruler) => {
            //support retina
            const isRetina = (devicePixelRatio > 1);
            if (isRetina) {
              const ruler_len = ruler[side];

              ruler.style[side] = ruler_len + 'px';
              ruler[side] = ruler_len * devicePixelRatio;

              ruler.style[otherSide] = 15 + 'px';
              ruler[otherSide] = 15 * devicePixelRatio;

              ruler.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
            }
            return ruler;
          }).map((ruler) => {
            $rulersWrapper.append(ruler);
            return ruler;
          });
        })();

        (function drawRulers() {
          const contentPosition = Number($('#svgcontent').attr(axis));
          const zoom = workareaManager.zoomRatio;

          const ctxs = rulers
            .map(ruler => ruler.getContext('2d'))
            .map(ctx => {
              ctx.fillStyle = '#333';
              ctx.strokeStyle = '#000';
              ctx.font = '12px sans-serif';
              return ctx;
            });

          // Calculate the main number calibration in pixel
          const calibration = (function () {
            const size = 100 / (zoom * (unit === 'inches' ? 25.4 : 1));
            const digit = Math.ceil(Math.log10(size));
            const intervals = [2, 5, 10].map(x => x * 10 ** (digit - 1));
            const interval = intervals.find(x => x >= size);
            return interval;
          })() * (unit === 'inches' ? 25.4 : 1);

          const big_interval = calibration * zoom;
          const small_interval = big_interval / 10;

          let currentCtxIndex = 0;
          let ctx = ctxs[currentCtxIndex];

          // position correspond to root
          let label_pos = ((contentPosition / zoom) % calibration) * zoom;
          // position correspond to ruler
          let ruler_pos = label_pos;

          drawAll:
          while (label_pos < total_len) {

            //draw the big intervals
            //draw line
            const cur_d = Math.round(ruler_pos) + 0.5;
            if (isX) {
              ctx.moveTo(cur_d, 15);
              ctx.lineTo(cur_d, 0);
            } else {
              ctx.moveTo(15, cur_d);
              ctx.lineTo(0, cur_d);
            }
            //draw big label
            let label;
            const labelNum = (label_pos - contentPosition) / (zoom * 10 * (unit === 'inches' ? 25.4 : 1));
            if ((calibration / (unit === 'inches' ? 25.4 : 1)) >= 10) {
              label = Math.round(labelNum);
            } else {
              var decimalPlace = String(calibration / 10).split('.')[1].length;
              label = labelNum.toFixed(decimalPlace);
            }

            // Change 1000s to Ks
            if (label !== 0 && label !== 1000 && label % 1000 === 0) {
              label = (label / 1000) + 'K';
            }

            if (isX) {
              ctx.fillText(label, ruler_pos + 2, 10);
            } else {
              // draw label vertically
              const str = String(label).split('');
              let i;
              for (i = 0; i < str.length; i++) {
                if (str[i] === '.') {
                  break;
                }
                ctx.textAlign = 'center';
                ctx.fillText(str[i], 5, (ruler_pos + 12) + i * 12);
              }
              if (i < str.length) {
                ctx.textAlign = 'left';
                ctx.fillText('.', 5, ruler_pos + 12 + i * 12 - 8);
                i++;
                for (; i < str.length; i++) {
                  ctx.textAlign = 'center';
                  ctx.fillText(str[i], 5, ruler_pos + 12 + i * 12 - 8);
                }
              }
            }

            // draw the small intervals
            for (let i = 1; i < 10; i++) {
              let sub_d = Math.round(ruler_pos + small_interval * i) + 0.5;

              // maybe switch to next canvas to continue drawing
              if (sub_d > limit) {
                if (currentCtxIndex === rulersCount - 1) {
                  // end of all drawing
                  break drawAll;
                }
                currentCtxIndex++;
                ctx = ctxs[currentCtxIndex];
                ruler_pos -= limit;
                sub_d -= limit;
              }

              // odd lines are slighly longer
              const line_size = (i % 2) ? 12 : 10;
              if (isX) {
                ctx.moveTo(sub_d, 15);
                ctx.lineTo(sub_d, line_size);
              } else {
                ctx.moveTo(15, sub_d);
                ctx.lineTo(line_size, sub_d);
              }
            }
            label_pos += big_interval;
            ruler_pos += big_interval;
          }
          ctxs.map(ctx => ctx.stroke());

        })();
      }
      updateRuler('x');
      updateRuler('y');
      const workArea = document.getElementById('workarea');
      if (workArea) {
        const rulerX = document.getElementById('ruler_x');
        const rulerY = document.getElementById('ruler_y');
        if (rulerX) {
          rulerX.scrollLeft = workArea.scrollLeft;
        }
        if (rulerY) {
          rulerY.scrollTop = workArea.scrollTop - workArea.offsetTop;
        }
      }
    }
    editor.updateRulers = updateRulers;
    canvasEventEmitter.on('zoom-changed', () => {
      const shouldShowRulers = !!BeamboxPreference.read('show_rulers');
      if (shouldShowRulers) requestAnimationFrame(() => updateRulers());
    });

    // updates the context panel tools based on the selected element
    var updateContextPanel = function () {
      var elem = selectedElement;
      // If element has just been deleted, consider it null
      if (elem != null && !elem.parentNode) {
        elem = null;
      }
      var currentMode = svgCanvas.getMode();
      var unit = curConfig.baseUnit !== 'px' ? curConfig.baseUnit : null;

      var is_node = currentMode === 'pathedit'; //elem ? (elem.id && elem.id.indexOf('pathpointgrip') == 0) : false;
      if (is_node) {
        canvasEvents.setPathEditing(true);
        canvasEvents.setSelectedElement(null);
        RightPanelController.updatePathEditPanel();
      } else {
        canvasEvents.setPathEditing(false);
        canvasEvents.setSelectedElement(elem);
      }

      if (elem != null) {
        var elname = elem.nodeName;
        // If this is a link with no transform and one child, pretend
        // its child is selected
        //					if (elname === 'a') { // && !$(elem).attr('transform')) {
        //						elem = elem.firstChild;
        //					}

        var angle = svgCanvas.getRotationAngle(elem);
        ObjectPanelController.updateDimensionValues({ rotation: angle });

        if (svgCanvas.addedNew) {
          if (elname === 'image' && svgCanvas.getMode() === 'image') {
            // Prompt for URL if not a data URL
            if (svgCanvas.getHref(elem).indexOf('data:') !== 0) {
              promptImgURL();
            }
          }
          /*else if (elname === 'text') {
                  // TODO: Do something here for new text
              }*/
        }

        if (!is_node && currentMode !== 'pathedit') {
          //$('#selected_panel').show();
          // Elements in this array already have coord fields
          if (['line', 'circle', 'ellipse'].indexOf(elname) >= 0) {
          } else {
            var x, y;

            // Get BBox vals for g, polyline and path
            if (['g', 'polyline', 'path', 'polygon'].indexOf(elname) >= 0) {
              var bb = svgCanvas.getStrokedBBox([elem]);
              if (bb) {
                x = bb.x;
                y = bb.y;
                if (elname !== 'polyline') {
                  let bbox = elem.getBBox();
                  ObjectPanelController.updateDimensionValues({
                    width: bbox.width,
                    height: bbox.height
                  });
                }
              }
            } else if (['text'].includes(elname)) {
              const bb = svgCanvas.calculateTransformedBBox(elem);
              x = bb.x;
              y = bb.y;
              ObjectPanelController.updateDimensionValues({
                width: bb.width,
                height: bb.height
              });
            } else {
              x = elem.getAttribute('x');
              y = elem.getAttribute('y');
            }

            if (unit) {
              x = svgedit.units.convertUnit(x);
              y = svgedit.units.convertUnit(y);
            }

            ObjectPanelController.updateDimensionValues({
              x: parseFloat(x) || 0,
              y: parseFloat(y) || 0
            });

            svgCanvas.selectorManager.requestSelector(elem).resize();
          }

        } else {
          var point = path.getNodePoint();

          if (point) {
            if (unit) {
              point.x = svgedit.units.convertUnit(point.x);
              point.y = svgedit.units.convertUnit(point.y);
            }
          }
          return;
        }

        // update contextual tools here
        var panels = {
          g: [],
          a: [],
          rect: ['rx', 'width', 'height'],
          image: ['width', 'height'],
          circle: ['cx', 'cy', 'r'],
          ellipse: ['cx', 'cy', 'rx', 'ry'],
          line: ['x1', 'y1', 'x2', 'y2'],
          path: [],
          polygon: [],
          text: [],
          use: []
        };

        var el_name = elem.tagName;

        /*
        var link_href = null;
        if (el_name === 'a') {
            link_href = svgCanvas.getHref(elem);
            $('#g_panel').show();
        }

        if (elem.parentNode.tagName === 'a') {
            if (!$(elem).siblings().length) {
                $('#a_panel').show();
                link_href = svgCanvas.getHref(elem.parentNode);
            }
        }
        */

        if (panels[el_name]) {
          const cur_panels = panels[el_name];

          //$('#' + el_name + '_panel').show();
          const newDimensionValue = {};

          $.each(cur_panels, function (i, item) {
            var attrVal = elem.getAttribute(item);
            if (curConfig.baseUnit !== 'px' && elem[item]) {
              var bv = elem[item].baseVal.value;
              attrVal = svgedit.units.convertUnit(bv);
            }
            $('#' + el_name + '_' + item).val(attrVal || 0);
            newDimensionValue[item] = attrVal;
          });
          ObjectPanelController.updateDimensionValues(newDimensionValue);

          switch (el_name) {
            case 'text':
              if (svgCanvas.addedNew) {
                // Timeout needed for IE9
                setTimeout(function () {
                  $('#text').focus().select();
                }, 100);
              }
              textActions.setFontSize(textEdit.getFontSize());
              textActions.setIsVertical((elem.getAttribute('data-verti') === 'true'));
              break;
            case 'image':
              if (svgCanvas.getMode() === 'image') {
                setImageURL(svgCanvas.getHref(elem));
              }
              break;
            case 'g':
            case 'use':
              $('#container_panel').show();
              if ((el_name === 'use') && ($(elem).attr('data-xform'))) {
                const location = svgCanvas.getSvgRealLocation(elem);
                ObjectPanelController.updateDimensionValues({
                  x: location.x,
                  y: location.y,
                  width: location.width,
                  height: location.height
                });
              }
              break;
            case 'path':
              //$('#container_panel').show();
              break;
            default:
              break;
          }
        }

        if (svgCanvas.getTempGroup()) {
          workareaEvents.emit('update-context-menu', {
            group: true,
            ungroup: false,
          });
        } else {
          workareaEvents.emit('update-context-menu', {
            group: multiselected && el_name !== 'g',
            ungroup: el_name === 'g',
          });
        }
        const isRatioFixed = elem.getAttribute('data-ratiofixed') === 'true';
        ObjectPanelController.updateDimensionValues({ isRatioFixed });
      } else if (multiselected) {
        //$('#multiselected_panel').show();
        workareaEvents.emit('update-context-menu', {
          group: true,
          ungroup: false,
        });
      } else {
        workareaEvents.emit('update-context-menu', {
          select: false,
        });
      }

      svgCanvas.addedNew = false;

      if ((elem && !is_node) || multiselected) {
        // Enable regular menu options
        workareaEvents.emit('update-context-menu', {
          select: true,
        });
      }

      ObjectPanelController.updateObjectPanel();
    };
    editor.updateContextPanel = updateContextPanel;

    var updateTitle = function (title?: string) {
      title = title || svgCanvas.getDocumentTitle();
      var newTitle = origTitle + (title ? ': ' + title : '');

      // Remove title update with current context info, isn't really necessary
      //				if (cur_context) {
      //					new_title = new_title + cur_context;
      //				}
      $('title:first').text(newTitle);
    };

    // called when we've selected a different element
    var selectedChanged = function (win, elems) {
      var mode = svgCanvas.getMode();
      if (mode === 'select') {
        setSelectMode();
      }
      var is_node = (mode === 'pathedit');
      // if elems[1] is present, then we have more than one element
      selectedElement = (elems.length === 1 || elems[1] == null ? elems[0] : null);
      multiselected = (elems.length >= 2 && elems[1] != null);
      // Deal with pathedit mode
      togglePathEditMode(is_node, elems);
      updateContextPanel();
      svgCanvas.runExtensions('selectedChanged', {
        elems: elems,
        selectedElement: selectedElement,
        multiselected: multiselected
      });
      if (elems.length === 1 && elems[0]?.tagName === 'polygon') ObjectPanelController.updatePolygonSides($(selectedElement).attr('sides'));
    };

    // Call when part of element is in process of changing, generally
    // on mousemove actions like rotate, move, etc.
    var elementTransition = function (win, elems) {
      var mode = svgCanvas.getMode();
      var elem = elems[0];

      if (!elem) {
        return;
      }

      multiselected = (elems.length >= 2 && elems[1] != null);
      // Only updating fields for single elements for now
      // if (!multiselected) {
      //   switch (mode) {
      //     case 'rotate':
      //       var ang = svgCanvas.getRotationAngle(elem);
      //       $('#angle').val(ang);
      //       break;

          // TODO: Update values that change on move/resize, etc
          //						case "select":
          //						case "resize":
          //							break;
      //   }
      // }
      svgCanvas.runExtensions('elementTransition', {
        elems: elems
      });
    };

    /**
     * Test whether an element is a layer or not.
     * @param {SVGGElement} elem - The SVGGElement to test.
     * @returns {boolean} True if the element is a layer
     */
    function isLayer(elem) {
      return elem && elem.tagName === 'g' && svgedit.draw.Layer.CLASS_REGEX.test(elem.getAttribute('class'));
    }

    // called when any element has changed
    var elementChanged = function (win, elems) {
      var i,
        mode = svgCanvas.getMode();
      if (mode === 'select') {
        setSelectMode();
      }

      for (i = 0; i < elems.length; ++i) {
        var elem = elems[i];

        var isSvgElem = (elem && elem.tagName === 'svg');
        if (isSvgElem || isLayer(elem)) {
          LayerPanelController.updateLayerPanel();
        }
        // Update selectedElement if element is no longer part of the image.
        // This occurs for the text elements in Firefox
        else if (elem && selectedElement && selectedElement.parentNode == null) {
          //						|| elem && elem.tagName == "path" && !multiselected) { // This was added in r1430, but not sure why
          selectedElement = elem;
        }
      }

      editor.showSaveWarning = true;

      // we update the contextual panel with potentially new
      // positional/sizing information (we DON'T want to update the
      // toolbar here as that creates an infinite loop)
      // also this updates the history buttons

      // we tell it to skip focusing the text control if the
      // text element was previously in focus
      updateContextPanel();

      svgCanvas.runExtensions('elementChanged', {
        elems: elems
      });
    };

    $('#cur_context_panel').delegate('a', 'click', function () {
      var link = $(this);
      if (link.attr('data-root')) {
        svgCanvas.leaveContext();
      } else {
        svgCanvas.setContext(link.text());
      }
      svgCanvas.clearSelection();
      return false;
    });

    var contextChanged = function (win, context) {
      var link_str = '';
      if (context) {
        var str = '';
        link_str = '<a href="#" data-root="y">' + svgCanvas.getCurrentDrawing().getCurrentLayerName() + '</a>';

        $(context).parentsUntil('#svgcontent > g').andSelf().each(function () {
          if (this.id) {
            str += ' > ' + this.id;
            if (this !== context) {
              link_str += ' > <a href="#">' + this.id + '</a>';
            } else {
              link_str += ' > ' + this.id;
            }
          }
        });
      }
      $('#cur_context_panel').toggle(!!context).html(link_str);

      updateTitle();
    };

    var uaPrefix = (function () {
      var prop;
      var regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
      var someScript = document.getElementsByTagName('script')[0];
      for (prop in someScript.style) {
        if (regex.test(prop)) {
          // test is faster than match, so it's better to perform
          // that on the lot and match only when necessary
          return prop.match(regex)[0];
        }
      }
      // Nothing found so far?
      if ('WebkitOpacity' in someScript.style) {
        return 'Webkit';
      }
      if ('KhtmlOpacity' in someScript.style) {
        return 'Khtml';
      }

      return '';
    })();

    var scaleElements = function (elems, scale) {
      // var prefix = '-' + uaPrefix.toLowerCase() + '-'; // Currently unused
      var sides = ['top', 'left', 'bottom', 'right'];

      elems.each(function () {
        // Handled in CSS
        // this.style[uaPrefix + 'Transform'] = 'scale(' + scale + ')';
        var i;
        var el = $(this);
        var w = el.outerWidth() * (scale - 1);
        var h = el.outerHeight() * (scale - 1);
        // var margins = {}; // Currently unused

        for (i = 0; i < 4; i++) {
          var s = sides[i];
          var cur = el.data('orig_margin-' + s);
          if (cur == null) {
            cur = parseInt(el.css('margin-' + s), 10);
            // Cache the original margin
            el.data('orig_margin-' + s, cur);
          }
          var val = cur * scale;
          if (s === 'right') {
            val += w;
          } else if (s === 'bottom') {
            val += h;
          }

          el.css('margin-' + s, val);
          // el.css('outline', '1px solid red');
        }
      });
    };

    // TODO: Combine this with addDropDown or find other way to optimize
    var addAltDropDown = function (elem, list, callback, opts) {
      var button = $(elem);
      list = $(list);
      var on_button = false;
      var dropUp = opts.dropUp;
      if (dropUp) {
        $(elem).addClass('dropup');
      }
      list.find('li').bind('mouseup', function () {
        if (opts.seticon) {
          setIcon('#cur_' + button[0].id, $(this).children());
          $(this).addClass('current').siblings().removeClass('current');
        }
        callback.apply(this, arguments);

      });

      $(window).mouseup(function (evt) {
        if (!on_button) {
          button.removeClass('down');
          list.hide();
          list.css({
            top: 0,
            left: 0
          });
        }
        on_button = false;
      });

      // var height = list.height(); // Currently unused
      button.bind('mousedown', function () {
        var off = button.offset();
        if (dropUp) {
          off.top -= list.height();
          off.left += 8;
        } else {
          off.top += button.height();
        }
        list.offset(off);

        if (!button.hasClass('down')) {
          list.show();
          on_button = true;
        } else {
          // CSS position must be reset for Webkit
          list.hide();
          list.css({
            top: 0,
            left: 0
          });
        }
        button.toggleClass('down');
      }).hover(function () {
        on_button = true;
      }).mouseout(function () {
        on_button = false;
      });

      if (opts.multiclick) {
        list.mousedown(function () {
          on_button = true;
        });
      }
    };

    var extsPreLang = [];
    var extAdded = function (win, ext) {
      if (!ext) {
        return;
      }
      var cb_called = false;
      var resize_done = false;
      var cb_ready = true; // Set to false to delay callback (e.g. wait for $.svgIcons)

      if (ext.langReady) {
        if (editor.langChanged) { // We check for this since the "lang" pref could have been set by storage
          var lang = $.pref('lang');
          ext.langReady({
            lang: lang,
            uiStrings: uiStrings
          });
        } else {
          extsPreLang.push(ext);
        }
      }

      var runCallback = function () {
        if (ext.callback && !cb_called && cb_ready) {
          cb_called = true;
          ext.callback();
        }
      };

      var btn_selects = [];

      if (ext.context_tools) {
        $.each(ext.context_tools, function (i, tool) {
          // Add select tool
          var html;
          var cont_id = tool.container_id ? (' id="' + tool.container_id + '"') : '';
          var panel = $('#' + tool.panel);

          // create the panel if it doesn't exist
          if (!panel.length) {
            panel = $('<div>', {
              id: tool.panel
            }).appendTo('#tools_top');
          }

          // TODO: Allow support for other types, or adding to existing tool
          switch (tool.type) {
            case 'tool_button':
              html = '<div class="tool_button">' + tool.id + '</div>';
              var div = $(html).appendTo(panel);
              if (tool.events) {
                $.each(tool.events, function (evt: string, func) {
                  $(div).bind(evt, func);
                });
              }
              break;
            case 'select':
              html = '<label' + cont_id + '>' +
                '<select id="' + tool.id + '">';
              $.each(tool.options, function (val: string, text) {
                var sel = (val == tool.defval) ? ' selected' : '';
                html += '<option value="' + val + '"' + sel + '>' + text + '</option>';
              });
              html += '</select></label>';
              // Creates the tool, hides & adds it, returns the select element
              var sel = $(html).appendTo(panel).find('select');

              $.each(tool.events, function (evt: string, func) {
                $(sel).bind(evt, func);
              });
              break;
            case 'button-select':
              html = '<div id="' + tool.id + '" class="dropdown toolset" title="' + tool.title + '">' +
                '<div id="cur_' + tool.id + '" class="icon_label"></div><button></button></div>';

              var list = $('<ul id="' + tool.id + '_opts"></ul>').appendTo('#option_lists');

              if (tool.colnum) {
                list.addClass('optcols' + tool.colnum);
              }

              // Creates the tool, hides & adds it, returns the select element
              var dropdown = $(html).appendTo(panel).children();

              btn_selects.push({
                elem: ('#' + tool.id),
                list: ('#' + tool.id + '_opts'),
                title: tool.title,
                callback: tool.events.change,
                cur: ('#cur_' + tool.id)
              });

              break;
            case 'input':
              html = '<label' + cont_id + '>' +
                '<span id="' + tool.id + '_label">' +
                tool.label + ':</span>' +
                '<input id="' + tool.id + '" title="' + tool.title +
                '" size="' + (tool.size || '4') + '" value="' + (tool.defval || '') + '" type="text"/></label>';

              // Creates the tool, hides & adds it, returns the select element

              // Add to given tool.panel
              var inp = $(html).appendTo(panel).find('input');

              if (tool.spindata) {
                inp.SpinButton(tool.spindata);
              }

              if (tool.events) {
                $.each(tool.events, function (evt: string, func) {
                  inp.bind(evt, func);
                });
              }
              break;

            default:
              break;
          }
        });
      }

      if (ext.buttons) {
        var fallback_obj = {},
          placement_obj = {},
          svgicons = ext.svgicons,
          holders = {};

        // Add buttons given by extension
        $.each(ext.buttons, function (i: number, btn) {
          var icon, svgicon, tls_id;
          var id = btn.id;
          let num = i;

          // Give button a unique ID
          while ($('#' + id).length) {
            id = btn.id + '_' + (++num);
          }

          if (!svgicons) {
            icon = $('<img src="' + btn.icon + '">');
          } else {
            fallback_obj[id] = btn.icon;
            svgicon = btn.svgicon || btn.id;
            if (btn.type === 'app_menu') {
              placement_obj['#' + id + ' > div'] = svgicon;
            } else {
              placement_obj['#' + id] = svgicon;
            }
          }

          var cls, parent;

          // Set button up according to its type
          switch (btn.type) {
            case 'context':
              cls = 'tool_button';
              parent = '#' + btn.panel;
              // create the panel if it doesn't exist
              if (!$(parent).length) {
                $('<div>', {
                  id: btn.panel
                }).appendTo('#tools_top');
              }
              break;
          }
          var flyout_holder, cur_h, show_btn, ref_data, ref_btn;
          var button = $((btn.list || btn.type === 'app_menu') ? '<li/>' : '<div/>')
            .attr('id', id)
            .attr('title', btn.title)
            .addClass(cls);
          if (!btn.includeWith && !btn.list) {
            if ('position' in btn) {
              if ($(parent).children().eq(btn.position).length) {
                $(parent).children().eq(btn.position).before(button);
              } else {
                $(parent).children().last().before(button);
              }
            } else {
              button.appendTo(parent);
            }
            if (btn.type === 'app_menu') {
              button.append('<div>').append(btn.title);
            }

          } else if (btn.list) {
            // Add button to list
            button.addClass('push_button');
            $('#' + btn.list + '_opts').append(button);
            if (btn.isDefault) {
              $('#cur_' + btn.list).append(button.children().clone());
              svgicon = btn.svgicon || btn.id;
              placement_obj['#cur_' + btn.list] = svgicon;
            }
          } else if (btn.includeWith) {
            // Add to flyout menu / make flyout menu
            var opts = btn.includeWith;
            // opts.button, default, position
            ref_btn = $(opts.button);

            flyout_holder = ref_btn.parent();
            // Create a flyout menu if there isn't one already
            if (!ref_btn.parent().hasClass('tools_flyout')) {
              // Create flyout placeholder
              tls_id = ref_btn[0].id.replace('tool_', 'tools_');
              show_btn = ref_btn.clone()
                .attr('id', tls_id + '_show')
                .append($('<div>', {
                  'class': 'flyout_arrow_horiz'
                }));

              ref_btn.before(show_btn);
            }

            if (opts.isDefault) {
              placement_obj['#' + tls_id + '_show'] = btn.id;
            }
            // TODO: Find way to set the current icon using the iconloader if this is not default

            // Include data for extension button as well as ref button
            cur_h = holders['#' + flyout_holder[0].id] = [{
              sel: '#' + id,
              fn: btn.events.click,
              icon: btn.id,
              key: btn.key,
              isDefault: btn.includeWith ? btn.includeWith.isDefault : 0
            }, ref_data];

            var pos = ('position' in opts) ? opts.position : 'last';
            var len = flyout_holder.children().length;

            // Add at given position or end
            if (!isNaN(pos) && pos >= 0 && pos < len) {
              flyout_holder.children().eq(pos).before(button);
            } else {
              flyout_holder.append(button);
              cur_h.reverse();
            }
          }

          if (!svgicons) {
            button.append(icon);
          }

          if (!btn.list) {
            // Add given events to button
            $.each(btn.events, function (name: string, func) {
              if (name === 'click' && btn.type === 'mode') {
                if (btn.includeWith) {
                  button.bind(name, func);
                } else {
                  button.bind(name, function () {
                    if (toolButtonClick(button)) {
                      func();
                    }
                  });
                }
                if (btn.key) {
                  $(document).bind('keydown', btn.key, func);
                  if (btn.title) {
                    button.attr('title', btn.title + ' [' + btn.key + ']');
                  }
                }
              } else {
                button.bind(name, func);
              }
            });
          }
        });

        $.each(btn_selects, function () {
          addAltDropDown(this.elem, this.list, this.callback, {
            seticon: true
          });
        });

        if (svgicons) {
          cb_ready = false; // Delay callback
        }
      }

      runCallback();
    };

    var getPaint = function (color, opac, type) {
      // update the editor's fill paint
      var opts: {
        alpha: number,
        solidColor?: string
      } = {
        alpha: opac
      };
      if (color.indexOf('url(#') === 0) {
        var refElem = svgCanvas.getRefElem(color);
        if (refElem) {
          refElem = refElem.cloneNode(true);
        } else {
          refElem = $('#' + type + '_color defs *')[0];
        }
        opts[refElem.tagName] = refElem;
      } else if (color.indexOf('#') === 0) {
        opts.solidColor = color.substr(1);
      } else {
        opts.solidColor = 'none';
      }
      return new $.jGraduate.Paint(opts);
    };

    // bind the selected event to our function that handles updates to the UI
    svgCanvas.bind('selected', selectedChanged);
    svgCanvas.bind('transition', elementTransition);
    svgCanvas.bind('changed', elementChanged);
    svgCanvas.bind('saved', saveHandler);
    svgCanvas.bind('exported', exportHandler);
    svgCanvas.bind('exportedPDF', function (win, data) {
      var exportWindowName = data.exportWindowName;
      if (exportWindowName) {
        exportWindow = window.open('', exportWindowName); // A hack to get the window via JSON-able name without opening a new one
      }
      exportWindow.location.href = data.dataurlstring;
    });
    svgCanvas.bind('contextset', contextChanged);
    svgCanvas.bind('extension_added', extAdded);
    textActions.setInputElem($('#text')[0]);

    var changeStrokeWidth = function (ctl) {
      var val = ctl.value;
      if (val == 0 && selectedElement && ['line', 'polyline'].indexOf(selectedElement.nodeName) >= 0) {
        val = ctl.value = 1;
      }
      svgCanvas.setStrokeWidth(val);
    };

    // Maybe useful
    var changeBlur = function (ctl, val?, noUndo?: boolean) {
      if (val == null) {
        val = ctl.value;
      }
      var complete = false;
      if (!ctl || !ctl.handle) {
        complete = true;
      }
      if (noUndo) {
        svgCanvas.setBlurNoUndo(val);
      } else {
        svgCanvas.setBlur(val, complete);
      }
    };

    // Lose focus for select elements when changed (Allows keyboard shortcuts to work better)
    $('select').change(function () {
      $(this).blur();
    });

    // fired when user wants to move elements to another layer
    var promptMoveLayerOnce = false;

    const textInput = document.getElementById('text') as HTMLInputElement;
    let wasNewLineAdded = false;
    const checkFunctionKeyPressed = (evt: KeyboardEvent) => {
      return (window.os === 'MacOS' && evt.metaKey) || (window.os !== 'MacOS' && evt.ctrlKey);
    }

    $('#text').on('keyup input', function (this: HTMLInputElement, evt) {
      evt.stopPropagation();
      if (!textActions.isEditing && evt.type === 'input') {
        // Hack: Windows input event will some how block undo/redo event
        // So do undo/redo when not entering & input event triggered
        evt.preventDefault();
        const originalEvent = evt.originalEvent as InputEvent;
        if (originalEvent.inputType === 'historyUndo') {
          clickUndo();
        } else if (originalEvent.inputType === 'historyRedo') {
          clickRedo();
        }
        return;
      }
      if (evt.key === 'Enter' && !wasNewLineAdded) {
        textActions.toSelectMode(true);
      } else if (textActions.isEditing) {
        textEdit.setTextContent(this.value);
      }
      if (evt.key !== 'Shift') {
        wasNewLineAdded = false;
      }
    });
    textInput.addEventListener('keydown', (evt: KeyboardEvent) => {
      evt.stopPropagation();
      if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        textActions.onUpKey();
      } else if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        textActions.onDownKey();
      } else if (evt.key === 'ArrowLeft') {
        evt.preventDefault();
        textActions.onLeftKey();
      } else if (evt.key === 'ArrowRight') {
        evt.preventDefault();
        textActions.onRightKey();
      } else if (evt.key === 'Escape') {
        clickSelect();
      }
      const isFunctionKeyPressed = checkFunctionKeyPressed(evt);
      if ((isMobile() || evt.shiftKey) && evt.key === 'Enter') {
        evt.preventDefault();
        textActions.newLine();
        textEdit.setTextContent(textInput.value);
        wasNewLineAdded = true;
      } else if (isFunctionKeyPressed && evt.key === 'c') {
        evt.preventDefault();
        textActions.copyText();
      } else if (isFunctionKeyPressed && evt.key === 'x') {
        evt.preventDefault();
        textActions.cutText();
        textEdit.setTextContent(textInput.value);
      } else if (isFunctionKeyPressed && evt.key === 'v') {
        evt.preventDefault();
        textActions.pasteText();
        textEdit.setTextContent(textInput.value);
      } else if (isFunctionKeyPressed && evt.key === 'a') {
        evt.preventDefault();
        textActions.selectAll();
        textEdit.setTextContent(textInput.value);
      } else if (isFunctionKeyPressed && evt.key === 'z') {
        if (window.os === 'MacOS') evt.preventDefault();
      }
    });

    $('.attr_changer').change(function (this: HTMLInputElement) {
      var attr = this.getAttribute('data-attr');
      var val = parseFloat(this.value);
      var valid = svgedit.units.isValidUnit(attr, val, selectedElement);

      if (!valid) {
        Alert.popUp({
          message: uiStrings.notification.invalidAttrValGiven,
        });
        this.value = selectedElement.getAttribute(attr);
        return false;
      }

      if (attr !== 'id' && attr !== 'class') {
        if (isNaN(val)) {
          val = svgCanvas.convertToNum(attr, val);
        } else if (curConfig.baseUnit !== 'px') {
          // Convert unitless value to one with given unit

          var unitData = svgedit.units.getTypeMap();

          if (selectedElement[attr] || svgCanvas.getMode() === 'pathedit' || attr === 'x' || attr === 'y') {
            val = val * unitData[curConfig.baseUnit];
          }
        }
      }

      // if the user is changing the id, then de-select the element first
      // change the ID, then re-select it with the new ID
      if (attr === 'id') {
        var elem = selectedElement;
        svgCanvas.clearSelection();
        elem.id = val;
        svgCanvas.addToSelection([elem], true);
      } else {
        svgCanvas.changeSelectedAttribute(attr, val);
      }
      this.blur();
      updateContextPanel();
    });

    (function () {
      var last_x = null,
        last_y = null,
        w_area = workarea[0],
        panning = false,
        keypan = false;
      window['w_area'] = workarea[0];

      $('#svgcanvas').bind('mousemove mouseup', function (evt) {
        if (panning === false) {
          return;
        }

        w_area.scrollLeft -= (evt.clientX - last_x);
        w_area.scrollTop -= (evt.clientY - last_y);

        last_x = evt.clientX;
        last_y = evt.clientY;

        if (evt.type === 'mouseup') {
          panning = false;
        }
        return false;
      }).mousedown(function (evt) {
        if (evt.button === 1 || keypan === true) {
          panning = true;
          last_x = evt.clientX;
          last_y = evt.clientY;
          return false;
        }
      });

      $(window).mouseup(function () {
        panning = false;
      });

      $(document).bind('keydown', 'space', function (evt) {
        svgCanvas.spaceKey = keypan = true;
        evt.preventDefault();
      }).bind('keyup', 'space', function (evt) {
        evt.preventDefault();
        svgCanvas.spaceKey = keypan = false;
      }).bind('keydown', 'shift', function (evt) {
        if (svgCanvas.getMode() === 'zoom') {
          workarea.css('cursor', zoomOutIcon);
        }
      }).bind('keyup', 'shift', function (evt) {
        if (svgCanvas.getMode() === 'zoom') {
          workarea.css('cursor', zoomInIcon);
        }
      });

      editor.setPanning = function (active) {
        svgCanvas.spaceKey = keypan = active;
      };
    })();
    // Unfocus text input when workarea is mousedowned.
    (function () {
      var inp;
      var unfocus = function () {
        $(inp).blur();
      };

      $('#svg_editor').find('button, select, input:not(#text)').focus(function () {
        inp = this;
        workarea.mousedown(unfocus);
      }).blur(function () {
        workarea.unbind('mousedown', unfocus);
        // Go back to selecting text if in textedit mode
        if (svgCanvas.getMode() === 'textedit') {
          $('#text').focus();
        }
      });
    })();

    const triggerGridTool = function () {
      if (selectedElement != null || multiselected) {
        ToolPanelsController.setVisibility(ToolPanelsController.type != 'gridArray' || !ToolPanelsController.isVisible);
        ToolPanelsController.setType('gridArray');
        ToolPanelsController.render();
      } else {
        Alert.popUp({
          id: 'select first',
          message: LANG.popup.select_first,
          caption: LANG.left_panel.label.array,
          callbacks: () => ObjectPanelController.updateActiveKey(null),
        });
      }
    }
    editor.triggerGridTool = triggerGridTool;

    let triggerOffsetTool = function () {
      if (selectedElement.tagName === 'g' && selectedElement.getAttribute('data-tempgroup') === 'true') {
        const childs: HTMLElement[] = Array.from(selectedElement.childNodes);
        const supportOffset = childs.every((child) => { return !['g', 'text', 'image', 'use'].includes(child.tagName) });
        if (!supportOffset) {
          Alert.popUp({
            id: 'Offset not support',
            message: LANG.tool_panels._offset.not_support_message,
            caption: LANG.tool_panels.offset,
          });
          return;
        }
      }
      if (selectedElement != null || multiselected) {
        ToolPanelsController.setVisibility(ToolPanelsController.type != 'offset' || !ToolPanelsController.isVisible);
        ToolPanelsController.setType('offset');
        ToolPanelsController.render();
      } else {
        Alert.popUp({
          id: 'select first',
          message: LANG.popup.select_first,
          caption: LANG.tool_panels.offset,
          callbacks: () => ObjectPanelController.updateActiveKey(null),
        });
      }
    }
    editor.triggerOffsetTool = triggerOffsetTool;

    let triggerNestTool = function () {
      if (selectedElement != null || multiselected) {
        ToolPanelsController.setVisibility(ToolPanelsController.type != 'nest' || !ToolPanelsController.isVisible);
        ToolPanelsController.setType('nest');
        ToolPanelsController.render();
      } else {
        Alert.popUp({
          id: 'select first',
          message: LANG.popup.select_first,
          caption: LANG.tool_panels.nest
        });
      }
    }
    editor.triggerNestTool = triggerNestTool;

    // Delete is a contextual tool that only appears in the ribbon if
    // an element has been selected
    var deleteSelected = function () {
      if (selectedElement != null || multiselected) {
        textActions.clear();
        deleteSelectedElements();
      }
      if (svgedit.path.path) {
        svgedit.path.path.onDelete(textEdit, textPathEdit);
      }
    };
    editor.deleteSelected = deleteSelected;

    var cutSelected = function () {
      // disabled when focusing input element
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        return;
      }
      if (!textActions.isEditing && (selectedElement != null || multiselected)) {
        clipboard.cutSelectedElements();
        workareaEvents.emit('update-context-menu', {
          paste: true,
        });
      }
    };
    editor.cutSelected = cutSelected;
    document.addEventListener('cut', cutSelected, false);

    var copySelected = function () {
      // disabled when focusing input element
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        return;
      }
      if (!textActions.isEditing && (selectedElement != null || multiselected)) {
        clipboard.copySelectedElements();
        workareaEvents.emit('update-context-menu', {
          paste: true,
        });
      }
    };
    editor.copySelected = copySelected;
    document.addEventListener('copy', copySelected, false);

    // handle paste
    document.addEventListener('paste', async (e) => {
      // disabled when focusing input element
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        return;
      }

      if (['Shift', 'Control', 'V'].every((key) => pressedKey.includes(key))) {
        return;
      }

      const clipboardData = e.clipboardData;
      let importedFromClipboard = false;
      if (clipboardData) {
        if (clipboardData.types.includes('Files')) {
          console.log('handle clip board file');
          for (let i = 0; i < clipboardData.files.length; i++) {
            let file = clipboardData.files[i];
            svgEditor.handleFile(file);
            importedFromClipboard = true;
          }
        } else if (clipboardData.types.includes('text/html')) {
          const htmlData = clipboardData.getData('text/html');
          const matchImgs = htmlData.match(/<img[^>]+>/);
          if (matchImgs) {
            console.log('handle clip board html img');
            for (let i = 0; i < matchImgs.length; i++) {
              const matchSrc = matchImgs[i].match(/src="([^"]+)"/);
              if (matchSrc && matchSrc[1]) {
                importedFromClipboard = true;
                console.log(matchSrc[1]);
                let res = await fetch(matchSrc[1]);
                if (res.ok) {
                  const resBlob = await res.blob();
                  const blobSrc = URL.createObjectURL(resBlob);
                  ImageData(
                    blobSrc,
                    {
                      grayscale: {
                        is_rgba: true,
                        is_shading: true,
                        is_svg: false,
                        threshold: 254,
                      },
                      onComplete: function (result) {
                        let newImage = svgCanvas.addSvgElementFromJson({
                          element: 'image',
                          attr: {
                            x: 0,
                            y: 0,
                            width: result.canvas.width,
                            height: result.canvas.height,
                            id: svgCanvas.getNextId(),
                            style: 'pointer-events:inherit',
                            preserveAspectRatio: 'none',
                            'data-threshold': 254,
                            'data-shading': true,
                            'data-ratiofixed': true,
                            origImage: blobSrc,
                            'xlink:href': result.pngBase64,
                          }
                        });
                        svgCanvas.updateElementColor(newImage);
                      }
                    }
                  );
                } else {
                  Alert.popUp({
                    type: AlertConstants.SHOW_POPUP_WARNING,
                    message: LANG.svg_editor.unable_to_fetch_clipboard_img,
                  });
                }
              }
            }
          }
        }
      }
      if (!importedFromClipboard) {
        clipboard.pasteInCenter();
      }
    });

    var moveSelected = function (dx, dy) {
      if (selectedElement != null || multiselected) {
        if (curConfig.gridSnapping) {
          // Use grid snap value regardless of zoom level
          var multi = workareaManager.zoomRatio * curConfig.snappingStep;
          dx *= multi;
          dy *= multi;
        }
        moveSelectedElements(dx, dy);
      }
    };

    var addSubPath = function () {
      var button = $('#tool_add_subpath');
      var sp = !button.hasClass('push_button_pressed');
      button.toggleClass('push_button_pressed tool_button');
      path.addSubPath(sp);
    };

    var opencloseSubPath = function () {
      path.opencloseSubPath();
    };

    var clearScene = function () {
      Alert.popById('clear-scene');
      Alert.popUp({
        id: 'clear-scene',
        message: i18n.lang.topbar.alerts.QcleanScene,
        buttonType: AlertConstants.YES_NO,
        onYes: () => {
          setSelectMode();
          svgCanvas.clear();
          workareaManager.resetView();
          LayerPanelController.updateLayerPanel();
          updateContextPanel();
          svgedit.transformlist.resetListMap();
          svgCanvas.runExtensions('onNewDocument');
        }
      });
    };

    editor.clearScene = clearScene;

    var clickUndo = function () {
      if (undoMgr.getUndoStackSize() > 0) {
        undoMgr.undo();
        LayerPanelController.updateLayerPanel();
      }
    };
    editor.clickUndo = clickUndo;
    //hack QQ. to let svgeditor-function-wrapper get this function

    var clickRedo = function () {
      if (undoMgr.getRedoStackSize() > 0) {
        undoMgr.redo();
        LayerPanelController.updateLayerPanel();
      }
    };
    editor.clickRedo = clickRedo;

    (function () {
      workarea.scroll(function () {
        // TODO: jQuery's scrollLeft/Top() wouldn't require a null check
        if ($('#ruler_x').length !== 0) {
          $('#ruler_x')[0].scrollLeft = workarea[0].scrollLeft;
        }
        if ($('#ruler_y').length !== 0) {
          $('#ruler_y')[0].scrollTop = workarea[0].scrollTop - workarea[0].offsetTop;
        }
      });

    })();

    $('#url_notice').click(function () {
      Alert.popUp({
        id: 'url notice',
        message: this.title,
      });
    });

    // added these event handlers for all the push buttons so they
    // behave more like buttons being pressed-in and not images
    (function () {
      var toolnames = ['clear', 'open', 'save', 'source', 'delete', 'delete_multi', 'paste', 'clone', 'clone_multi', 'move_top', 'move_bottom'];
      var all_tools = '';
      var cur_class = 'tool_button_current';

      $.each(toolnames, function (i, item) {
        all_tools += (i ? ',' : '') + '#tool_' + item;
      });

      $(all_tools).mousedown(function () {
        $(this).addClass(cur_class);
      }).bind('mousedown mouseout', function () {
        $(this).removeClass(cur_class);
      });
    })();

    // Test for zoom icon support
    (function () {
      var pre = '-' + uaPrefix.toLowerCase() + '-zoom-';
      var zoom = pre + 'in';
      workarea.css('cursor', zoom);
      if (workarea.css('cursor') === zoom) {
        zoomInIcon = zoom;
        zoomOutIcon = pre + 'out';
      }
      workarea.css('cursor', 'auto');
    })();

    $('.push_button').mousedown(function () {
      if (!$(this).hasClass('disabled')) {
        $(this).addClass('push_button_pressed').removeClass('push_button');
      }
    }).mouseout(function () {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    }).mouseup(function () {
      $(this).removeClass('push_button_pressed').addClass('push_button');
    });

    LayerPanelController.updateLayerPanel();

    var centerCanvas = function () {
      // this centers the canvas vertically in the workarea (horizontal handled in CSS)
      workarea.css('line-height', workarea.height() + 'px');
    };

    $(window).bind('load resize', centerCanvas);

    function stepFontSize(elem, step) {
      var orig_val = Number(elem.value);
      var sug_val = orig_val + step;
      var increasing = sug_val >= orig_val;
      if (step === 0) {
        return orig_val;
      }

      if (orig_val >= 24) {
        if (increasing) {
          return Math.round(orig_val * 1.1);
        }
        return Math.round(orig_val / 1.1);
      }
      if (orig_val <= 1) {
        if (increasing) {
          return orig_val * 2;
        }
        return orig_val / 2;
      }
      return sug_val;
    }

    //Prevent browser from erroneously repopulating fields
    $('input,select').attr('autocomplete', 'off');

    // Associate all button actions as well as non-button keyboard shortcuts
    Actions = (function () {
      return {
        setAll: function () {
          const moveUnit = storage.get('default-units') === 'inches' ? 25.4 : 10; // 0.1 in : 1 mm

          const isFocusingOnInputs = () => {
            if (!document.activeElement) return false;
            return document.activeElement.tagName.toLowerCase() === 'input'
              || document.activeElement?.getAttribute('role') === 'slider';
          };
          Shortcuts.on(['del'], () => {
            if (isFocusingOnInputs()) return;
            deleteSelected();
          });
          Shortcuts.on(['fnkey', 'a'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            e.stopPropagation();
            svgCanvas.selectAll();
          });
          Shortcuts.on(['up'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([0], [-moveUnit]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollTop -= 5;
            }
          });
          Shortcuts.on(['shift', 'up'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([0], [-moveUnit * 10]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollTop -= 50;
            }
          });
          Shortcuts.on(['down'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([0], [moveUnit]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollTop += 5;
            }
          });
          Shortcuts.on(['shift', 'down'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([0], [moveUnit * 10]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollTop += 50;
            }
          });
          Shortcuts.on(['left'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([-moveUnit], [0]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollLeft -= 5;
            }
          });
          Shortcuts.on(['shift', 'left'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([-moveUnit * 10], [0]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollLeft -= 50;
            }
          });
          Shortcuts.on(['right'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([moveUnit], [0]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollLeft += 5;
            }
          });
          Shortcuts.on(['shift', 'right'], (e) => {
            if (isFocusingOnInputs()) return;
            e.preventDefault();
            if (selectedElement) {
              moveSelected([moveUnit * 10], [0]);
            } else {
              const workArea = document.getElementById('workarea');
              workArea.scrollLeft += 50;
            }
          });
          // +
          Shortcuts.on(['plus'], () => {
            window['polygonAddSides']?.();
            ObjectPanelController.updatePolygonSides($(selectedElement).attr('sides'));
          });
          // -
          Shortcuts.on(['minus'], () => {
            window['polygonDecreaseSides']?.();
            ObjectPanelController.updatePolygonSides($(selectedElement).attr('sides'));
          });
          Shortcuts.on(['esc'], clickSelect);

          // Setup flyouts

          // Make 'return' keypress trigger the change event
          $('.attr_changer').bind('keydown', 'return',
            function (evt) {
              $(this).change();
              evt.preventDefault();
            }
          );

          // $(window).bind('keydown', 'tab', function(e) {
          // 	if (ui_context === 'canvas') {
          // 		e.preventDefault();
          // 		selectNext();
          // 	}
          // }).bind('keydown', 'shift+tab', function(e) {
          // 	åif (ui_context === 'canvas') {
          // 		e.preventDefault();
          // 		selectPrev();
          // 	}
          // });

        },
      };
    })();

    Actions.setAll();

    window.addEventListener('beforeunload', function (e) {
      // Suppress warning if page is empty
      if (undoMgr.getUndoStackSize() === 0) {
        editor.showSaveWarning = false;
      }

      // showSaveWarning is set to 'false' when the page is saved.
      if (!curConfig.no_save_warning && editor.showSaveWarning) {
        // Browser already asks question about closing the page
        e.returnValue = uiStrings.notification.unsavedChanges; // Firefox needs this when beforeunload set by addEventListener (even though message is not used)
        return uiStrings.notification.unsavedChanges;
      }
    }, false);

    editor.openPrep = function (func) {
      if (undoMgr.getUndoStackSize() === 0) {
        func(true);
      } else {
        $.confirm(uiStrings.notification.QwantToOpen, func);
      }
    };

    function onDragEnter(e) {
      e.stopPropagation();
      e.preventDefault();
      // and indicator should be displayed here, such as "drop files here"
    }

    function onDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    function onDragLeave(e) {
      e.stopPropagation();
      e.preventDefault();
      // hypothetical indicator should be removed here
    }
    // Use HTML5 File API: http://www.w3.org/TR/FileAPI/
    // if browser has HTML5 File API support, then we will show the open menu item
    // and provide a file input to click. When that change event fires, it will
    // get the text contents of the file and send it to the canvas
    if (window.FileReader) {
      const replaceBitmap = async (file, imageElem) => {
        Progress.openNonstopProgress({ id: 'loading_image', caption: LANG.popup.loading_image });
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async function (e) {
            let rotationFlag = getExifRotationFlag(e.target.result as string);
            console.log(rotationFlag);
            var img = new Image();
            var blob = new Blob([reader.result]);
            const src = URL.createObjectURL(blob);
            img.src = src;
            img.style.opacity = '0';
            img.onload = function () {
              let imgWidth = img.width;
              let imgHeight = img.height;
              const isFullColor = imageElem.getAttribute('data-fullcolor') === '1';
              ImageData(
                src, {
                width: imgWidth,
                height: imgHeight,
                rotationFlag,
                grayscale: isFullColor ? undefined : {
                  is_rgba: true,
                  is_shading: imageElem.getAttribute('data-shading') === 'true',
                  threshold: parseInt(imageElem.getAttribute('data-threshold')),
                  is_svg: false
                },
                onComplete: function (result) {
                  const batchCmd = new history.BatchCommand('Replace Image');
                  let cmd;
                  svgCanvas.undoMgr.beginUndoableChange('origImage', [imageElem]);
                  imageElem.setAttribute('origImage', src);
                  cmd = svgCanvas.undoMgr.finishUndoableChange();
                  if (!cmd.isEmpty()) {
                    batchCmd.addSubCommand(cmd);
                  }
                  svgCanvas.undoMgr.beginUndoableChange('xlink:href', [imageElem]);
                  imageElem.setAttribute('xlink:href', result.pngBase64);
                  cmd = svgCanvas.undoMgr.finishUndoableChange();
                  if (!cmd.isEmpty()) {
                    batchCmd.addSubCommand(cmd);
                  }
                  svgCanvas.undoMgr.addCommandToHistory(batchCmd);
                  updateContextPanel();
                  Progress.popById('loading_image');
                  resolve(null);
                }
              }
              );
            };
          };
          reader.readAsArrayBuffer(file);
        });
      }
      editor.replaceBitmap = replaceBitmap;

      const importJsScript = async (file) => {
        Progress.popById('loading_image');
        const reader = new FileReader();
        reader.onloadend = (evt) => {
          const script = evt.target.result as string;
          Function(script)();
        };
        reader.readAsText(file);
      };

      const importLaserConfig = async (file) => {
        Progress.popById('loading_image');
        Alert.popUp({
          buttonType: AlertConstants.CONFIRM_CANCEL,
          message: LANG.right_panel.laser_panel.sure_to_load_config,
          onConfirm: async () => {
            await new Promise<void>(resolve => {
              const reader = new FileReader();
              reader.onloadend = (evt) => {
                const configString = evt.target.result as string;
                const newConfigs = JSON.parse(configString);
                const { customizedLaserConfigs, defaultLaserConfigsInUse } = newConfigs;
                const configNames = new Set(customizedLaserConfigs.filter((config) => !config.isDefault).map((config) => config.name));
                let currentConfig = storage.get('customizedLaserConfigs');
                if (typeof (currentConfig) === 'string') {
                  currentConfig = JSON.parse(currentConfig);
                }
                for (let i = 0; i < currentConfig.length; i++) {
                  const config = currentConfig[i];
                  if (!config.isDefault && !configNames.has(config.name)) {
                    customizedLaserConfigs.push(config);
                  }
                }
                storage.set('customizedLaserConfigs', customizedLaserConfigs);
                storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
                LayerPanelController.updateLayerPanel();
                resolve(null);
              };
              reader.readAsText(file);
            });
          }
        });
      };
      editor.importLaserConfig = importLaserConfig;

      var importImage = function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('#workarea').removeAttr('style');
        if (e.dataTransfer && e.dataTransfer.types.includes('text/noun-project-icon')) {
          const nounProjectIcon = JSON.parse(e.dataTransfer.getData('text/noun-project-icon')) as IIcon;
          NounProjectPanelController.emit('insertIcon', nounProjectIcon);
          return;
        }
        const file = (e.type === 'drop') ? e.dataTransfer.files[0] : this.files[0];
        if (!file) {
          return;
        }
        handleFile(file);
        // let file input import same file again.
        // Beacause function 'importImage' is triggered by onChange event, so we remove the value to ensure onChange event fire
        $(this).attr('value', '');
      };

      const importIconFromNounProject = async (icon: IIcon) => {
        console.log(icon);
        if (icon.icon_url) {
          const response = await fetch(icon.icon_url);
          const blob = await response.blob();
          importSvg(blob as File);
        } else {
          const response = await fetch(icon.preview_url);
          const blob = await response.blob();
          readBitmapFile(blob);
        }
      };

      const handleFile = async (file) => {
        await Progress.openNonstopProgress({ id: 'loading_image', caption: LANG.popup.loading_image });
        svgCanvas.clearSelection();
        const fileType = (function () {
          if (file.name.toLowerCase().endsWith('.beam')) {
            return 'beam';
          }
          if (file.name.toLowerCase().endsWith('.bvg')) {
            return 'bvg';
          }
          if (file.type.toLowerCase().includes('image')) {
            if (file.type.toLowerCase().includes('svg')) {
              return 'svg';
            } else if (file.type.toLowerCase().endsWith('dxf')) {
              return 'dxf';
            } else {
              return 'bitmap';
            }
          }
          if (file.name.toLowerCase().includes('.dxf')) {
            return 'dxf';
          }
          if (file.name.toLowerCase().includes('.json')) {
            return 'json';
          }
          if (file.name.toLowerCase().includes('.js')) {
            return 'js';
          }
          if (file.name.toLowerCase().endsWith('.pdf') || (file.path && file.path.toLowerCase().endsWith('.pdf'))) {
            return 'pdf';
          }
          if (file.name.toLowerCase().endsWith('.ai') || (file.path && file.path.toLowerCase().endsWith('.ai'))) {
            return 'ai';
          }
          return 'unknown';
        })();
        console.log("File type name:", fileType);
        switch (fileType) {
          case 'bvg':
            await importBvg(file);
            Progress.popById('loading_image');
          case 'beam':
            BeamFileHelper.readBeam(file);
            break;
          case 'svg':
            await importSvg(file);
            Progress.popById('loading_image');
            break;
          case 'bitmap':
            await importBitmap(file);
            Progress.popById('loading_image');
            break;
          case 'dxf':
            await importDxf(file);
            Progress.popById('loading_image');
            break;
          case 'pdf':
          case 'ai':
            const { blob, errorMessage } = await pdfHelper.pdfToSvgBlob(file);
            if (blob) {
              Object.assign(blob, {
                name: file.name,
              });
              await importSvg(blob as File, { skipByLayer: true });
              Progress.popById('loading_image');
            } else {
              Progress.popById('loading_image');
              Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: errorMessage,
              });
            }
            break;
          case 'js':
            importJsScript(file);
            break;
          case 'json':
            importLaserConfig(file);
            break;
          case 'unknown':
            Progress.popById('loading_image');
            Alert.popUp({
              id: 'import_unknown',
              message: LANG.svg_editor.unnsupported_file_type,
              type: AlertConstants.SHOW_POPUP_WARNING,
            });
            break;
        }
        let fileName = file.name.slice(0, file.name.lastIndexOf('.')).replace(':', "/");
        switch (fileType) {
          case 'bvg':
          case 'beam':
            svgCanvas.setLatestImportFileName(fileName);
            svgCanvas.currentFilePath = file.path;
            svgCanvas.updateRecentFiles(file.path);
            svgCanvas.setHasUnsavedChange(false);
            break;
          case 'dxf':
            svgCanvas.setLatestImportFileName(fileName);
            svgCanvas.currentFilePath = null;
            svgCanvas.setHasUnsavedChange(true);
            break;
          case 'svg':
          case 'bitmap':
          case 'ai':
            if (!svgCanvas.getLatestImportFileName()) {
              svgCanvas.setLatestImportFileName(fileName);
            }
            svgCanvas.setHasUnsavedChange(true);
            break;
        }
        canvasEvents.addImage();
      }
      editor.handleFile = handleFile;

      workarea[0].addEventListener('dragenter', onDragEnter, false);
      workarea[0].addEventListener('dragover', onDragOver, false);
      workarea[0].addEventListener('dragleave', onDragLeave, false);
      workarea[0].addEventListener('drop', importImage, false);

      // Keep for e2e import image
      // enable beambox-global-interaction to click (data-file-input, trigger_file_input_click)
      var imgImport = $('<input type="file" accept=".svg,.bvg,.jpg,.png,.dxf,.js,.beam,.ai,.pdf" data-file-input="import_image">').change(importImage);
      $('#tool_import').show().prepend(imgImport);


      window['updateContextPanel'] = updateContextPanel;
    }

    //			$(function() {
    //			});

    //	var revnums = "svg-editor.js ($Rev$) ";
    //	revnums += svgCanvas.getVersion();
    //	$('#copyright')[0].setAttribute('title', revnums);

    // For Compatibility with older extensions
    $(function () {
      window['svgCanvas'] = svgCanvas;
      svgCanvas.ready = editor.ready;
    });

    editor.setLang = function (lang, allStrings) {
      editor.langChanged = true;
      $.pref('lang', lang);
      $('#lang_select').val(lang);
      if (!allStrings) {
        return;
      }
      // var notif = allStrings.notification; // Currently unused
      // $.extend will only replace the given strings
      var oldLayerName = $('#layerlist tr.layersel td.layername').text();
      var rename_layer = (oldLayerName === uiStrings.layers.layer + ' 1');

      $.extend(uiStrings, allStrings);
      svgCanvas.setUiStrings(allStrings);

      if (rename_layer) {
        svgCanvas.renameCurrentLayer(uiStrings.layers.layer + ' 1');
        LayerPanelController.updateLayerPanel();
      }

      // In case extensions loaded before the locale, now we execute a callback on them
      if (extsPreLang.length) {
        while (extsPreLang.length) {
          var ext = extsPreLang.shift();
          ext.langReady({
            lang: lang,
            uiStrings: uiStrings
          });
        }
      } else {
        svgCanvas.runExtensions('langReady', {
          lang: lang,
          uiStrings: uiStrings
        });
      }
      svgCanvas.runExtensions('langChanged', lang);

      // Copy alignment titles
      $('#multiselected_panel div[id^=tool_align]').each(function () {
        $('#tool_pos' + this.id.substr(10))[0].title = this.title;
      });
    };

    //greyscale all svgContent
    (function () {
      const svgdoc = document.getElementById('svgcanvas').ownerDocument;
      const greyscaleFilter = svgdoc.createElementNS(svgedit.NS.SVG, 'filter');
      svgCanvas.assignAttributes(greyscaleFilter, {
        'id': 'greyscaleFilter'
      });

      const greyscaleMatrix = svgdoc.createElementNS(svgedit.NS.SVG, 'feColorMatrix');
      svgCanvas.assignAttributes(greyscaleMatrix, {
        type: 'matrix',
        values: '0.3333 0.3333 0.3333 0  0\
							0.3333 0.3333 0.3333 0  0\
							0.3333 0.3333 0.3333 0  0\
							0 	   0      0      1  0'
      });
      greyscaleFilter.appendChild(greyscaleMatrix);
      //$('#svgroot defs').append(greyscaleFilter);
      // $(svgcontent).attr({
      //     filter: 'url(#greyscaleFilter)'
      // });
    })();
  };

  editor.ready = function (cb) {
    if (!isReady) {
      callbacks.push(cb);
    } else {
      cb();
    }
  };

  editor.runCallbacks = function () {
    $.each(callbacks, function () {
      this();
    });
    isReady = true;
  };

  editor.addExtension = function () {
    var args = arguments;

    // Note that we don't want this on editor.ready since some extensions
    // may want to run before then (like server_opensave).
    $(function () {
      if (svgCanvas) {
        svgCanvas.addExtension.apply(this, args);
      }
    });
  };

  return editor;
})();

// Run init once DOM is loaded
// $(svgEditor.init);
//replaced by componentDidMount()
export default window['svgEditor'];
