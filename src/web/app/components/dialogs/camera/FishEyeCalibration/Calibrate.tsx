import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputNumber, Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import i18n from 'helpers/i18n';
import { setEditingInput, setStopEditingInput } from 'app/widgets/InputKeyWrapper';

import styles from './Calibrate.module.scss';

interface Props {
  onClose: (complete: boolean) => void;
  onNext: (imgs: { height: number; blob: Blob }[]) => Promise<void>;
}

const PROGRESS_ID = 'fish-eye-calibration';
const Calibrate = ({ onClose, onNext }: Props): JSX.Element => {
  const lang = useI18n();
  const [img, setImg] = useState<{ blob: Blob, url: string }>(null);
  const [imgs, setImgs] = useState<{ height: number; url: string, blob: Blob }[]>([]);
  const imgsRef = useRef(imgs);

  const [form] = Form.useForm();

  const combineImgs = async (topImgUrl: string, bottomImgUrl: string): Promise<Blob> => {
    const topImg = new Image();
    const bottomImg = new Image();
    const loadTopImg = new Promise<void>((resolve) => {
      topImg.onload = () => resolve();
      topImg.src = topImgUrl;
    });
    const loadBotImg = new Promise<void>((resolve) => {
      bottomImg.onload = () => resolve();
      bottomImg.src = bottomImgUrl;
    });
    await Promise.all([loadTopImg, loadBotImg]);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = topImg.width;
    canvas.height = topImg.height;
    const topHeight = Math.floor(topImg.height / 2);
    const bottomHeight = topImg.height - topHeight;
    ctx.drawImage(topImg, 0, 0, topImg.width, topHeight, 0, 0, topImg.width, topHeight);
    ctx.drawImage(bottomImg, 0, topHeight, topImg.width, bottomHeight, 0, topHeight, topImg.width, bottomHeight);
    return new Promise((resolve) => canvas.toBlob(resolve));
  };

  const takeHalfPicture = async (isTopHalf = false) => {
    progressCaller.openNonstopProgress({ id: PROGRESS_ID, message: 'tTaking Picture' });
    try {
      const res = await deviceMaster.takeOnePicture();
      if (!res) alertCaller.popUpError({ message: 'tUnable to get image' });
      const newImgUrl = URL.createObjectURL(res.imgBlob);
      const newBlob = await (isTopHalf ? combineImgs(newImgUrl, img.url) : combineImgs(img.url, newImgUrl));
      setImg({ blob: newBlob, url: URL.createObjectURL(newBlob) });
      URL.revokeObjectURL(newImgUrl);
      URL.revokeObjectURL(img.url);
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
  };

  const handleTakePicture = async () => {
    progressCaller.openNonstopProgress({ id: PROGRESS_ID, message: 'tTaking Picture' });
    try {
      const res = await deviceMaster.takeOnePicture();
      if (!res) alertCaller.popUpError({ message: 'tUnable to get image' });
      else setImg({ blob: res.imgBlob, url: URL.createObjectURL(res.imgBlob) });
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
  };

  const handleAddImage = async () => {
    const height = form.getFieldValue('height');
    setImgs([...imgs, { height, blob: img.blob, url: img.url }]);
    handleTakePicture();
    form.setFieldValue('height', height + 1);
  };

  useEffect(() => {
    deviceMaster.connectCamera().then(() => handleTakePicture());
    return () => deviceMaster.disconnectCamera();
  }, []);

  useEffect(() => {
    imgsRef.current = imgs;
  }, [imgs]);

  useEffect(() => () => {
    if (imgsRef.current) imgsRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
  });

  const removeImg = (i: number) => {
    setImgs(imgs.filter((_, index) => index !== i));
  };

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title="tCalibrate Rotate and Scale"
      footer={[
        <Button onClick={() => takeHalfPicture(true)} key="take-upper-picture">
          tTake Upper Picture
        </Button>,
        <Button onClick={() => takeHalfPicture(false)} key="take-lower-picture">
          tTake Lower Picture
        </Button>,
        <Button onClick={handleTakePicture} key="take-picture">
          tTake Picture
        </Button>,
        <Button onClick={handleAddImage} key="add-image">
          tAdd Image
        </Button>,
        <Button type="primary" disabled={imgs.length < 1} onClick={() => onNext(imgs)} key="next">
          {lang.buttons.next}
        </Button>,
      ]}
    >
      <div>
        Please put the chessboard at left top corner
        <Row>
          <Col span={12}>
            <div className={styles['img-container']}>
              <img src={img?.url} />
            </div>
          </Col>
          <Col span={12}>
            <Form
              size="small"
              className="controls"
              form={form}
            >
              <Form.Item name="height" label="tHeight" initialValue={3}>
                <InputNumber<number>
                  type="number"
                  addonAfter="mm"
                  step={1}
                  max={30}
                  min={0}
                  onFocus={setEditingInput}
                  onBlur={setStopEditingInput}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Row>
          Current Images:
          <div className={styles.imgs}>
            {imgs.map(({ url, height }, i) => (
              <div className={styles.container} key={url}>
                <img src={url} />
                <div>{height}mm</div>
                <button type="button" onClick={() => removeImg(i)}>remove</button>
              </div>
            ))}
          </div>
        </Row>
      </div>
    </Modal>
  );
};

export default Calibrate;
