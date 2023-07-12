import React from 'react';
import { Button, Modal } from 'antd';

import useI18n from 'helpers/useI18n';

import styles from './BackgroundRemoalPanel.module.scss';

interface Props {
  originalUrl: string;
  resultUrl: string;
  onApply: (url?: string) => void;
  onCancel: () => void;
  onClose: () => void;
}

const BackgroundRemovalPanel = ({ originalUrl, resultUrl, onApply, onCancel, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const langPhotoEdit = lang.beambox.photo_edit_panel;
  const langActionPanel = lang.beambox.right_panel.object_panel.actions_panel;

  const handleApply = () => {
    onApply(resultUrl);
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const renderFooter = () => (
    <>
      <Button onClick={handleCancel}>{langPhotoEdit.cancel}</Button>
      <Button type="primary" onClick={handleApply}>{langPhotoEdit.apply}</Button>
    </>
  );

  return (
    <Modal
      open
      centered
      title={langActionPanel.ai_bg_removal}
      width={800}
      maskClosable={false}
      closable={false}
      footer={renderFooter()}
    >
      <div className={styles.container}>
        <div>
          <img src={originalUrl} alt="original" />
        </div>
        <div>
          <img src={resultUrl} alt="result" />
        </div>
      </div>
    </Modal>
  );
};

export default BackgroundRemovalPanel;
