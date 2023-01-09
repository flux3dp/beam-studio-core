import * as React from 'react';
import { Modal } from 'antd';
import i18n from 'helpers/i18n';
import { CalibrationContext } from 'app/contexts/CalibrationContext';
import { useContext } from 'react';
import { STEP_REFOCUS } from 'app/constants/camera-calibration-constants';

const LANG = i18n.lang.camera_calibration;

const StepPutPaper = (): JSX.Element => {
  const { gotoNextStep, onClose } = useContext(CalibrationContext);

  const video = (
    <video className="video" autoPlay loop muted>
      <source src="video/put_paper.webm" type="video/webm" />
      <source src="video/put_paper.mp4" type="video/mp4" />
    </video>
  );

  return (
    <Modal
      width={400}
      open
      centered
      className="modal-camera-calibration"
      title={LANG.camera_calibration}
      onCancel={() => onClose(false)}
      okText={LANG.next}
      cancelText={LANG.cancel}
      onOk={() => gotoNextStep(STEP_REFOCUS)}
    >
      {LANG.please_place_paper}
      {video}
    </Modal>
  );
};

export default StepPutPaper;
