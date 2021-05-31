/**
 * firmware updater
 */
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import alertStore from 'app/stores/alert-store';
import DeviceMaster from 'helpers/device-master';
import Dialog from 'app/actions/dialog-caller';
import i18n from 'helpers/i18n';
import InputLightboxConstants from 'app/constants/input-lightbox-constants';
import Progress from 'app/actions/progress-caller';

export default function(response, printer, forceUpdate?: boolean) {
    var lang = i18n.lang,
        doUpdate,
        onDownload,
        onInstall,
        onSubmit,
        _uploadToDevice,
        _onFinishUpdate;

    doUpdate = DeviceMaster.updateFirmware;

    _uploadToDevice = async (file) => {
        const res = await DeviceMaster.select(printer);
        if (res.success) {
            Progress.openSteppingProgress({id: 'update-firmware', message: lang.update.updating + ' (0%)'});
            try {
                await doUpdate(file, (r) => {
                    r.percentage = Number(r.percentage || 0).toFixed(2);
                    Progress.update('update-firmware', {
                        message: lang.update.updating + ' (' + r.percentage + '%)',
                        percentage: r.percentage
                    });
                });
                _onFinishUpdate.bind(null, true);
            } catch (error) {
                _onFinishUpdate.bind(null, false);
            }
            Progress.popById('update-firmware');
        }
    }

    _onFinishUpdate = (isSuccess) => {
        console.log('finished update', isSuccess, 'firmware');
        if (true === isSuccess) {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_INFO,
                message: lang.update.firmware.update_success
            });
        }
        else {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: lang.update.firmware.update_fail
            });
        }
    };

    onDownload = () => {
        let req = new XMLHttpRequest();

        // get firmware from flux3dp website.
        req.open("GET", response.downloadUrl, true);
        req.responseType = "blob";

        req.onload = function (event) {
            if (this.status == 200) {
                let file = req.response;
                _uploadToDevice(file);
            } else {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: lang.update.cannot_reach_internet
            });
            }
        };
        req.send();

    };

    onInstall = () => {
        Dialog.showInputLightbox('upload-firmware', {
            type: InputLightboxConstants.TYPE_FILE,
            caption: lang.update.firmware.upload_file,
            confirmText: lang.update.firmware.confirm,
            onSubmit: onSubmit,
            onCancel: function() {
            },
        });
    };

    onSubmit = async function(files, e) {
        let file = files.item(0),
            onFinishUpdate;
        const res = await DeviceMaster.select(printer);
        if (res.success) {
            Progress.openSteppingProgress({id: 'update-firmware', message: lang.update.updating + ' (0%)'});
            try {
                await doUpdate(file, (r) => {
                    r.percentage = Number(r.percentage || 0).toFixed(2);
                    Progress.update('update-firmware', {
                        message: lang.update.updating + ' (' + r.percentage + '%)',
                        percentage: r.percentage
                    });
                });
                _onFinishUpdate.bind(null, true);
            } catch (error) {
                _onFinishUpdate.bind(null, false);
            }
            Progress.popById('update-firmware');
        }
    };

    const quitTask = async () => {
        console.log('quitting task');
        try {
            const r = await DeviceMaster.quitTask();
            console.log('task quitted?', r);
            if (r.error) {
                setTimeout(() => {
                    quitTask();
                }, 2000);
            }
        } catch (e) {
            console.log('error from quit task', e);
            setTimeout(() => {
                quitTask();
            }, 2000);
        }
    };

    if (forceUpdate) {
        onInstall();
    } else {
        alertStore.emitUpdate({
          device: printer,
          updateInfo: response || {},
          onDownload,
          onInstall,
        });
    }
}
