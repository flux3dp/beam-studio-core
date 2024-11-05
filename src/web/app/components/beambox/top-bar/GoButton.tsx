import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import alertConfig, { AlertConfigKey } from 'helpers/api/alert-config';
import alertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import CalibrationType from 'app/components/dialogs/camera/AdorCalibration/calibrationTypes';
import constant, { promarkModels } from 'app/actions/beambox/constant';
import checkDeviceStatus from 'helpers/check-device-status';
import checkOldFirmware from 'helpers/device/checkOldFirmware';
import Dialog from 'app/actions/dialog-caller';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import getDevice from 'helpers/device/get-device';
import isDev from 'helpers/is-dev';
import isWeb from 'helpers/is-web';
import LayerModules, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import SymbolMaker from 'helpers/symbol-maker';
import shortcuts from 'helpers/shortcuts';
import storage from 'implementations/storage';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import TutorialConstants from 'app/constants/tutorial-constants';
import useI18n from 'helpers/useI18n';
import VersionChecker from 'helpers/version-checker';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { executeFirmwareUpdate } from 'app/actions/beambox/menuDeviceActions';
import { getNextStepRequirement, handleNextStep } from 'app/views/tutorials/tutorialController';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { showAdorCalibration } from 'app/components/dialogs/camera/AdorCalibration';

import styles from './GoButton.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { $ } = window;

interface Props {
  hasText: boolean;
  hasDiscoverdMachine: boolean;
}

const GoButton = ({ hasDiscoverdMachine, hasText }: Props): JSX.Element => {
  const lang = useI18n();
  const { endPreviewMode, mode } = useContext(CanvasContext);
  const shortcutHandler = useRef<() => void>(null);
  useEffect(() => {
    const unregister = shortcuts.on(['F2'], () => shortcutHandler.current?.());
    return () => unregister?.();
  }, []);

  const handleExportAlerts = useCallback(
    async (device: IDeviceInfo) => {
      const workarea = device.model;
      const isPromark = promarkModels.has(workarea);
      const layers = [...document.querySelectorAll('#svgcontent > g.layer:not([display="none"])')];
      const supportInfo = getSupportInfo(workarea);

      if (!constant.highPowerModels.includes(workarea)) {
        const isPowerTooHigh = layers.some((layer) => {
          const strength = Number(layer.getAttribute('data-strength'));
          const diode = Number(layer.getAttribute('data-diode'));
          return strength > 70 && diode !== 1;
        });
        if (!alertConfig.read('skip-high-power-confirm') && isPowerTooHigh) {
          const confirmed = await Dialog.showConfirmPromptDialog({
            caption: lang.topbar.alerts.power_too_high,
            message: lang.topbar.alerts.power_too_high_msg,
            confirmValue: lang.topbar.alerts.power_too_high_confirm,
            alertConfigKey: 'skip-high-power-confirm',
          });
          if (!confirmed) return false;
        }
      }

      const vc = VersionChecker(device.version);
      const isAdor = constant.adorModels.includes(device.model);
      if (!vc.meetRequirement(isAdor ? 'ADOR_PWM' : 'PWM')) {
        if (layers.some((layer) => layer.querySelector('image[data-pwm="1"]'))) {
          const res = await new Promise((resolve) => {
            alertCaller.popUp({
              type: alertConstants.SHOW_POPUP_ERROR,
              message: lang.topbar.alerts.pwm_unavailable,
              buttonType: alertConstants.CONFIRM_CANCEL,
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          if (res) executeFirmwareUpdate(device, 'firmware');
          return false;
        }
      }
      if (supportInfo.jobOrigin && !vc.meetRequirement(isAdor ? 'ADOR_JOB_ORIGIN' : 'JOB_ORIGIN')) {
        if (BeamboxPreference.read('enable-job-origin')) {
          const res = await new Promise((resolve) => {
            alertCaller.popUp({
              type: alertConstants.SHOW_POPUP_ERROR,
              message: lang.topbar.alerts.job_origin_unavailable,
              buttonType: alertConstants.CONFIRM_CANCEL,
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          if (res) executeFirmwareUpdate(device, 'firmware');
          return false;
        }
      }

      // Skip speed check for promark
      if (isPromark) return true;

      SymbolMaker.switchImageSymbolForAll(false);
      let isTooFastForPath = false;
      const tooFastLayers = [];
      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i];
        if (
          parseFloat(layer.getAttribute('data-speed')) > 20 &&
          layer.getAttribute('display') !== 'none'
        ) {
          const paths = Array.from($(layer).find('path, rect, ellipse, polygon, line'));
          const uses = $(layer).find('use');
          let hasWireframe = false;
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          Array.from(uses).forEach((use: Element) => {
            const href = use.getAttribute('xlink:href');
            paths.push(...Array.from($(`${href}`).find('path, rect, ellipse, polygon, line')));
            if (use.getAttribute('data-wireframe') === 'true') {
              isTooFastForPath = true;
              hasWireframe = true;
              tooFastLayers.push(svgCanvas.getCurrentDrawing().getLayerName(i));
            }
          });
          if (hasWireframe) {
            break;
          }
          for (let j = 0; j < paths.length; j += 1) {
            const path = paths[j];
            const fill = $(path).attr('fill');
            const fillOpacity = parseFloat($(path).attr('fill-opacity'));
            if (fill === 'none' || fill === '#FFF' || fill === '#FFFFFF' || fillOpacity === 0) {
              isTooFastForPath = true;
              tooFastLayers.push(svgCanvas.getCurrentDrawing().getLayerName(i));
              break;
            }
          }
        }
      }
      SymbolMaker.switchImageSymbolForAll(true);

      if (isTooFastForPath) {
        await new Promise((resolve) => {
          if (BeamboxPreference.read('vector_speed_contraint') === false) {
            if (!alertConfig.read('skip_path_speed_warning')) {
              let message = lang.beambox.popup.too_fast_for_path;
              if (storage.get('default-units') === 'inches') {
                message = message.replace(/20mm\/s/g, '0.8in/s');
              }
              alertCaller.popUp({
                message,
                type: alertConstants.SHOW_POPUP_WARNING,
                checkbox: {
                  text: lang.beambox.popup.dont_show_again,
                  callbacks: () => {
                    alertConfig.write('skip_path_speed_warning', true);
                    resolve(null);
                  },
                },
                callbacks: () => resolve(null),
              });
            } else {
              resolve(null);
            }
          } else if (!alertConfig.read('skip_path_speed_constraint_warning')) {
            let message = sprintf(
              lang.beambox.popup.too_fast_for_path_and_constrain,
              tooFastLayers.join(', ')
            );
            if (storage.get('default-units') === 'inches') {
              message = message.replace(/20mm\/s/g, '0.8in/s');
            }
            alertCaller.popUp({
              message,
              type: alertConstants.SHOW_POPUP_WARNING,
              checkbox: {
                text: lang.beambox.popup.dont_show_again,
                callbacks: () => {
                  alertConfig.write('skip_path_speed_constraint_warning', true);
                  resolve(null);
                },
              },
              callbacks: () => resolve(null),
            });
          } else {
            resolve(null);
          }
        });
      }
      return true;
    },
    [lang]
  );

  const checkModuleCalibration = useCallback(
    async (device: IDeviceInfo) => {
      const workarea = BeamboxPreference.read('workarea');
      if (!modelsWithModules.has(workarea) || !modelsWithModules.has(device.model)) return;
      const moduleOffsets = BeamboxPreference.read('module-offsets') || {};
      const getLayers = (module: LayerModules) =>
        document.querySelectorAll(
          `#svgcontent > g.layer[data-module="${module}"]:not([display="none"]):not([data-repeat="0"])`
        );
      const checkCalibration = async (
        layerModule: LayerModules,
        calibrationType: CalibrationType,
        alertTitle: string,
        alertMsg: string
      ) => {
        const alertConfigKey = `skip-cali-${layerModule}-warning`;
        if (!moduleOffsets?.[layerModule] && !alertConfig.read(alertConfigKey as AlertConfigKey)) {
          const moduleLayers = [...getLayers(layerModule)];
          if (
            moduleLayers.some(
              (g) => !!g.querySelector(':not(title):not(filter):not(g):not(feColorMatrix)')
            )
          ) {
            const doCali = await new Promise((resolve) => {
              alertCaller.popUp({
                id: 'module-cali-warning',
                caption: alertTitle,
                message: alertMsg,
                buttonType: alertConstants.CONFIRM_CANCEL,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
              });
            });
            if (doCali) await showAdorCalibration(calibrationType);
          }
        }
      };
      const langNotification = lang.layer_module.notification;
      await checkCalibration(
        LayerModules.PRINTER,
        CalibrationType.PRINTER_HEAD,
        langNotification.performPrintingCaliTitle,
        langNotification.performPrintingCaliMsg
      );
      await checkCalibration(
        LayerModules.LASER_1064,
        CalibrationType.IR_LASER,
        langNotification.performIRCaliTitle,
        langNotification.performIRCaliMsg
      );
    },
    [lang]
  );

  const exportTask = useCallback(
    async (device: IDeviceInfo) => {
      const showForceUpdateAlert = (id: string) => {
        alertCaller.popUp({
          id,
          message: lang.update.firmware.force_update_message,
          type: alertConstants.SHOW_POPUP_ERROR,
          buttonType: alertConstants.CUSTOM_CANCEL,
          buttonLabels: [lang.update.update],
          callbacks: () => {
            executeFirmwareUpdate(device, 'firmware');
          },
          onCancel: () => {},
        });
      };
      const { version, model } = device;
      if (version === '4.1.1' && model !== 'fhexa1') {
        showForceUpdateAlert('4.1.1-version-alert');
        return;
      }
      const rotaryMode = BeamboxPreference.read('rotary_mode');
      // Check 4.1.5 / 4.1.6 rotary
      if (rotaryMode && ['4.1.5', '4.1.6'].includes(version) && model !== 'fhexa1') {
        showForceUpdateAlert('4.1.5,6-rotary-alert');
        return;
      }
      const vc = VersionChecker(version);
      if (!isDev() && constant.adorModels.includes(model)) {
        if (!vc.meetRequirement('ADOR_FCODE_V3')) {
          showForceUpdateAlert('ador-fcode-v3');
          return;
        }
        if (rotaryMode && !vc.meetRequirement('ADOR_ROTARY')) {
          showForceUpdateAlert('ador-rotary');
          return;
        }
      }

      if (!vc.meetRequirement('USABLE_VERSION')) {
        alertCaller.popUp({
          id: 'fatal-occurred',
          message: lang.beambox.popup.should_update_firmware_to_continue,
          type: alertConstants.SHOW_POPUP_ERROR,
        });
        return;
      }
      const res = await checkOldFirmware(device.version);
      if (!res) return;
      const currentWorkarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
      const allowedWorkareas = constant.allowedWorkarea[model];
      if (currentWorkarea && allowedWorkareas) {
        if (!allowedWorkareas.includes(currentWorkarea)) {
          alertCaller.popUp({
            id: 'workarea unavailable',
            message: lang.message.unavailableWorkarea,
            type: alertConstants.SHOW_POPUP_ERROR,
          });
          return;
        }
      }
      if (
        BeamboxPreference.read('enable-job-origin') &&
        !alertConfig.read('skip-job-origin-warning')
      ) {
        await new Promise((resolve) => {
          alertCaller.popUp({
            message: lang.topbar.alerts.job_origin_warning,
            type: alertConstants.SHOW_POPUP_WARNING,
            checkbox: {
              text: lang.beambox.popup.dont_show_again,
              callbacks: () => {
                alertConfig.write('skip-job-origin-warning', true);
                resolve(null);
              },
            },
            callbacks: () => resolve(null),
          });
        });
      }
      ExportFuncs.uploadFcode(device);
    },
    [lang]
  );

  const handleExportClick = useCallback(async () => {
    endPreviewMode();

    if (getNextStepRequirement() === TutorialConstants.SEND_FILE) {
      handleNextStep();
    }

    const handleExport = async () => {
      const { device } = await getDevice();
      if (!device) return;
      const confirmed = await handleExportAlerts(device);
      if (!confirmed) return;
      const deviceStatus = await checkDeviceStatus(device);
      if (!deviceStatus) return;
      await checkModuleCalibration(device);
      exportTask(device);
    };

    if (isWeb() && navigator.language !== 'da') Dialog.forceLoginWrapper(handleExport);
    else handleExport();
  }, [endPreviewMode, handleExportAlerts, checkModuleCalibration, exportTask]);
  useEffect(() => {
    shortcutHandler.current = handleExportClick;
  }, [handleExportClick]);

  return (
    <div
      className={classNames(styles.button, {
        [styles.disabled]: !hasDiscoverdMachine || mode !== CanvasMode.Draw,
      })}
      onClick={handleExportClick}
      title={lang.tutorial.newInterface.start_work}
    >
      {hasText && <span className={styles.text}>{lang.topbar.export}</span>}
      <TopBarIcons.Go />
    </div>
  );
};

export default GoButton;
