import React, { useState } from 'react';
import { Button, Input, Modal, Space } from 'antd';

import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  onClose: (fileName: string | null, isCancelled?: boolean) => void;
  uuid?: string;
}

const SaveFileModal = ({ onClose, uuid }: Props): JSX.Element => {
  const LANG = useI18n();
  const lang = LANG.my_cloud.save_file;
  const [isEditingName, setIsEditingName] = useState(!uuid);
  const [fileName, setFileName] = useState<string>(
    (svgCanvas.getLatestImportFileName() || LANG.topbar.untitled).replace('/', ':')
  );

  return isEditingName ? (
    <Modal
      title={lang.input_file_name}
      onOk={() => onClose(fileName)}
      onCancel={() => onClose(null, true)}
      okButtonProps={{ disabled: !fileName }}
      width={350}
      centered
      open
    >
      <Input
        size="small"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        maxLength={255}
      />
    </Modal>
  ) : (
    <Modal
      title={lang.choose_action}
      onCancel={() => onClose(null, true)}
      footer={
        <Space>
          <Button type="primary" onClick={() => setIsEditingName(true)}>
            {lang.save_new}
          </Button>
          <Button type="primary" onClick={() => onClose(null)}>
            {lang.save}
          </Button>
        </Space>
      }
      width={350}
      centered
      open
    />
  );
};

export default SaveFileModal;
