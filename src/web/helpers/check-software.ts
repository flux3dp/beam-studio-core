import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import i18n from 'helpers/i18n';
import { IDeviceInfo } from 'interfaces/IDevice';
import { sprintf } from 'sprintf-js';

import versionCompare from './version-compare';

const modelsWithModules = ['fad1', 'ado1'];

export default function checkSoftwareForAdor(device: IDeviceInfo, show_alert = true): boolean {
  const { version } = window.FLUX;
  const { model } = device;
  if (version !== 'web' && versionCompare(version, '2.2') && modelsWithModules.includes(model)) {
    if (show_alert) {
      alertCaller.popUp({
        message: sprintf(i18n.lang.update.software.update_for_ador, version),
        buttonType: alertConstants.SHOW_POPUP_INFO,
      });
    }
    return false;
  }
  return true;
}
