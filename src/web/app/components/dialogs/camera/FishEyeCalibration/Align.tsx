import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputNumber, Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';
import { interpolatePointsFromHeight } from 'helpers/camera-calibration-helper';

import styles from './Align.module.scss';

interface Props {
  fisheyeParam: FisheyeCameraParameters;
  onClose: (complete: boolean) => void;
  onBack: () => void;
  onNext: (x: number, y: number) => void;
}

// Guess from padding 100 + half of the image size
const initScrollLeft = Math.round(100 + 2150 / 2);
const initScrollTop = Math.round(100 + 1500 / 2);

const Align = ({ fisheyeParam, onClose, onBack, onNext }: Props): JSX.Element => {
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const lang = useI18n();
  const [form] = Form.useForm();

  const [img, setImg] = useState<{ blob: Blob, url: string }>(null);
  const handleTakePicture = async () => {
    const { imgBlob } = await deviceMaster.takeOnePicture();
    if (!imgBlob) alertCaller.popUpError({ message: 'tUnable to get image' });
    else setImg({ blob: imgBlob, url: URL.createObjectURL(imgBlob) });
  };

  useEffect(() => {
    deviceMaster.connectCamera()
      .then(async () => {
        let enteredRawMode = false;
        let height = 0;
        try {
          await deviceMaster.enterRawMode();
          enteredRawMode = true;
          const res = await deviceMaster.rawGetProbePos();
          const { z, didAf } = res;
          if (didAf) height = deviceConstants.WORKAREA_DEEP[deviceMaster.currentDevice.info.model] - z;
        } catch (e) {
          // do nothing
        } finally {
          if (enteredRawMode) await deviceMaster.endRawMode();
        }
        const { k, d, points, heights } = fisheyeParam;
        console.log('Use Height: ', height);
        let perspectivePoints = points[0];
        if (height !== null && !Number.isNaN(height)) {
          perspectivePoints = interpolatePointsFromHeight(height, heights, points);
        }
        await deviceMaster.setFisheyeMatrix({ k, d, points: perspectivePoints });
        handleTakePicture();
      });
    return () => deviceMaster.disconnectCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (img?.url) URL.revokeObjectURL(img.url);
  }, [img]);

  const handleImgLoad = useCallback(() => {
    if (imgContainerRef.current) {
      imgContainerRef.current.scrollLeft = initScrollLeft - imgContainerRef.current.clientWidth / 2;
      imgContainerRef.current.scrollTop = initScrollTop - imgContainerRef.current.clientHeight / 2;
      form.setFieldsValue({ x: initScrollLeft, y: initScrollTop });
    }
  }, [form]);

  const handleValueChange = useCallback((key: 'x' | 'y', val: number) => {
    if (imgContainerRef.current) {
      if (key === 'x') imgContainerRef.current.scrollLeft = val;
      else imgContainerRef.current.scrollTop = val;
    }
  }, []);

  const handleContainerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    form.setFieldsValue({
      x: Math.round(e.currentTarget.scrollLeft),
      y: Math.round(e.currentTarget.scrollTop),
    });
  }, [form]);

  const handleNext = useCallback(() => {
    const { x, y } = form.getFieldsValue();
    const cx = Math.round(x + imgContainerRef.current.clientWidth / 2);
    const cy = Math.round(y + imgContainerRef.current.clientHeight / 2);
    onNext(cx, cy);
  }, [form, onNext]);

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title="tAlign"
      footer={[
        <Button onClick={onBack} key="back">
          {lang.buttons.back}
        </Button>,
        <Button onClick={handleTakePicture} key="take-picture">
          tTake Picture
        </Button>,
        <Button type="primary" onClick={handleNext} key="next">
          {lang.buttons.next}
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      Please Align the cut mark
      <Row>
        <Col span={12}>
          <div className={styles.container}>
            <div ref={imgContainerRef} className={styles['img-container']} onScroll={handleContainerScroll}>
              <img src={img?.url} onLoad={handleImgLoad} />
            </div>
            <div className={styles.mark}>
              <div className={classNames(styles.bar, styles.hor)} />
              <div className={classNames(styles.bar, styles.vert)} />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <Form
            size="small"
            className="controls"
            form={form}
          >
            <Form.Item name="x" label="tX" initialValue={0}>
              <InputNumber<number>
                type="number"
                addonAfter="tPx"
                onChange={(val) => handleValueChange('x', val)}
                step={1}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </Form.Item>
            <Form.Item name="y" label="tY" initialValue={0}>
              <InputNumber<number>
                type="number"
                addonAfter="tPx"
                onChange={(val) => handleValueChange('y', val)}
                step={1}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default Align;
