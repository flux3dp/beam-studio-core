import React from 'react';

import useI18n from 'helpers/useI18n';

import { Button, Divider, Modal } from 'antd';
import styles from './index.module.scss';
import WorkAreaInfo from './WorkAreaInfo';
import TableSettingForm from './TableSettingForm';
import BlockSettingForm from './BlockSettingForm';
import { tableSetting as defaultTableSetting } from './TableSetting';

import 'react-resizable/css/styles.css';
import { blockSetting as defaultBlockSetting } from './BlockSetting';

interface Props {
  isInch?: boolean;
  onClose: () => void;
}

const MaterialTestGeneratorPanel = ({ isInch = false, onClose }: Props): JSX.Element => {
  const t = useI18n();
  const [isPreview, setIsPreview] = React.useState(false);
  const [tableSetting, setTableSetting] = React.useState(defaultTableSetting());
  const [blockSetting, setBlockSetting] = React.useState(defaultBlockSetting());

  return (
    <Modal
      open
      centered
      wrapClassName={styles['modal-wrap']}
      title={t.material_test_generator.title}
      onCancel={onClose}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose}>{t.global.cancel}</Button>
          <Button
            type="primary"
            onClick={() => {
              console.log('settings', { tableSetting, blockSetting });
              setIsPreview(true);
            }}
          >
            {t.material_test_generator.preview}
          </Button>
        </div>
      }
    >
      <WorkAreaInfo isInch={isInch} />

      <Divider orientation="left" orientationMargin="0">
        {t.material_test_generator.table_settings}
      </Divider>

      <TableSettingForm
        isInch={isInch}
        tableSetting={tableSetting}
        handleChange={setTableSetting}
      />

      <Divider orientation="left" orientationMargin="0">
        {t.material_test_generator.block_settings}
      </Divider>

      <BlockSettingForm
        isInch={isInch}
        blockSetting={blockSetting}
        handleChange={setBlockSetting}
      />
    </Modal>
    // isPreview ? (
    //   <Modal
    //     open
    //     centered
    //     wrapClassName={styles['modal-wrap']}
    //     title={t.material_test_generator.title}
    //     onCancel={onClose}
    //     footer={
    //       <div className={styles.footer}>
    //         <Button onClick={() => setIsPreview(false)}>{t.global.back}</Button>
    //         <Button type="primary" onClick={handleSave}>
    //           {t.material_test_generator.export}
    //         </Button>
    //       </div>
    //     }
    //   >
    //     {/* <Beambox /> */}
    //     <Flex justify="space-between">
    //       <div className={styles['preview-subtext']}>Block size: 20mm x 20mm</div>
    //       <div className={styles['preview-subtext']}>Max size: 320mm x 400mm</div>
    //     </Flex>
    //   </Modal>
    // ) :
  );
};

export default MaterialTestGeneratorPanel;
