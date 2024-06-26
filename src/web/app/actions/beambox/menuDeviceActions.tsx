import React from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import CalibrationType from 'app/components/dialogs/camera/AdorCalibration/calibrationTypes';
import checkDeviceStatus from 'helpers/check-device-status';
import checkFirmware from 'helpers/check-firmware';
import constant from 'app/actions/beambox/constant';
import DeviceMaster from 'helpers/device-master';
import Dialog from 'app/actions/dialog-caller';
import dialog from 'implementations/dialog';
import firmwareUpdater from 'helpers/firmware-updater';
import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import MonitorController from 'app/actions/monitor-controller';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import ProgressCaller from 'app/actions/progress-caller';
import VersionChecker from 'helpers/version-checker';
import { downloadCameraData, uploadCameraData } from 'helpers/device/camera-data-backup';
import { IDeviceInfo } from 'interfaces/IDevice';
import { InkDetectionStatus } from 'app/constants/layer-module/ink-cartridge';
import { Mode } from 'app/constants/monitor-constants';
import { parsingChipData } from 'app/components/dialogs/CartridgeSettingPanel';
import { showAdorCalibration } from 'app/components/dialogs/camera/AdorCalibration';
import { showAdorCalibrationV2 } from 'app/components/dialogs/camera/AdorCalibrationV2';
import { showCameraCalibration } from 'app/views/beambox/Camera-Calibration';
import { showDiodeCalibration } from 'app/views/beambox/Diode-Calibration';

const { lang } = i18n;

const calibrateCamera = async (
  device: IDeviceInfo,
  args: { isBorderless?: boolean; factoryMode?: boolean } = {}
) => {
  const { isBorderless = false, factoryMode = false } = args;
  try {
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) {
      return;
    }
    const res = await DeviceMaster.select(device);
    if (res.success) {
      if (constant.adorModels.includes(device.model)) {
        showAdorCalibrationV2(factoryMode);
      } else showCameraCalibration(device, isBorderless);
    }
  } catch (error) {
    console.error(error);
  }
};

const calibrateModule = async (device: IDeviceInfo, type: CalibrationType) => {
  try {
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) {
      return;
    }
    const res = await DeviceMaster.select(device);
    if (res.success) {
      showAdorCalibration(type);
    }
  } catch (error) {
    console.error(error);
  }
};

export const executeFirmwareUpdate = async (device: IDeviceInfo, type: string): Promise<void> => {
  const updateFirmware = async () => {
    try {
      const response = await checkFirmware(device);
      const latestVersion = device.version;
      const { caption, message } = lang.update.firmware.latest_firmware;

      MessageCaller.openMessage({
        key: 'checking-firmware',
        content: i18n.lang.update.software.checking,
        level: MessageLevel.SUCCESS,
        duration: 1,
      });
      if (!response.needUpdate) {
        Alert.popUp({
          id: 'latest-firmware',
          message: `${message} (v${latestVersion})`,
          caption,
          buttonType: AlertConstants.CUSTOM_CANCEL,
          buttonLabels: [lang.update.firmware.latest_firmware.still_update],
          callbacks: () => {
            firmwareUpdater(response, device, true);
          },
          onCancel: () => {},
        });
      } else {
        firmwareUpdater(response, device);
      }
    } catch (error) {
      Alert.popUp({
        id: 'cant-get-latest-firmware',
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: lang.update.firmware.latest_firmware.cant_get_latest,
      });
    }
  };
  const checkStatus = () => {
    ProgressCaller.openNonstopProgress({ id: 'check-status', caption: lang.update.preparing });
    if (type === 'toolhead') {
      DeviceMaster.enterMaintainMode().then(() => {
        setTimeout(() => {
          ProgressCaller.popById('check-status');
          updateFirmware();
        }, 3000);
      });
    } else {
      ProgressCaller.popById('check-status');
      MessageCaller.openMessage({
        key: 'checking-firmware',
        level: MessageLevel.LOADING,
        content: i18n.lang.update.software.checking,
        duration: 10,
      });
      updateFirmware();
    }
  };
  // TODO: Handle the error better (output eresp)
  const vc = VersionChecker(device.version);
  if (!vc.meetRequirement('UPDATE_BY_SOFTWARE')) {
    Alert.popUp({
      id: 'update-firmware',
      type: AlertConstants.SHOW_INFO,
      message: lang.update.firmware.firmware_too_old_update_by_sdcard,
    });
    return;
  }
  try {
    const res = await DeviceMaster.select(device);
    if (res.success) {
      checkStatus();
    }
  } catch (resp) {
    console.error(resp);
    Alert.popUp({
      id: 'exec-fw-update',
      type: AlertConstants.SHOW_POPUP_ERROR,
      message: resp,
    });
  }
};

const getLog = async (device: IDeviceInfo, log: string) => {
  try {
    const res = await DeviceMaster.select(device);
    if (res.success) {
      ProgressCaller.openSteppingProgress({ id: 'get_log', message: 'downloading' });
      try {
        const file = await DeviceMaster.downloadLog(
          log,
          async (progress: { completed: number; size: number }) => {
            ProgressCaller.update('get_log', {
              message: 'downloading',
              percentage: (progress.completed / progress.size) * 100,
            });
          }
        );
        ProgressCaller.popById('get_log');
        const getContent = async () => file[1] as Blob;
        await dialog.writeFileDialog(getContent, log, log, [
          {
            name: window.os === 'MacOS' ? 'log (*.log)' : 'log',
            extensions: ['log'],
          },
        ]);
      } catch (errorData) {
        ProgressCaller.popById('get_log');
        const msg =
          errorData === 'canceled'
            ? lang.topmenu.device.download_log_canceled
            : lang.topmenu.device.download_log_error;
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_INFO,
          message: msg,
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const BackupCalibrationData = async (device: IDeviceInfo, type: 'download' | 'upload') => {
  const vc = VersionChecker(device.version);
  if (!vc.meetRequirement('ADOR_STATIC_FILE_ENTRY')) {
    Alert.popUpError({
      message: 'tPlease update firmware.',
    });
    return;
  }
  try {
    const res = await DeviceMaster.select(device);
    if (res.success) {
      if (type === 'download') downloadCameraData(device.name);
      else uploadCameraData();
    }
  } catch (e) {
    console.error(e);
  }
}

export default {
  DASHBOARD: async (device: IDeviceInfo): Promise<void> => {
    Dialog.popDialogById('monitor');
    const res = await DeviceMaster.select(device);
    if (res.success) {
      MonitorController.showMonitor(device, device.st_id <= 0 ? Mode.FILE : Mode.WORKING);
    }
  },
  MACHINE_INFO: async (device: IDeviceInfo): Promise<void> => {
    const isAdor = constant.adorModels.includes(device.model);
    let subModuleInfo = null;
    if (isAdor) {
      try {
        await DeviceMaster.select(device);
        const deviceDetailInfo = await DeviceMaster.getDeviceDetailInfo();
        const headType = parseInt(deviceDetailInfo.head_type, 10);
        const headSubmoduleInfo = JSON.parse(deviceDetailInfo.head_submodule_info);
        console.log(headSubmoduleInfo);
        const moduleName =
          {
            0: lang.layer_module.none,
            [LayerModule.LASER_10W_DIODE]: lang.layer_module.laser_10w_diode,
            [LayerModule.LASER_20W_DIODE]: lang.layer_module.laser_20w_diode,
            [LayerModule.LASER_1064]: lang.layer_module.laser_2w_infrared,
            [LayerModule.PRINTER]: lang.layer_module.printing,
            [LayerModule.UNKNOWN]: lang.layer_module.unknown,
          }[headType] || lang.layer_module.unknown;
        const {
          state,
          serial_number: serialNumber,
          color,
          type,
          ink_level: inkLevel,
        } = headSubmoduleInfo;
        subModuleInfo = (
          <div>
            <br />
            <div>
              {lang.device.submodule_type}: {moduleName}
            </div>
            <br />
            {headType === LayerModule.PRINTER && (
              <>
                {state === InkDetectionStatus.PENDING && (
                  <div>{lang.device.close_door_to_read_cartridge_info}</div>
                )}
                {state === InkDetectionStatus.FAILED && (
                  <div>{lang.device.cartridge_info_read_failed}</div>
                )}
                {state === InkDetectionStatus.VALIDATE_FAILED && (
                  <div>{lang.device.cartridge_info_verification_failed}</div>
                )}
                {[InkDetectionStatus.SUCCESS, InkDetectionStatus.UNUSED].includes(state) && (
                  <>
                    <div>
                      {lang.device.cartridge_serial_number}: {serialNumber ?? '-'}
                    </div>
                    <div>
                      {lang.device.ink_color}: {color}
                    </div>
                    <div>
                      {lang.device.ink_type}: {type}
                    </div>
                    <div>
                      {lang.device.ink_level}:{' '}
                      {Math.round((InkDetectionStatus.UNUSED ? 1 : inkLevel) * 100)}%
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      } catch (error) {
        console.log(error);
      }
    }
    const info = (
      <div>
        <div>
          {lang.device.model_name}: {device.model.toUpperCase()}
        </div>
        <div>
          {lang.device.IP}: {device.ipaddr}
        </div>
        <div>
          {lang.device.serial_number}: {device.serial}
        </div>
        <div>
          {lang.device.firmware_version}: {device.version}
        </div>
        <div>
          {lang.device.UUID}: {device.uuid}
        </div>
        {subModuleInfo}
      </div>
    );
    Alert.popUp({
      id: 'machine-info',
      type: AlertConstants.SHOW_POPUP_INFO,
      caption: device.name,
      message: info,
      buttonLabels: [lang.topmenu.device.network_test, lang.topmenu.ok],
      callbacks: [() => Dialog.showNetworkTestingPanel(device.ipaddr), () => {}],
      primaryButtonIndex: 1,
    });
  },
  CALIBRATE_BEAMBOX_CAMERA: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    calibrateCamera(device);
  },
  CALIBRATE_CAMERA_V2_FACTORY: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    calibrateCamera(device, { factoryMode: true });
  },
  CALIBRATE_PRINTER_MODULE: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    calibrateModule(device, CalibrationType.PRINTER_HEAD);
  },
  CALIBRATE_IR_MODULE: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    calibrateModule(device, CalibrationType.IR_LASER);
  },
  CALIBRATE_BEAMBOX_CAMERA_BORDERLESS: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    const vc = VersionChecker(device.version);
    const isAvailableVersion = vc.meetRequirement('BORDERLESS_MODE');
    if (isAvailableVersion) {
      calibrateCamera(device, { isBorderless: true });
    } else {
      const langCameraCali = lang.calibration;
      const message = `${langCameraCali.update_firmware_msg1} 2.5.1 ${langCameraCali.update_firmware_msg2}`;
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message,
      });
    }
  },
  CALIBRATE_DIODE_MODULE: async (device: IDeviceInfo): Promise<void> => {
    if (window.location.hash !== '#/studio/beambox') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: lang.calibration.please_goto_beambox_first,
      });
      return;
    }
    const vc = VersionChecker(device.version);
    const diodeAvailable = vc.meetRequirement('DIODE_AND_AUTOFOCUS');
    if (diodeAvailable) {
      try {
        const res = await DeviceMaster.select(device);
        if (res.success) {
          showDiodeCalibration(device);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      const langDiodeCali = lang.calibration;
      const message = `${langDiodeCali.update_firmware_msg1} 3.0.0 ${langDiodeCali.update_firmware_msg2}`;
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message,
      });
    }
  },
  CATRIDGE_CHIP_SETTING: async (device: IDeviceInfo): Promise<void> => {
    const res = await DeviceMaster.select(device);
    if (!res.success) return;
    ProgressCaller.openNonstopProgress({
      id: 'fetch-cartridge-data',
      message: 'Fetching Cartridge Data',
    });
    let inkLevel = 1;
    try {
      const deviceDetailInfo = await DeviceMaster.getDeviceDetailInfo();
      const headSubmoduleInfo = JSON.parse(deviceDetailInfo.head_submodule_info);
      inkLevel = headSubmoduleInfo.ink_level;
    } catch {
      /* do nothing */
    }
    try {
      await DeviceMaster.enterCartridgeIOMode();
      const chipDataRes = await DeviceMaster.getCartridgeChipData();
      if (chipDataRes.status === 'ok') {
        const parsed = parsingChipData(chipDataRes.data.result);
        Dialog.showCatridgeSettingPanel(parsed, inkLevel);
      } else {
        Alert.popUp({
          id: 'cant-get-chip-data',
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: `Failed to get chip data: ${JSON.stringify(chipDataRes)}`,
        });
      }
    } catch (error) {
      await DeviceMaster.endCartridgeIOMode();
    } finally {
      ProgressCaller.popById('fetch-cartridge-data');
    }
  },
  DOWNLOAD_CALIBRATION_DATA: async (device: IDeviceInfo): Promise<void> => {
    BackupCalibrationData(device, 'download');
  },
  UPLOAD_CALIBRATION_DATA: async (device: IDeviceInfo): Promise<void> => {
    BackupCalibrationData(device, 'upload');
  },
  UPDATE_FIRMWARE: async (device: IDeviceInfo): Promise<void> => {
    const deviceStatus = await checkDeviceStatus(device);
    if (deviceStatus) {
      executeFirmwareUpdate(device, 'firmware');
    }
  },
  LOG_NETWORK: (device: IDeviceInfo): void => {
    getLog(device, 'fluxnetworkd.log');
  },

  LOG_HARDWARE: (device: IDeviceInfo): void => {
    getLog(device, 'fluxhald.log');
  },

  LOG_DISCOVER: (device: IDeviceInfo): void => {
    getLog(device, 'fluxupnpd.log');
  },

  LOG_USB: (device: IDeviceInfo): void => {
    getLog(device, 'fluxusbd.log');
  },
  LOG_USBLIST: async (device: IDeviceInfo): Promise<void> => {
    const res = await DeviceMaster.select(device);
    if (res.success) {
      const data = await DeviceMaster.lsusb();
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_INFO,
        message: data.usbs.join('\n'),
        caption: lang.topmenu.device.log.usblist,
      });
    }
  },
  LOG_CAMERA: (device: IDeviceInfo): void => {
    getLog(device, 'fluxcamerad.log');
  },
  LOG_CLOUD: (device: IDeviceInfo): void => {
    getLog(device, 'fluxcloudd.log');
  },
  LOG_PLAYER: (device: IDeviceInfo): void => {
    const vc = VersionChecker(device.version);
    if (vc.meetRequirement('NEW_PLAYER')) {
      getLog(device, 'playerd.log');
    } else {
      getLog(device, 'fluxplayerd.log');
    }
  },
  LOG_ROBOT: (device: IDeviceInfo): void => {
    getLog(device, 'fluxrobotd.log');
  },
};
