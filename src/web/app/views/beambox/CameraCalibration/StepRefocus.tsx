import * as React from 'react';
import {
  useState, useRef, useEffect, useContext,
} from 'react';
import { Modal, Segmented } from 'antd';
import i18n from 'helpers/i18n';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import Constant from 'app/actions/beambox/constant';
import Progress from 'app/actions/progress-caller';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DeviceErrorHandler from 'helpers/device-error-handler';
import DeviceMaster from 'helpers/device-master';
import Browser from 'implementations/browser';
import CheckDeviceStatus from 'helpers/check-device-status';
import { doGetOffsetFromPicture } from 'helpers/camera-calibration-helper';
import { CameraConfig, STEP_BEFORE_ANALYZE_PICTURE } from 'app/constants/camera-calibration-constants';
import VersionChecker from 'helpers/version-checker';
import { CalibrationContext } from 'app/contexts/CalibrationContext';
import DeviceConstants from 'app/constants/device-constants';

const LANG = i18n.lang.camera_calibration;
const LANG_ALERT = i18n.lang.alert;

const StepRefocus = (): JSX.Element => {
  const context = useContext(CalibrationContext);
  const {
    device,
    gotoNextStep,
    onClose,
    setOriginFanSpeed,
  } = context;
  const doCuttingTask = async () => {
    const res = await DeviceMaster.select(context.device);
    if (!res.success) {
      throw new Error('Fail to select device');
    }
    const laserPower = Number((await DeviceMaster.getLaserPower()).value);
    const fanSpeed = Number((await DeviceMaster.getFan()).value);
    setOriginFanSpeed(fanSpeed);
    const tempCmdAvailable = VersionChecker(context.device.version).meetRequirement('TEMP_I2C_CMD');
    if (tempCmdAvailable) {
      await DeviceMaster.setFanTemp(100);
    } else if (fanSpeed > 100) {
      await DeviceMaster.setFan(100);
    }
    if (laserPower !== 1) {
      await DeviceMaster.setLaserPower(1);
    }
    await DeviceMaster.runBeamboxCameraTest();
    if (laserPower !== 1) {
      await DeviceMaster.setLaserPower(Number(laserPower));
    }
    if (!tempCmdAvailable) {
      await DeviceMaster.setFan(fanSpeed);
    }
  };
  const doCaptureTask = async () => {
    let blobUrl;
    try {
      await PreviewModeController.start(context.device, () => console.log('camera fail. stop preview mode'));
      context.setLastConfig(PreviewModeController.getCameraOffsetStandard());
      Progress.openNonstopProgress({
        id: 'taking-picture',
        message: LANG.taking_picture,
        timeout: 30000,
      });
      const movementX = Constant.camera.calibrationPicture.centerX - Constant.camera.offsetX_ideal;
      const movementY = Constant.camera.calibrationPicture.centerY - Constant.camera.offsetY_ideal;
      blobUrl = await PreviewModeController.takePictureAfterMoveTo(movementX, movementY);
      context.setCameraPosition({ x: movementX, y: movementY });
    } finally {
      Progress.popById('taking-picture');
    }
    return blobUrl;
  };
  const cutThenCapture = async () => {
    await doCuttingTask();
    const blobUrl = await doCaptureTask();
    await doGetOffsetFromPicture(
      blobUrl,
      (offset: CameraConfig) => {
        context.setCurrentOffset(offset);
      },
    );
    context.setImgBlobUrl(blobUrl);
  };

  const [isAutoFocus, setIsAutoFocus] = useState(false);
  const [isCutButtonDisabled, setIsCutButtonDisabled] = useState(false);
  const videoElem = useRef(null);
  useEffect(() => {
    if (videoElem.current) videoElem.current.load();
  }, [isAutoFocus]);

  let child = null;
  let message: string;
  if (device.model === DeviceConstants.Model.Beamo) {
    child = (
      <div className="video-container">
        <div className="tab-container">
          <Segmented
            block
            options={[LANG.without_af, LANG.with_af]}
            onChange={(v) => setIsAutoFocus(v === LANG.with_af)}
            onResize={() => {}}
            onResizeCapture={() => {}}
          />
        </div>
        <video className="video" ref={videoElem} autoPlay loop muted>
          <source src={isAutoFocus ? 'video/autofocus.webm' : 'video/bm_focus.webm'} type="video/webm" />
          <source src={isAutoFocus ? 'video/autofocus.mp4' : 'video/bm_focus.mp4'} type="video/mp4" />
        </video>
      </div>
    );
    message = isAutoFocus ? LANG.please_refocus.beamo_af : LANG.please_refocus.beamo;
  } else if (device.model === DeviceConstants.Model.HEXA) {
    message = LANG.please_refocus.hexa;
    child = (
      <video className="video" ref={videoElem} autoPlay loop>
        <source src="video/bb2_focus.webm" type="video/webm" />
        <source src="video/bb2_focus.mp4" type="video/mp4" />
      </video>
    );
  } else {
    message = LANG.please_refocus.beambox;
    child = (
      <video className="video" ref={videoElem} autoPlay loop muted>
        <source src="video/bb_focus.webm" type="video/webm" />
        <source src="video/bb_focus.mp4" type="video/mp4" />
      </video>
    );
  }

  const onEngrave = async () => {
    if (isCutButtonDisabled) {
      return;
    }
    try {
      setIsCutButtonDisabled(true);
      await cutThenCapture();
      if (!context.calibratedMachines.includes(device.uuid)) {
        context.setCalibratedMachines(
          [...context.calibratedMachines, device.uuid],
        );
      }
      gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
    } catch (error) {
      setIsCutButtonDisabled(false);
      console.log(error);
      const errorMessage = error instanceof Error
        ? error.message : DeviceErrorHandler.translate(error);
      Alert.popUp({
        id: 'camera-cali-err',
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: `#815 ${errorMessage || 'Fail to cut and capture'}`,
        buttonLabels: [LANG_ALERT.ok, LANG_ALERT.learn_more],
        callbacks: [
          async () => {
            const report = await DeviceMaster.getReport();
            device.st_id = report.st_id;
            await CheckDeviceStatus(device, false, true);
          },
          () => Browser.open(LANG.zendesk_link),
        ],
        primaryButtonIndex: 0,
      });
    }
  };

  return (
    <Modal
      width={400}
      open
      centered
      className="modal-camera-calibration"
      title={LANG.camera_calibration}
      onCancel={() => onClose(false)}
      cancelText={LANG.cancel}
      okText={LANG.start_engrave}
      onOk={onEngrave}
      okButtonProps={{ disabled: isCutButtonDisabled }}
    >
      {message}
      <br />
      {child}
    </Modal>
  );
};

export default StepRefocus;
