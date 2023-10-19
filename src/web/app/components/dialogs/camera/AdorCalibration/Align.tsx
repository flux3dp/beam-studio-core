import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Col, Form, InputNumber, Modal, Row, Tooltip } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';
import {
  getPerspectivePointsZ3Regression,
  interpolatePointsFromHeight,
} from 'helpers/camera-calibration-helper';

import styles from './Align.module.scss';

interface Props {
  fisheyeParam: FisheyeCameraParameters;
  onClose: (complete: boolean) => void;
  onBack: () => void;
  onNext: (x: number, y: number) => void;
}

// Guess from half of the image size
const initScrollLeft = Math.round(200 + 2150 / 2);
const initScrollTop = Math.round(300 + 1500 / 2);
const PROGRESS_ID = 'calibration-align';

const Align = ({ fisheyeParam, onClose, onBack, onNext }: Props): JSX.Element => {
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const lang = useI18n();
  const [form] = Form.useForm();
  const [showLastResult, setShowLastResult] = useState(false);

  const [img, setImg] = useState<{ blob: Blob; url: string }>(null);
  const handleTakePicture = async (retryTimes = 0) => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    const { imgBlob } = (await deviceMaster.takeOnePicture()) || {};
    if (!imgBlob) {
      if (retryTimes < 3) handleTakePicture(retryTimes + 1);
      else alertCaller.popUpError({ message: 'Unable to get image' });
    } else setImg({ blob: imgBlob, url: URL.createObjectURL(imgBlob) });
    progressCaller.popById(PROGRESS_ID);
  };

  const initSetup = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    try {
      await deviceMaster.connectCamera();
      let enteredRawMode = false;
      let height = 0;
      try {
        await deviceMaster.enterRawMode();
        enteredRawMode = true;
        const res = await deviceMaster.rawGetProbePos();
        const { z, didAf } = res;
        if (didAf)
          height = deviceConstants.WORKAREA_DEEP[deviceMaster.currentDevice.info.model] - z;
      } catch (e) {
        // do nothing
      } finally {
        if (enteredRawMode) await deviceMaster.endRawMode();
      }
      const { k, d, z3regParam, heights, points } = fisheyeParam;
      console.log('Use Height: ', height);
      if (heights && points) {
        let perspectivePoints = points[0];
        if (height !== null && !Number.isNaN(height)) {
          perspectivePoints = interpolatePointsFromHeight(height, heights, points);
        }
        await deviceMaster.setFisheyeMatrix({ k, d, points: perspectivePoints });
      } else if (z3regParam) {
        const perspectivePoints = getPerspectivePointsZ3Regression(height, z3regParam);
        await deviceMaster.setFisheyeMatrix({ k, d, points: perspectivePoints });
      }
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initSetup().then(() => {
      handleTakePicture();
    });
    return () => deviceMaster.disconnectCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (img?.url) URL.revokeObjectURL(img.url);
    },
    [img]
  );

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

  const handleContainerScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      form.setFieldsValue({
        x: Math.round(e.currentTarget.scrollLeft),
        y: Math.round(e.currentTarget.scrollTop),
      });
    },
    [form]
  );

  const handleNext = useCallback(() => {
    const { x, y } = form.getFieldsValue();
    const cx = Math.round(x + imgContainerRef.current.clientWidth / 2);
    const cy = Math.round(y + imgContainerRef.current.clientHeight / 2);
    onNext(cx, cy);
  }, [form, onNext]);
  const lastResult = useMemo(() => fisheyeParam.center, [fisheyeParam.center]);
  const useLastConfig = useCallback(() => {
    if (imgContainerRef.current) {
      imgContainerRef.current.scrollLeft = lastResult[0] - imgContainerRef.current.clientWidth / 2;
      imgContainerRef.current.scrollTop = lastResult[1] - imgContainerRef.current.clientHeight / 2;
    }
  }, [lastResult]);

  return (
    <Modal
      open
      centered
      onCancel={() => onClose(false)}
      title={lang.calibration.camera_calibration}
      footer={[
        <Button className={styles['footer-button']} onClick={onBack} key="back">
          {lang.buttons.back}
        </Button>,
        <Button className={styles['footer-button']} onClick={() => handleTakePicture(0)} key="take-picture">
          {lang.calibration.retake}
        </Button>,
        <Button className={styles['footer-button']} type="primary" onClick={handleNext} key="next">
          {lang.buttons.next}
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <Row>
        <div className={styles.text}>{lang.calibration.align_red_cross_cut}</div>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <div className={styles.container}>
            <div
              ref={imgContainerRef}
              className={styles['img-container']}
              onScroll={handleContainerScroll}
            >
              <img src={img?.url} onLoad={handleImgLoad} />
              {lastResult && showLastResult && (
                <div className={styles.last} style={{ left: lastResult[0], top: lastResult[1] }}>
                  <div className={classNames(styles.bar, styles.hor)} />
                  <div className={classNames(styles.bar, styles.vert)} />
                </div>
              )}
            </div>
            <div className={styles.mark}>
              <div className={classNames(styles.bar, styles.hor)} />
              <div className={classNames(styles.bar, styles.vert)} />
            </div>
          </div>
          {lastResult && (
            <Checkbox onChange={(e) => setShowLastResult(e.target.checked)}>
              {lang.calibration.show_last_config}
            </Checkbox>
          )}
        </Col>
        <Col span={12}>
          <Form size="small" className="controls" form={form}>
            <Form.Item name="x" label={lang.calibration.dx} initialValue={0}>
              <InputNumber<number>
                type="number"
                onChange={(val) => handleValueChange('x', val)}
                step={1}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </Form.Item>
            <Form.Item name="y" label={lang.calibration.dy} initialValue={0}>
              <InputNumber<number>
                type="number"
                onChange={(val) => handleValueChange('y', val)}
                step={1}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </Form.Item>
          </Form>
          <div className={styles.hints}>
            {lastResult && (
              <Button onClick={useLastConfig} size="small">
                {lang.calibration.use_last_config}
              </Button>
            )}
            <Tooltip trigger="click" title={lang.calibration.hint_adjust_parameters}>
              <Button size="small">?</Button>
            </Tooltip>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default Align;
