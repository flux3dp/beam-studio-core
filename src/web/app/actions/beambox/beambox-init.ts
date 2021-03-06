/* eslint-disable class-methods-use-this */
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
import fontHelper from 'implementations/fontHelper';
import InterProcess from 'helpers/api/inter-process';
import i18n from 'helpers/i18n';
import menu from 'implementations/menu';
import ratingHelper from 'helpers/rating-helper';
import sentryHelper from 'helpers/sentry-helper';
import storage from 'implementations/storage';
import Tutorials from 'app/actions/beambox/tutorials';
import { checkConnection } from 'helpers/api/discover';
import { gestureIntroduction } from 'app/constants/media-tutorials';
import { IFont } from 'interfaces/IFont';
import { showCameraCalibration } from 'app/views/beambox/Camera-Calibration';

class BeamboxInit {
  constructor() {
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
      this.initDefaultFont();
    }
    menu.init();
    autoSaveHelper.init();
    fluxId.init();
    BeamboxStore.onDrawGuideLines(this.displayGuides);

    // WebSocket for Adobe Illustrator Plug-In
    InterProcess();
  }

  async showStartUpDialogs(): Promise<void> {
    await this.askAndInitSentry();
    const isNewUser = storage.get('new-user');
    const hasMachineConnection = checkConnection();
    if (window.FLUX.version === 'web') {
      const res = await fluxId.getPreference('did_gesture_tutorial', true);
      if (res && !res.error && res.status === 'ok' && !res.value) {
        await Dialog.showMediaTutorial(gestureIntroduction);
        await fluxId.setPreference({ did_gesture_tutorial: true });
      }
    }
    await this.showFirstCalibrationDialog();
    if (hasMachineConnection) await this.showTutorial(isNewUser);
    if (!isNewUser) {
      const lastInstalledVersion = storage.get('last-installed-version');
      if (window.FLUX.version !== lastInstalledVersion) {
        await this.showChangeLog();
      }
      await this.showQuestionnaire();
    }
    ratingHelper.init();
    storage.removeAt('new-user');
    // eslint-disable-next-line @typescript-eslint/dot-notation
    storage.set('last-installed-version', window['FLUX'].version);
  }

  private displayGuides(): void {
    document.getElementById('horizontal_guide')?.remove();
    document.getElementById('vertical_guide')?.remove();
    const { NS, utilities } = window.svgedit;
    const guidesLines = (() => {
      const svgdoc = document.getElementById('svgcanvas').ownerDocument;
      const linesGroup = svgdoc.createElementNS(NS.SVG, 'svg');
      const lineVertical = svgdoc.createElementNS(NS.SVG, 'line');
      const lineHorizontal = svgdoc.createElementNS(NS.SVG, 'line');

      utilities.assignAttributes(linesGroup, {
        id: 'guidesLines',
        width: '100%',
        height: '100%',
        x: 0,
        y: 0,
        viewBox: `0 0 ${Constant.dimension.getWidth(BeamboxPreference.read('workarea'))} ${Constant.dimension.getHeight(BeamboxPreference.read('workarea'))}`,
        style: 'pointer-events: none',
      });

      utilities.assignAttributes(lineHorizontal, {
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

      utilities.assignAttributes(lineVertical, {
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
  }

  private initDefaultFont(): void {
    const lang = navigator.language;
    const isWeb = window.FLUX.version === 'web';
    const { os } = window;
    let defaultFontFamily = 'Arial';
    if (isWeb) defaultFontFamily = 'Noto Sans';
    else if (os === 'Linux') defaultFontFamily = 'Ubuntu';
    if (FontConstants[lang]) {
      if (isWeb && FontConstants[lang].web) {
        defaultFontFamily = FontConstants[lang].web;
      } else if (FontConstants[lang][os]) {
        defaultFontFamily = FontConstants[lang][os];
      }
    }
    const fonts = fontHelper.findFonts({ family: defaultFontFamily });
    if (fonts.length > 0) {
      const defaultFont: IFont = fonts.filter((font) => font.style === 'Regular')[0] || fonts[0];
      storage.set('default-font', {
        family: defaultFont.family,
        postscriptName: defaultFont.postscriptName,
        style: defaultFont.style,
      });
    }
  }

  private async askAndInitSentry(): Promise<void> {
    const enableSentry = storage.get('enable-sentry');
    if (enableSentry === undefined || enableSentry === '') {
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
  }

  private showFirstCalibrationDialog = async () => {
    const isNewUser = storage.get('new-user');
    const hasDoneFirstCali = AlertConfig.read('done-first-cali');
    const hasMachineConnection = checkConnection();
    // in web, wait for websocket connection
    if (window.FLUX.version === 'web' && !hasDoneFirstCali && !hasMachineConnection) await new Promise((r) => setTimeout(r, 1000));
    const shouldShow = window.FLUX.version === 'web' ? (hasMachineConnection && !hasDoneFirstCali) : isNewUser;
    if (shouldShow) {
      if (await this.askFirstTimeCameraCalibration()) {
        await this.doFirstTimeCameraCalibration();
      } else {
        await this.onCameraCalibrationSkipped();
      }
      AlertConfig.write('done-first-cali', true);
    }
  };

  private askFirstTimeCameraCalibration = () => new Promise<boolean>((resolve) => {
    Alert.popUp({
      caption: i18n.lang.tutorial.welcome,
      message: i18n.lang.tutorial.suggest_calibrate_camera_first,
      buttonType: AlertConstants.YES_NO,
      onNo: () => resolve(false),
      onYes: () => resolve(true),
    });
  });

  private onCameraCalibrationSkipped = () => new Promise((resolve) => {
    Alert.popUp({
      message: i18n.lang.tutorial.skipped_camera_calibration,
      callbacks: resolve,
    });
  });

  private async doFirstTimeCameraCalibration(): Promise<void> {
    const LANG = i18n.lang.tutorial;
    const askForRetry = () => new Promise((resolve) => {
      Alert.popUp({
        caption: LANG.camera_calibration_failed,
        message: LANG.ask_retry_calibration,
        buttonType: AlertConstants.YES_NO,
        onYes: async () => resolve(await this.doFirstTimeCameraCalibration()),
        onNo: async () => resolve(await this.onCameraCalibrationSkipped()),
      });
    });

    const device = await Dialog.selectDevice();
    if (!device) {
      await this.onCameraCalibrationSkipped();
      return;
    }
    try {
      const deviceStatus = await checkDeviceStatus(device);
      if (!deviceStatus) {
        await this.onCameraCalibrationSkipped();
        return;
      }
      const selectRes = await DeviceMaster.select(device);
      if (selectRes.success) {
        const caliRes = await showCameraCalibration(device, false);
        if (!caliRes) {
          await this.onCameraCalibrationSkipped();
        }
        return;
      }
      await askForRetry();
    } catch (e) {
      console.error(e);
      await askForRetry();
    }
  }

  private showTutorial(isNewUser: boolean): Promise<void> {
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
  }

  private showChangeLog = () => new Promise<void>((resolve) => {
    Dialog.showChangLog({ callback: resolve });
  });

  private async showQuestionnaire(): Promise<void> {
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
  }
}

export default BeamboxInit;
