import React, { useCallback } from 'react';
import { Button, Modal } from 'antd';

import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';

const PROGRESS_ID = 'fish-eye-calibration';

interface Props {
  onClose: (complete: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

const Cut = ({ onClose, onBack, onNext }: Props): JSX.Element => {
  const lang = useI18n();
  const handleNext = useCallback(async () => {
    progressCaller.openNonstopProgress({ id: PROGRESS_ID, message: 'Uploading Calibration Task' });
    try {
      await deviceMaster.doAdorCalibrationCut();
      onNext();
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
  }, [onNext]);
  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title={'tCut Calibration File'}
      footer={[
        <Button onClick={onBack} key="back">
          {lang.buttons.back}
        </Button>,
        <Button type="primary" onClick={handleNext} key="next">
          {lang.buttons.next}
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <div>
        Please put the material in the center of the workarea
      </div>
    </Modal>
  );
};

export default Cut;
