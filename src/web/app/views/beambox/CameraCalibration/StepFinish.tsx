import * as React from 'react';
import { Modal, Result } from 'antd';
import i18n from 'helpers/i18n';
import { getSVGCanvas } from 'helpers/svg-editor-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import { CalibrationContext } from 'app/contexts/CalibrationContext';
import { useContext } from 'react';

const LANG = i18n.lang.camera_calibration;

const StepFinish = (): JSX.Element => {
  const { borderless, onClose } = useContext(CalibrationContext);
  return (
    <Modal
      width={400}
      open
      centered
      title={LANG.camera_calibration}
      cancelButtonProps={{ style: { display: 'none' } }}
      onOk={() => {
        BeamboxPreference.write('should_remind_calibrate_camera', false);
        getSVGCanvas().toggleBorderless(borderless);
        onClose(true);
      }}
      className="modal-camera-calibration"
      okText={LANG.finish}
    >
      <Result
        status="success"
        title={LANG.calibrate_done}
      />
    </Modal>
  );
};

export default StepFinish;
