import classNames from 'classnames';
import React, { useContext } from 'react';
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import checkOldFirmware from 'helpers/device/checkOldFirmware';
import Constant from 'app/actions/beambox/constant';
import Dialog from 'app/actions/dialog-caller';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import getDevice from 'helpers/device/get-device';
import isDev from 'helpers/is-dev';
import storage from 'implementations/storage';
import SymbolMaker from 'helpers/symbol-maker';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import TutorialConstants from 'app/constants/tutorial-constants';
import useI18n from 'helpers/useI18n';
import VersionChecker from 'helpers/version-checker';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { executeFirmwareUpdate } from 'app/actions/beambox/menuDeviceActions';
import { getNextStepRequirement, handleNextStep } from 'app/views/tutorials/tutorialController';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';

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

const GoButton = (props: Props): JSX.Element => {
  const lang = useI18n();
  const { endPreviewMode, isPreviewing } = useContext(CanvasContext);

  const handleExportAlerts = async () => {
    const layers = $('#svgcontent > g.layer').toArray();

    const isPowerTooHigh = !Constant.adorModels.includes(BeamboxPreference.read('workarea')) && layers.some((layer) => {
      const strength = Number(layer.getAttribute('data-strength'));
      const diode = Number(layer.getAttribute('data-diode'));
      return strength > 70 && diode !== 1;
    });
    SymbolMaker.switchImageSymbolForAll(false);
    let isTooFastForPath = false;
    const tooFastLayers = [];
    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      if (parseFloat(layer.getAttribute('data-speed')) > 20 && layer.getAttribute('display') !== 'none') {
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

    if (isPowerTooHigh && !isDev()) {
      const confirmed = await Dialog.showConfirmPromptDialog({
        caption: lang.topbar.alerts.power_too_high,
        message: lang.topbar.alerts.power_too_high_msg,
        confirmValue: lang.topbar.alerts.power_too_high_confirm,
      });
      if (!confirmed) {
        return false;
      }
    }
    if (isTooFastForPath) {
      await new Promise((resolve) => {
        if (BeamboxPreference.read('vector_speed_contraint') === false) {
          if (!AlertConfig.read('skip_path_speed_warning')) {
            let message = lang.beambox.popup.too_fast_for_path;
            if (storage.get('default-units') === 'inches') {
              message = message.replace(/20mm\/s/g, '0.8in/s');
            }
            Alert.popUp({
              message,
              type: AlertConstants.SHOW_POPUP_WARNING,
              checkbox: {
                text: lang.beambox.popup.dont_show_again,
                callbacks: () => {
                  AlertConfig.write('skip_path_speed_warning', true);
                  resolve(null);
                },
              },
              callbacks: () => {
                resolve(null);
              },
            });
          } else {
            resolve(null);
          }
        } else if (!AlertConfig.read('skip_path_speed_constraint_warning')) {
          let message = sprintf(lang.beambox.popup.too_fast_for_path_and_constrain, tooFastLayers.join(', '));
          if (storage.get('default-units') === 'inches') {
            message = message.replace(/20mm\/s/g, '0.8in/s');
          }
          Alert.popUp({
            message,
            type: AlertConstants.SHOW_POPUP_WARNING,
            checkbox: {
              text: lang.beambox.popup.dont_show_again,
              callbacks: () => {
                AlertConfig.write('skip_path_speed_constraint_warning', true);
                resolve(null);
              },
            },
            callbacks: () => {
              resolve(null);
            },
          });
        } else {
          resolve(null);
        }
      });
    }
    return true;
  };

  const exportTask = async (device: IDeviceInfo) => {
    const showForceUpdateAlert = (id: string) => {
      Alert.popUp({
        id,
        message: lang.update.firmware.force_update_message,
        type: AlertConstants.SHOW_POPUP_ERROR,
        buttonType: AlertConstants.CUSTOM_CANCEL,
        buttonLabels: [lang.update.update],
        callbacks: () => {
          executeFirmwareUpdate(device, 'firmware');
        },
        onCancel: () => {},
      });
    }
    const { version, model } = device;
    if (version === '4.1.1' && model !== 'fhexa1') {
      showForceUpdateAlert('4.1.1-version-alert');
      return;
    }
    // Check 4.1.5 / 4.1.6 rotary
    if (
      BeamboxPreference.read('rotary_mode') &&
      ['4.1.5', '4.1.6'].includes(version) &&
      model !== 'fhex1'
    ) {
      showForceUpdateAlert('4.1.5,6-rotary-alert');
      return;
    }

    const vc = VersionChecker(version);
    if (!vc.meetRequirement('USABLE_VERSION')) {
      Alert.popUp({
        id: 'fatal-occurred',
        message: lang.beambox.popup.should_update_firmware_to_continue,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
      return;
    }
    const res = await checkOldFirmware(device.version);
    if (!res) return;
    const currentWorkarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
    const allowedWorkareas = Constant.allowedWorkarea[model];
    if (currentWorkarea && allowedWorkareas) {
      if (!allowedWorkareas.includes(currentWorkarea)) {
        Alert.popUp({
          id: 'workarea unavailable',
          message: lang.message.unavailableWorkarea,
          type: AlertConstants.SHOW_POPUP_ERROR,
        });
        return;
      }
    }
    ExportFuncs.uploadFcode(device);
  };

  const handleExportClick = async () => {
    const { hasDiscoverdMachine } = props;
    endPreviewMode();

    if (getNextStepRequirement() === TutorialConstants.SEND_FILE) {
      handleNextStep();
    }

    const handleExport = async () => {
      if (hasDiscoverdMachine) {
        // Only when there is usable machine
        const confirmed = await handleExportAlerts();
        if (!confirmed) {
          return;
        }
      }
      const { device } = await getDevice();
      if (!device) return;
      const deviceStatus = await checkDeviceStatus(device);
      if (!deviceStatus) return;
      exportTask(device);
    };

    if (window.FLUX.version === 'web' && navigator.language !== 'da') Dialog.forceLoginWrapper(handleExport);
    else handleExport();
  };

  const { hasDiscoverdMachine, hasText } = props;
  return (
    <div
      className={classNames(styles.button, {
        [styles.disabled]: !hasDiscoverdMachine || isPreviewing,
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
