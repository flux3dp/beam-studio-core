/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import autoSaveHelper from 'helpers/auto-save-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import BeamboxStore from 'app/stores/beambox-store';
import browser from 'implementations/browser';
import checkDeviceStatus from 'helpers/check-device-status';
import checkQuestionnaire from 'helpers/check-questionnaire';
import Constant from 'app/actions/beambox/constant';
import DeviceMaster from 'helpers/device-master';
import Dialog from 'app/actions/dialog-caller';
import fluxId from 'helpers/api/flux-id';
import FontConstants from 'app/constants/font-constants';
import fontScanner from 'implementations/fontScanner';
import i18n from 'helpers/i18n';
import menuActions from 'app/actions/beambox/menuActions';
import menuDeviceActions from 'app/actions/beambox/menuDeviceActions';
import menuEventListenerFactory from 'implementations/menuEventListenerFactory';
import ratingHelper from 'helpers/rating-helper';
import sentryHelper from 'helpers/sentry-helper';
import storage from 'implementations/storage';
import Tutorials from 'app/actions/beambox/tutorials';
import viewMenu from 'helpers/menubar/view';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { IFont } from 'interfaces/IFont';
import { showCameraCalibration } from 'app/views/beambox/Camera-Calibration';

let svgedit;
getSVGAsync((globalSVG) => {
  svgedit = globalSVG.Edit;
});

let menuEventRegistered = false;

const init = (): void => {
  if (Constant.addonsSupportList.autoFocus.includes(BeamboxPreference.read('workarea'))) {
    const defaultAutoFocus = BeamboxPreference.read('default-autofocus');
    BeamboxPreference.write('enable-autofocus', defaultAutoFocus);
  } else {
    BeamboxPreference.write('enable-autofocus', false);
  }
  if (Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))) {
    const defaultDiode = BeamboxPreference.read('default-diode');
    BeamboxPreference.write('enable-diode', defaultDiode);
  } else {
    BeamboxPreference.write('enable-diode', false);
  }

  let defaultBorderless = BeamboxPreference.read('default-borderless');
  if (defaultBorderless === undefined) {
    BeamboxPreference.write('default-borderless', BeamboxPreference.read('borderless'));
    defaultBorderless = BeamboxPreference.read('default-borderless');
  }
  if (Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'))) {
    BeamboxPreference.write('borderless', defaultBorderless);
  } else {
    BeamboxPreference.write('borderless', false);
  }

  if (!storage.get('default-units')) {
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const isEn = navigator.language.slice(0, 2).toLocaleLowerCase() === 'en';
    if (timeZone.startsWith('America') && isEn) {
      storage.set('default-units', 'inches');
    }
  }
  if (!storage.get('default-font')) {
    initDefaultFont();
  }
  viewMenu.init();
  initMenuEvents();
  autoSaveHelper.init();
  // fluxId.init();
  BeamboxStore.onDrawGuideLines(displayGuides);
};

const displayGuides = () => {
  document.getElementById('horizontal_guide')?.remove();
  document.getElementById('vertical_guide')?.remove();

  const guidesLines = (() => {
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const { NS } = svgedit;
    const linesGroup = svgdoc.createElementNS(NS.SVG, 'svg');
    const lineVertical = svgdoc.createElementNS(NS.SVG, 'line');
    const lineHorizontal = svgdoc.createElementNS(NS.SVG, 'line');

    svgedit.utilities.assignAttributes(linesGroup, {
      id: 'guidesLines',
      width: '100%',
      height: '100%',
      x: 0,
      y: 0,
      viewBox: `0 0 ${Constant.dimension.getWidth(BeamboxPreference.read('workarea'))} ${Constant.dimension.getHeight(BeamboxPreference.read('workarea'))}`,
      style: 'pointer-events: none',
    });

    svgedit.utilities.assignAttributes(lineHorizontal, {
      id: 'horizontal_guide',
      x1: 0,
      x2: Constant.dimension.getWidth(BeamboxPreference.read('workarea')),
      y1: BeamboxPreference.read('guide_y0') * 10,
      y2: BeamboxPreference.read('guide_y0') * 10,
      stroke: '#000',
      'stroke-width': '2',
      'stroke-opacity': 0.8,
      'stroke-dasharray': '5, 5',
      'vector-effect': 'non-scaling-stroke',
      fill: 'none',
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(lineVertical, {
      id: 'vertical_guide',
      x1: BeamboxPreference.read('guide_x0') * 10,
      x2: BeamboxPreference.read('guide_x0') * 10,
      y1: 0,
      y2: Constant.dimension.getHeight(BeamboxPreference.read('workarea')),
      stroke: '#000',
      'stroke-width': '2',
      'stroke-opacity': 0.8,
      'stroke-dasharray': '5, 5',
      'vector-effect': 'non-scaling-stroke',
      fill: 'none',
      style: 'pointer-events:none',
    });

    linesGroup.appendChild(lineHorizontal);
    linesGroup.appendChild(lineVertical);
    return linesGroup;
  })();
  const canvasBG = document.getElementById('canvasBackground');
  if (canvasBG) {
    canvasBG.appendChild(guidesLines);
  }
};

const initDefaultFont = () => {
  const lang = navigator.language;
  const { os } = window;
  let defaultFontFamily = os === 'Linux' ? 'Ubuntu' : 'Arial';
  if (FontConstants[lang] && FontConstants[lang][os]) {
    defaultFontFamily = FontConstants[lang][os];
  }
  const fonts = fontScanner.findFonts({ family: defaultFontFamily });
  if (fonts.length > 0) {
    const defaultFont: IFont = fonts.filter((font) => font.style === 'Regular')[0] || fonts[0];
    storage.set('default-font', {
      family: defaultFont.family,
      postscriptName: defaultFont.postscriptName,
      style: defaultFont.style,
    });
  }
};

const initMenuEvents = (): void => {
  const registerMenuClickEvents = () => {
    menuEventRegistered = true;
    const menuEventListener = menuEventListenerFactory.createMenuEventListener();

    menuEventListener.on('MENU_CLICK', (_, menuItem) => {
      const actions: { [key: string]: ((deivce?: IDeviceInfo) => void) } = {
        ...menuActions,
        ...menuDeviceActions,
      };

      if (typeof actions[menuItem.id] === 'function') {
        if (Object.keys(menuActions).includes(menuItem.id)) {
          actions[menuItem.id]();
        } else {
          const callback = {
            timeout: 20000,
            onSuccess: (device) => actions[menuItem.id](device),
            onTimeout: () => console.log('select device timeout'),
          };

          DeviceMaster.getDeviceBySerial(menuItem.serial, callback);
        }
      }
    });
  };

  if (!menuEventRegistered) {
    registerMenuClickEvents();
  }
};

const showStartUpDialogs = async (): Promise<void> => {
  await askAndInitSentry();
  const isNewUser = storage.get('new-user');
  if (isNewUser) {
    if (await askFirstTimeCameraCalibration()) {
      await doFirstTimeCameraCalibration();
    } else {
      await onCameraCalibrationSkipped();
    }
  }
  await showTutorial(isNewUser);
  if (!isNewUser) {
    const lastInstalledVersion = storage.get('last-installed-version');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (window['FLUX'].version !== lastInstalledVersion) {
      await showChangeLog();
    }
    await showQuestionnaire();
  }
  ratingHelper.init();
  checkOSVersion();
  storage.removeAt('new-user');
  // eslint-disable-next-line @typescript-eslint/dot-notation
  storage.set('last-installed-version', window['FLUX'].version);
};

const askAndInitSentry = async () => {
  if (storage.get('enable-sentry') === undefined) {
    await new Promise<void>((resolve) => {
      const LANG = i18n.lang;
      Alert.popUp({
        id: 'ask-sentry',
        caption: LANG.beambox.popup.sentry.title,
        iconUrl: 'img/beambox/icon-analyze.svg',
        message: LANG.beambox.popup.sentry.message,
        buttonType: AlertConstants.YES_NO,
        onYes: () => {
          storage.set('enable-sentry', 1);
          sentryHelper.initSentry();
          resolve();
        },
        onNo: () => {
          storage.set('enable-sentry', 0);
          resolve();
        },
      });
    });
  }
};

const askFirstTimeCameraCalibration = () => new Promise((resolve) => {
  Alert.popUp({
    caption: i18n.lang.tutorial.welcome,
    message: i18n.lang.tutorial.suggest_calibrate_camera_first,
    buttonType: AlertConstants.YES_NO,
    onNo: () => resolve(false),
    onYes: () => resolve(true),
  });
});

const onCameraCalibrationSkipped = () => new Promise((resolve) => {
  Alert.popUp({
    message: i18n.lang.tutorial.skipped_camera_calibration,
    callbacks: resolve,
  });
});

const doFirstTimeCameraCalibration = async () => {
  const LANG = i18n.lang.tutorial;
  const askForRetry = () => new Promise((resolve) => {
    Alert.popUp({
      caption: LANG.camera_calibration_failed,
      message: LANG.ask_retry_calibration,
      buttonType: AlertConstants.YES_NO,
      onYes: async () => resolve(await doFirstTimeCameraCalibration()),
      onNo: async () => resolve(await onCameraCalibrationSkipped()),
    });
  });

  const device = await Dialog.selectDevice();
  if (!device) {
    await onCameraCalibrationSkipped();
    return;
  }
  try {
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) {
      await onCameraCalibrationSkipped();
      return;
    }
    const selectRes = await DeviceMaster.select(device);
    if (selectRes.success) {
      const caliRes = await showCameraCalibration(device, false);
      if (!caliRes) {
        await onCameraCalibrationSkipped();
      }
      return;
    }
    await askForRetry();
  } catch (e) {
    console.error(e);
    await askForRetry();
  }
};

const showTutorial = (isNewUser: boolean): Promise<void> => {
  if (!AlertConfig.read('skip-interface-tutorial')) {
    const LANG = i18n.lang.tutorial;
    return new Promise<void>((resolve) => {
      Alert.popUp({
        id: 'ask-tutorial',
        caption: LANG.welcome,
        message: isNewUser ? LANG.needNewUserTutorial : LANG.needNewInterfaceTutorial,
        buttonType: AlertConstants.YES_NO,
        onYes: () => {
          const tutorialCallback = () => {
            AlertConfig.write('skip-interface-tutorial', true);
            Alert.popUp({
              message: LANG.tutorial_complete,
              callbacks: () => resolve(),
            });
          };
          if (isNewUser) {
            Tutorials.startNewUserTutorial(tutorialCallback);
          } else {
            Tutorials.startInterfaceTutorial(tutorialCallback);
          }
        },
        onNo: () => {
          AlertConfig.write('skip-interface-tutorial', true);
          if (isNewUser) {
            Alert.popUp({
              message: LANG.skip_tutorial,
              callbacks: () => resolve(),
            });
          } else {
            resolve();
          }
        },
      });
    });
  }
  return null;
};

const showChangeLog = () => new Promise<void>((resolve) => {
  Dialog.showChangLog({ callback: resolve });
});

const showQuestionnaire = async () => {
  const lastQuestionnaireVersion = storage.get('questionnaire-version') || 0;
  const res = await checkQuestionnaire();
  console.log(res, lastQuestionnaireVersion);

  if (!res || res.version <= lastQuestionnaireVersion) return null;

  let url: string;
  if (res.urls) {
    url = res.urls[i18n.getActiveLang()] || res.urls.en;
  }
  if (!url) return null;

  storage.set('questionnaire-version', res.version);

  return new Promise<void>((resolve) => {
    Alert.popUp({
      id: 'qustionnaire',
      caption: i18n.lang.beambox.popup.questionnaire.caption,
      message: i18n.lang.beambox.popup.questionnaire.message,
      iconUrl: 'img/beambox/icon-questionnaire.svg',
      buttonType: AlertConstants.YES_NO,
      onYes: () => {
        browser.open(url);
        resolve();
      },
      onNo: () => {
        resolve();
      },
    });
  });
};

const checkOSVersion = (): void => {
  const LANG = i18n.lang.beambox;
  if (!AlertConfig.read('skip_os_version_warning')) {
    if (window.os === 'MacOS') {
      try {
        const osVersion = /(?<=Mac OS X )[._\d]+/.exec(navigator.userAgent)[0];
        const version = osVersion.split('_').map((v) => parseInt(v, 10));
        if (version[0] === 10 && version[1] < 13) {
          Alert.popUp({
            id: 'os_version_warning',
            message: sprintf(i18n.lang.message.unsupport_osx_version, osVersion),
            type: AlertConstants.SHOW_POPUP_WARNING,
            checkbox: {
              text: LANG.popup.dont_show_again,
              callbacks: () => AlertConfig.write('skip_os_version_warning', true),
            },
          });
        }
      } catch (e) {
        console.error('Fail to get MacOS Version');
      }
    } else if (window.os === 'Windows') {
      const windowsVersionStrings = [
        { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/, shouldAlert: false },
        { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/, shouldAlert: true },
        { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/, shouldAlert: true },
        { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/, shouldAlert: true },
        { s: 'Windows Vista', r: /Windows NT 6.0/, shouldAlert: true },
        { s: 'Windows Server 2003', r: /Windows NT 5.2/, shouldAlert: true },
        { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/, shouldAlert: true },
        { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/, shouldAlert: true },
        { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/, shouldAlert: true },
        { s: 'Windows 98', r: /(Windows 98|Win98)/, shouldAlert: true },
        { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/, shouldAlert: true },
        { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT)/, shouldAlert: true },
        { s: 'Windows CE', r: /Windows CE/, shouldAlert: true },
        { s: 'Windows 3.11', r: /Win16/, shouldAlert: true },
      ];
      let shouldAlert = false;
      let osVersion;
      for (let i = 0; i < windowsVersionStrings.length; i += 1) {
        const versionString = windowsVersionStrings[i];
        if (versionString.r.test(navigator.userAgent)) {
          osVersion = versionString.s;
          shouldAlert = versionString.shouldAlert;
          break;
        }
      }
      if (shouldAlert) {
        Alert.popUp({
          id: 'os_version_warning',
          message: sprintf(i18n.lang.message.unsupport_win_version, osVersion),
          type: AlertConstants.SHOW_POPUP_WARNING,
          checkbox: {
            text: LANG.popup.dont_show_again,
            callbacks: () => AlertConfig.write('skip_os_version_warning', true),
          },
        });
      }
    }
  }
};

export default {
  init,
  showStartUpDialogs,
};
