import classNames from 'classnames';
import React from 'react';
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import Dialog from 'app/actions/dialog-caller';
import ExportFuncs from 'app/actions/beambox/export-funcs';
import i18n from 'helpers/i18n';
import storage from 'implementations/storage';
import SymbolMaker from 'helpers/symbol-maker';
import TutorialConstants from 'app/constants/tutorial-constants';
import VersionChecker from 'helpers/version-checker';
import { getNextStepRequirement, handleNextStep } from 'app/views/tutorials/tutorialController';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { $ } = window;
const { lang } = i18n;
const LANG = lang.topbar;

interface Props {
  hasText: boolean;
  hasDiscoverdMachine: boolean;
  hasDevice: boolean;
  endPreviewMode: () => void;
  showDeviceList: (type: string, selectDeviceCallback: (device: IDeviceInfo) => void) => void;
}

class GoButton extends React.Component<Props> {
  private handleExportClick = async () => {
    const { hasDevice, endPreviewMode, showDeviceList } = this.props;
    endPreviewMode();

    if (getNextStepRequirement() === TutorialConstants.SEND_FILE) {
      handleNextStep();
    }

    const handleExport = async () => {
      if (hasDevice) { // Only when there is usable machine
        const confirmed = await this.handleExportAlerts();
        if (!confirmed) {
          return;
        }
      }

      showDeviceList('export', (device) => this.exportTask(device));
    };

    if (window.FLUX.version === 'web') Dialog.forceLoginWrapper(handleExport);
    else handleExport();
  };

  private handleExportAlerts = async () => {
    const layers = $('#svgcontent > g.layer').toArray();

    const isPowerTooHigh = layers.some((layer) => {
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

    if (isPowerTooHigh) {
      const confirmed = await Dialog.showConfirmPromptDialog({
        caption: LANG.alerts.power_too_high,
        message: LANG.alerts.power_too_high_msg,
        confirmValue: LANG.alerts.power_too_high_confirm,
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

  private exportTask = (device) => {
    const currentWorkarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
    const allowedWorkareas = Constant.allowedWorkarea[device.model];
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
    if (device === 'export_fcode') {
      ExportFuncs.exportFcode();
      return;
    }
    const vc = VersionChecker(device.version);
    if (!vc.meetRequirement('USABLE_VERSION')) {
      Alert.popUp({
        id: 'fatal-occurred',
        message: lang.beambox.popup.should_update_firmware_to_continue,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
      return;
    }
    ExportFuncs.uploadFcode(device);
  };

  render(): JSX.Element {
    const { hasDiscoverdMachine, hasText } = this.props;
    return (
      <div className={classNames('go-button-container', { 'no-machine': !hasDiscoverdMachine })} onClick={this.handleExportClick}>
        {hasText ? <div className="go-text">{LANG.export}</div> : null}
        <div className={(classNames('go-btn'))} />
      </div>
    );
  }
}

export default GoButton;
