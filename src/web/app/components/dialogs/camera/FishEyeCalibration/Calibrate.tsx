import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import useI18n from 'helpers/useI18n';

import styles from './Calibrate.module.scss';

interface Props {
  onClose: (complete: boolean) => void;
  onNext: (img: Blob) => Promise<void>;
}

const Calibrate = ({ onClose, onNext }: Props): JSX.Element => {
  const lang = useI18n();

  const [img, setImg] = useState<{ blob: Blob, url: string }>(null);
  const handleTakePicture = async () => {
    const res = await deviceMaster.takeOnePicture();
    if (!res) alertCaller.popUpError({ message: 'tUnable to get image' });
    else setImg({ blob: res.imgBlob, url: URL.createObjectURL(res.imgBlob) });
  };

  useEffect(() => {
    deviceMaster.connectCamera().then(() => handleTakePicture());
    return () => deviceMaster.disconnectCamera();
  }, []);

  useEffect(() => () => {
    if (img?.url) URL.revokeObjectURL(img.url);
  }, [img]);

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title={'tCalibrate Rotate and Scale'}
      footer={[
        <Button onClick={handleTakePicture} key="take-picture">
          {'tTake Picture'}
        </Button>,
        <Button type="primary" onClick={() => onNext(img.blob)} key="next">
          {lang.buttons.next}
        </Button>,
      ]}
    >
      <div>
        Please put the chessboard at left top corner
        <div className={styles['img-container']}>
          <img src={img?.url} />
        </div>
      </div>
    </Modal>
  );
};

export default Calibrate;
