import classNames from 'classnames';
import React, { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, InputNumber, Modal, Row } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import ObjectPanelIcons from 'app/icons/object-panel/ObjectPanelIcons';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { FisheyeCameraParametersV2Cali } from 'interfaces/FisheyePreview';
import {
  solvePnPFindCorners,
  solvePnPCalculate,
  updateData,
} from 'helpers/camera-calibration-helper';

import styles from './SolvePnP.module.scss';

const PROGRESS_ID = 'camera-solve-pnp';

interface Props {
  params: FisheyeCameraParametersV2Cali;
  hasNext?: boolean;
  onClose: (complete: boolean) => void;
  onNext: (rvec: number[], tvec: number[]) => void;
  onBack: () => void;
}

const SolvePnP = ({ params, hasNext = false, onClose, onNext, onBack }: Props): JSX.Element => {
  const [img, setImg] = useState<{ blob: Blob; url: string; success: boolean }>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const dragStartPos = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    pointIdx?: number;
  } | null>(null);
  const imageSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const lang = useI18n();

  const initSetup = useCallback(async () => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    try {
      await deviceMaster.connectCamera();
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTakePicture = async (retryTimes = 0) => {
    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: lang.calibration.taking_picture,
    });
    const { imgBlob } = (await deviceMaster.takeOnePicture()) || {};
    if (!imgBlob) {
      if (retryTimes < 3) handleTakePicture(retryTimes + 1);
      else alertCaller.popUpError({ message: 'Unable to get image' });
    } else {
      try {
        const res = await solvePnPFindCorners(imgBlob, params.dh);
        if (res.success) {
          const { success, blob, data } = res;
          setImg({ blob, url: URL.createObjectURL(blob), success });
          setPoints(data.points);
        } else if (res.success === false) {
          const { data } = res;
          if (data.info === 'NO_DATA') {
            await updateData(params);
          } else if (retryTimes < 3) {
            handleTakePicture(retryTimes + 1);
          }
        }
      } catch (err) {
        alertCaller.popUpError({ message: err.message });
      }
    }
    progressCaller.popById(PROGRESS_ID);
  };

  useEffect(() => {
    initSetup().then(() => {
      handleTakePicture();
    });
    return () => deviceMaster.disconnectCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContainerDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    dragStartPos.current = {
      x: e.screenX,
      y: e.screenY,
      startX: e.currentTarget.scrollLeft,
      startY: e.currentTarget.scrollTop,
    };
  }, []);

  const handlePointDragStart = useCallback(
    (idx: number, e: React.MouseEvent<SVGCircleElement>) => {
      e.stopPropagation();
      setSelectedPointIdx(idx);
      dragStartPos.current = {
        x: e.screenX,
        y: e.screenY,
        startX: points[idx]?.[0],
        startY: points[idx]?.[1],
        pointIdx: idx,
      };
    },
    [points]
  );

  const handleDragMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragStartPos.current) {
        const { x, y, startX, startY, pointIdx } = dragStartPos.current;
        const dx = e.screenX - x;
        const dy = e.screenY - y;
        if (pointIdx !== undefined) {
          imgContainerRef.current
            .querySelectorAll('svg > g')
            [pointIdx]?.querySelectorAll('circle')
            .forEach((c) => {
              c.setAttribute('cx', `${startX + dx / scale}`);
              c.setAttribute('cy', `${startY + dy / scale}`);
            });
        } else {
          e.currentTarget.scrollLeft = startX - dx;
          e.currentTarget.scrollTop = startY - dy;
        }
      }
    },
    [scale]
  );

  const handleDragEnd = useCallback(() => {
    if (dragStartPos.current) {
      const { pointIdx } = dragStartPos.current;
      if (pointIdx !== undefined) {
        const circle = imgContainerRef.current
          .querySelectorAll('svg > g')
          [pointIdx].querySelector('circle');
        const x = parseInt(circle.getAttribute('cx'), 10);
        const y = parseInt(circle.getAttribute('cy'), 10);
        setPoints((prev) => prev.map((p, i) => (i === pointIdx ? [x, y] : p)));
      }
    }
    dragStartPos.current = null;
  }, []);

  const handleZoom = useCallback(
    (delta) => {
      const newScale = Math.round(Math.max(Math.min(2, scale + delta), 0.2) * 100) / 100;
      if (newScale === scale) return;
      setScale(newScale);
      if (!imgContainerRef.current) return;
      const currentCenter = {
        x: imgContainerRef.current.scrollLeft + imgContainerRef.current.clientWidth / 2,
        y: imgContainerRef.current.scrollTop + imgContainerRef.current.clientHeight / 2,
      };
      const newCenter = {
        x: (currentCenter.x * newScale) / scale,
        y: (currentCenter.y * newScale) / scale,
      };
      imgContainerRef.current.scrollLeft = newCenter.x - imgContainerRef.current.clientWidth / 2;
      imgContainerRef.current.scrollTop = newCenter.y - imgContainerRef.current.clientHeight / 2;
    },
    [scale]
  );

  const zoomToAllPoints = useCallback(() => {
    if (!imgContainerRef.current || !points.length) return;
    const coord = points.reduce(
      (acc, p) => {
        acc.maxX = Math.max(acc.maxX, p[0]);
        acc.maxY = Math.max(acc.maxY, p[1]);
        acc.minX = Math.min(acc.minX, p[0]);
        acc.minY = Math.min(acc.minY, p[1]);
        return acc;
      },
      { maxX: 0, maxY: 0, minX: Infinity, minY: Infinity }
    );
    const width = coord.maxX - coord.minX;
    const height = coord.maxY - coord.minY;
    const center = [(coord.maxX + coord.minX) / 2, (coord.maxY + coord.minY) / 2];
    const scaleW = imgContainerRef.current.clientWidth / width;
    const scaleH = imgContainerRef.current.clientHeight / height;
    const targetScale = Math.min(scaleW, scaleH) * 0.8;
    setScale(targetScale);
    imgContainerRef.current.scrollLeft =
      center[0] * targetScale - imgContainerRef.current.clientWidth / 2;
    imgContainerRef.current.scrollTop =
      center[1] * targetScale - imgContainerRef.current.clientHeight / 2;
  }, [points]);

  const handleImgLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      imageSizeRef.current = {
        width: e.currentTarget.naturalWidth,
        height: e.currentTarget.naturalHeight,
      };
      setImgLoaded(true);
      zoomToAllPoints();
    },
    [zoomToAllPoints]
  );

  const handleDone = async () => {
    const res = await solvePnPCalculate(params.dh, points);
    if (res.success) {
      const { rvec, tvec } = res.data;
      onNext(rvec, tvec);
    } else {
      alertCaller.popUpError({ message: 'Failed to solvePnP' });
    }
  };

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
        <Button
          className={styles['footer-button']}
          onClick={() => handleTakePicture(0)}
          key="retry"
        >
          {lang.calibration.retake}
        </Button>,
        <Button
          className={styles['footer-button']}
          onClick={handleDone}
          disabled={!img?.success}
          key="done"
          type="primary"
        >
          {hasNext ? lang.buttons.next : lang.buttons.done}
        </Button>,
      ]}
      closable
      maskClosable={false}
    >
      {lang.calibration.align_points}
      <Row gutter={[16, 0]}>
        <Col span={18}>
          <div className={styles.container}>
            <div
              ref={imgContainerRef}
              className={styles['img-container']}
              onMouseDown={handleContainerDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {!imgLoaded ? (
                <img src={img?.url} onLoad={handleImgLoad} />
              ) : (
                <svg
                  width={imageSizeRef.current.width * scale}
                  height={imageSizeRef.current.height * scale}
                  viewBox={`0 0 ${imageSizeRef.current.width} ${imageSizeRef.current.height}`}
                >
                  <image
                    width={imageSizeRef.current.width}
                    height={imageSizeRef.current.height}
                    href={img?.url}
                  />
                  {points.map((p, idx) => (
                    <g
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      className={classNames({ [styles.selected]: idx === selectedPointIdx })}
                    >
                      <circle
                        cx={p[0]}
                        cy={p[1]}
                        r={5 / scale}
                        onMouseDown={(e) => handlePointDragStart(idx, e)}
                      />
                      <circle className={styles.center} cx={p[0]} cy={p[1]} r={1 / scale} />
                    </g>
                  ))}
                </svg>
              )}
            </div>
            <div className={styles['zoom-block']}>
              <button type="button" onClick={() => handleZoom(-0.2)}>
                <ObjectPanelIcons.Minus width="20" height="20" />
              </button>
              <button type="button" onClick={() => handleZoom(0.2)}>
                <ObjectPanelIcons.Plus width="20" height="20" />
              </button>
            </div>
          </div>
        </Col>
        <Col span={6}>
          {points[selectedPointIdx] && (
            <Row gutter={[0, 12]} align="middle">
              <Col span={24}>Point #{selectedPointIdx}</Col>
              <Col span={4}>X</Col>
              <Col span={20}>
                <InputNumber<number>
                  type="number"
                  value={points[selectedPointIdx][0]}
                  onChange={(val) =>
                    setPoints((prev) =>
                      prev.map((p, i) => (i === selectedPointIdx ? [val, p[1]] : p))
                    )
                  }
                  step={1}
                  precision={0}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </Col>
              <Col span={4}>Y</Col>
              <Col span={20}>
                <InputNumber<number>
                  type="number"
                  value={points[selectedPointIdx][1]}
                  onChange={(val) =>
                    setPoints((prev) =>
                      prev.map((p, i) => (i === selectedPointIdx ? [p[0], val] : p))
                    )
                  }
                  step={1}
                  precision={0}
                  onKeyUp={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Modal>
  );
};

export default SolvePnP;
