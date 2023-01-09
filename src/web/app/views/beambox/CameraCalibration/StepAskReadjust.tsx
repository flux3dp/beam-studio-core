/* eslint-disable no-console */
import * as React from 'react';
import { Button, Modal } from 'antd';
import i18n from 'helpers/i18n';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import Progress from 'app/actions/progress-caller';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import DeviceErrorHandler from 'helpers/device-error-handler';
import DeviceMaster from 'helpers/device-master';
import Browser from 'implementations/browser';
import CheckDeviceStatus from 'helpers/check-device-status';
import { doGetOffsetFromPicture } from 'helpers/camera-calibration-helper';
import { CALIBRATION_PARAMS, STEP_BEFORE_ANALYZE_PICTURE, STEP_PUT_PAPER } from 'app/constants/camera-calibration-constants';
import { CalibrationContext } from 'app/contexts/CalibrationContext';
import { useContext } from 'react';

const LANG = i18n.lang.camera_calibration;
const LANG_ALERT = i18n.lang.alert;

const StepAskReadjust = (): JSX.Element => {
  const context = useContext(CalibrationContext);
  const {
    device,
    setLastConfig,
    setImgBlobUrl,
    gotoNextStep,
    setCurrentOffset,
    setCameraPosition,
    onClose,
  } = context;

  const onSkip = async () => {
    try {
      await PreviewModeController.start(device, () => console.log('camera fail. stop preview mode'));
      setLastConfig(PreviewModeController.getCameraOffsetStandard());
      Progress.openNonstopProgress({
        id: 'taking-picture',
        message: LANG.taking_picture,
        timeout: 30000,
      });
      const x = CALIBRATION_PARAMS.centerX - CALIBRATION_PARAMS.idealOffsetX;
      const y = CALIBRATION_PARAMS.centerY - CALIBRATION_PARAMS.idealOffsetY;
      const blobUrl = await PreviewModeController.takePictureAfterMoveTo(x, y);
      setCameraPosition({ x, y });
      await doGetOffsetFromPicture(blobUrl, setCurrentOffset);
      setImgBlobUrl(blobUrl);
      gotoNextStep(STEP_BEFORE_ANALYZE_PICTURE);
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error
        ? error.message : DeviceErrorHandler.translate(error);
      Alert.popUp({
        id: 'camera-cali-err',
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: `#815 ${errorMessage || 'Fail to capture'}`,
        buttonLabels: [LANG_ALERT.ok, LANG_ALERT.learn_more],
        callbacks: [
          async () => {
            const report = await DeviceMaster.getReport();
            await CheckDeviceStatus({
              ...device,
              st_id: report.st_id,
            }, false, true);
          },
          () => Browser.open(LANG.zendesk_link),
        ],
        primaryButtonIndex: 0,
      });
    } finally {
      Progress.popById('taking-picture');
    }
  };
  return (
    <Modal
      width={400}
      open
      centered
      title={LANG.camera_calibration}
      onCancel={() => onClose(false)}
      className="modal-camera-calibration"
      footer={[
        <Button onClick={() => onClose(false)}>
          {LANG.cancel}
        </Button>,
        <Button onClick={onSkip}>
          {LANG.skip}
        </Button>,
        <Button type="primary" onClick={() => gotoNextStep(STEP_PUT_PAPER)}>
          {LANG.do_engraving}
        </Button>,
      ]}
    >
      {LANG.ask_for_readjust}
    </Modal>
  );
};

export default StepAskReadjust;
