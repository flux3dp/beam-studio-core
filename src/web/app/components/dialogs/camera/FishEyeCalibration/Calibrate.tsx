/* eslint-disable no-await-in-loop */
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputNumber, Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { setEditingInput, setStopEditingInput } from 'app/widgets/InputKeyWrapper';

import styles from './Calibrate.module.scss';

export enum Mode {
  UNKNOWN = 0, // Waiting for user to select mode
  MANUAL = 1, // Take picture manually
  FETCH = 2, // Fetch picture from machine
}

interface Props {
  mode?: Mode;
  onClose: (complete: boolean) => void;
  onNext: (imgs: { height: number; blob: Blob }[]) => Promise<void>;
}

const PROGRESS_ID = 'fish-eye-calibration';
const Calibrate = ({ mode: initMode = Mode.UNKNOWN, onClose, onNext }: Props): JSX.Element => {
  const lang = useI18n();
  const [mode, setMode] = useState(initMode);
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

  const fetchCalibImage = async () => {
    const newImages: { height: number; url: string, blob: Blob }[] = [];
    const startHeight = -19;
    const endHeight = 32;
    const total = endHeight - startHeight + 1;
    progressCaller.openSteppingProgress({ id: PROGRESS_ID, message: `下載圖片中 0 / ${total}`, percentage: 0 });
    for (let height = startHeight; height <= endHeight; height += 1) {
      const heightStr = height.toFixed(1);
      progressCaller.update(PROGRESS_ID, {
        message: `下載圖片中 ${height - startHeight + 1} / ${total}`,
        percentage: Math.round(100 * ((height - startHeight + 1) / total)),
      });
      // const topImg = await deviceMaster.fetchCameraCalibImage(`pic_${heightStr}_bottom_right.jpg`) as Blob;
      // const topImgUrl = URL.createObjectURL(topImg);
      const bottomImg = await deviceMaster.fetchCameraCalibImage(`pic_${heightStr}_top_left.jpg`) as Blob;
      // const bottomImgUrl = URL.createObjectURL(bottomImg);
      // const combined = await combineImgs(topImgUrl, bottomImgUrl);
      // newImages.push({ height, url: URL.createObjectURL(combined), blob: combined });
      newImages.push({ height, url: URL.createObjectURL(bottomImg), blob: bottomImg });
      // URL.revokeObjectURL(topImgUrl);
      // URL.revokeObjectURL(bottomImgUrl);
    }
    progressCaller.popById(PROGRESS_ID);
    setImgs(newImages);
  };

  useEffect(() => {
    deviceMaster.connectCamera();
    return () => deviceMaster.disconnectCamera();
  }, []);

  useEffect(() => {
    if (mode === Mode.MANUAL) handleTakePicture();
    else if (mode === Mode.FETCH) fetchCalibImage();
    else {
      alertCaller.popUp({
        message: '請問是否要使用機器中預拍的照片',
        buttonType: alertConstants.YES_NO,
        onYes: () => setMode(Mode.FETCH),
        onNo: () => setMode(Mode.MANUAL),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    imgsRef.current = imgs;
  }, [imgs]);

  useEffect(() => () => {
    if (imgsRef.current) imgsRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
  });

  const removeImg = (i: number) => {
    setImgs(imgs.filter((_, index) => index !== i));
  };

  const btns = mode === Mode.MANUAL ? [
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
  ] : [
    <Button type="primary" disabled={imgs.length < 1} onClick={() => onNext(imgs)} key="next">
      {lang.buttons.next}
    </Button>,
  ];

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title="tCalibrate Rotate and Scale"
      footer={btns}
    >
      <div>
        Please put the chessboard at left top corner
        {mode === Mode.MANUAL && (
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
        )}
        <Row>
          Current Images:
          <div className={classNames(styles.imgs, { [styles.full]: mode === Mode.FETCH })}>
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
