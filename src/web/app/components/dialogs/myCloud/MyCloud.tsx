import React, { useContext, useMemo } from 'react';
import { Modal } from 'antd';

import FloatingPanel from 'app/widgets/FloatingPanel';
import FluxIcons from 'app/icons/flux/FluxIcons';
import useI18n from 'helpers/useI18n';
import { useIsMobile } from 'helpers/system-helper';
import { MyCloudContext, MyCloudProvider } from 'app/contexts/MyCloudContext';

import GridFile from './GridFile';
import Head from './Head';
import styles from './MyCloud.module.scss';

interface Props {
  onClose: () => void;
}

const MyCloudModal = (): JSX.Element => {
  const lang = useI18n().my_cloud;
  const isMobile = useIsMobile();
  const { onClose, files, setSelectedId } = useContext(MyCloudContext);
  const anchors = [0, window.innerHeight - 40];

  const content = useMemo(() => {
    if (files === undefined) return <div className={styles.placeholder}>{lang.loading_file}</div>;
    if (files.length === 0)
      return (
        <div className={styles.placeholder}>
          <div>{lang.no_file_title}</div>
          <div>{lang.no_file_subtitle}</div>
        </div>
      );
    return (
      <div className={styles.grids} onClick={() => setSelectedId(null)}>
        {files.map((file) => (
          <GridFile key={file.uuid} file={file} />
        ))}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const title = (
    <div className={styles.title}>
      <FluxIcons.FluxPlus />
      {lang.title}
    </div>
  );

  return isMobile ? (
    <FloatingPanel
      className={styles.panel}
      anchors={anchors}
      title={title}
      fixedContent={<Head />}
      onClose={onClose}
    >
      {content}
    </FloatingPanel>
  ) : (
    <Modal title={title} footer={null} width={720} onCancel={onClose} centered open>
      <Head />
      {content}
    </Modal>
  );
};

const MyCloud = ({ onClose }: Props): JSX.Element => (
  <MyCloudProvider onClose={onClose}>
    <MyCloudModal />
  </MyCloudProvider>
);

export default MyCloud;
