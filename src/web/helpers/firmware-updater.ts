/**
 * firmware updater
 */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DeviceMaster from 'helpers/device-master';
import Dialog from 'app/actions/dialog-caller';
import i18n from 'helpers/i18n';
import InputLightboxConstants from 'app/constants/input-lightbox-constants';
import Progress from 'app/actions/progress-caller';
import { IDeviceInfo } from 'interfaces/IDevice';

export default (response, device: IDeviceInfo, forceUpdate?: boolean): void => {
  const { lang } = i18n;
  let onSubmit;
  let onFinishUpdate;

  const doUpdate = DeviceMaster.updateFirmware;

  const uploadToDevice = async (file) => {
    const res = await DeviceMaster.select(device);
    if (res.success) {
      Progress.openSteppingProgress({ id: 'update-firmware', message: `${lang.update.updating} (0%)` });
      try {
        await doUpdate(file, (r) => {
          const percentage = Number(r.percentage || 0).toFixed(2);
          Progress.update('update-firmware', {
            message: `${lang.update.updating} (${percentage}%)`,
            percentage,
          });
        });
        onFinishUpdate.bind(null, true);
      } catch (error) {
        onFinishUpdate.bind(null, false);
      }
      Progress.popById('update-firmware');
    }
  };

  onFinishUpdate = (isSuccess: boolean) => {
    console.log('finished update', isSuccess, 'firmware');
    if (isSuccess === true) {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.update.firmware.update_success,
      });
    } else {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: lang.update.firmware.update_fail,
      });
    }
  };

  const onDownload = () => {
    const req = new XMLHttpRequest();

    // get firmware from flux3dp website.
    req.open('GET', response.downloadUrl, true);
    req.responseType = 'blob';

    req.onload = function onload() {
      if (this.status === 200) {
        const file = req.response;
        uploadToDevice(file);
      } else {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: lang.update.cannot_reach_internet,
        });
      }
    };
    req.send();
  };

  const onInstall = () => {
    Dialog.showInputLightbox('upload-firmware', {
      type: InputLightboxConstants.TYPE_FILE,
      caption: lang.update.firmware.upload_file,
      confirmText: lang.update.firmware.confirm,
      onSubmit,
      onCancel: () => { },
    });
  };

  onSubmit = async (files) => {
    const file = files.item(0);
    const res = await DeviceMaster.select(device);
    if (res.success) {
      Progress.openSteppingProgress({ id: 'update-firmware', message: `${lang.update.updating} (0%)` });
      try {
        await doUpdate(file, (r) => {
          const percentage = Number(r.percentage || 0).toFixed(2);
          Progress.update('update-firmware', {
            message: `${lang.update.updating} (${percentage}%)`,
            percentage,
          });
        });
        onFinishUpdate.bind(null, true);
      } catch (error) {
        onFinishUpdate.bind(null, false);
      }
      Progress.popById('update-firmware');
    }
  };

  if (forceUpdate) {
    onInstall();
  } else {
    Dialog.showUpdateDialog(device, response || {}, onDownload, onInstall);
  }
};
