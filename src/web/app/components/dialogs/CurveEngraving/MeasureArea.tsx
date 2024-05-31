/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import classNames from 'classnames';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Col, Modal, InputNumber, Row, Segmented } from 'antd';

import browser from 'implementations/browser';
import checkDeviceStatus from 'helpers/check-device-status';
import durationFormatter from 'helpers/duration-formatter';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

import rangeGenerator from './rangeGenerator';
import styles from './MeasureArea.module.scss';

const debugging = false;

enum Type {
  Amount = 1,
  Gap = 2,
}

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  onFinished: (points: number[][][], gap: number[]) => void;
  onClose: () => void;
}

const MeasureArea = ({ x, y, width, height, onFinished, onClose }: Props): JSX.Element => {
  const [selectedType, setSelectedType] = useState(Type.Amount);
  const [row, setRow] = useState(12);
  const [column, setColumn] = useState(8);
  const [rowGap, setRowGap] = useState(Math.round(width / 10));
  const [columnGap, setColumnGap] = useState(Math.round(height / 10));
  const canceledRef = useRef(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [finishedPoints, setFinishedPoints] = useState<number>(0);
  const [progressText, setProgressText] = useState('');
  const xRange = useMemo(() => {
    if (selectedType === Type.Amount)
      return rangeGenerator.countRangeGenerator(x, x + width, column);
    return rangeGenerator.stepRangeGenerator(x, x + width, columnGap);
  }, [x, width, column, columnGap, selectedType]);
  const yRange = useMemo(() => {
    if (selectedType === Type.Amount) return rangeGenerator.countRangeGenerator(y, y + height, row);
    return rangeGenerator.stepRangeGenerator(y, y + height, rowGap);
  }, [y, height, row, rowGap, selectedType]);

  const handleStartMeasuring = async () => {
    if (isMeasuring) return;
    canceledRef.current = false;
    setIsMeasuring(true);
    setFinishedPoints(0);
    const { device } = await getDevice();
    if (!device) {
      setIsMeasuring(false);
      return;
    }
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) {
      setIsMeasuring(false);
      return;
    }
    setProgressText('tEntering raw mode...');
    await deviceMaster.enterRawMode();
    setProgressText('tHoming...');
    await deviceMaster.rawHome();
    if (canceledRef.current) {
      setIsMeasuring(false);
      return;
    }
    const currentPosition = { x: 0, y: 0 };
    setProgressText('tStarting Measuring...');
    const points: number[][][] = [];
    const totalPoints = xRange.length * yRange.length;
    let finished = 0;
    const workarea = getWorkarea(device.model as WorkAreaModel);
    const [offsetX, offsetY] = workarea.autoFocusOffset || [0, 0];
    const feedrate = 6000;
    const start = Date.now();

    try {
      for (let i = 0; i < yRange.length; i += 1) {
        points.push([]);
        for (let j = 0; j < xRange.length; j += 1) {
          if (canceledRef.current) {
            setIsMeasuring(false);
            return;
          }
          const pointX = xRange[j];
          const pointY = yRange[i];
          if (!debugging) {
            await deviceMaster.rawMove({
              x: Math.max(pointX - offsetX, 0),
              y: Math.max(pointY - offsetY),
              f: feedrate,
            });
            const dist = Math.sqrt(
              (pointX - currentPosition.x) ** 2 + (pointY - currentPosition.y) ** 2
            );
            const time = (dist / feedrate) * 60;
            await new Promise((resolve) => setTimeout(resolve, time * 1000));
          }
          try {
            if (!debugging) {
              // TODO: better baseZ
              const z = await deviceMaster.rawMeasureHeight(55);
              console.log(pointX, pointY, z);
              points[i].push([pointX, pointY, z]);
            } else {
              // Debugging height measurement
              const z = 4 + 2 * Math.sin(pointX) + 2 * Math.cos(pointY);
              points[i].push([pointX, pointY, z]);
            }
          } catch (error) {
            console.error(`Failed to measure height at point ${pointX}, ${pointY}`, error);
          }
          const elapsedTime = Date.now() - start;

          finished += 1;
          const finishedRatio = finished / totalPoints;
          const remainingTime = (elapsedTime / finishedRatio - elapsedTime) / 1000;
          setProgressText(`tTime remaning: ${durationFormatter(remainingTime)}`);
          setFinishedPoints(finished);
        }
      }
    } catch (error) {
      return;
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        await deviceMaster.rawLooseMotor();
        await deviceMaster.endRawMode();
      }
    }
    onFinished(points, [xRange[1] - xRange[0], yRange[1] - yRange[0]]);
    onClose();
  };

  const handleCancel = useCallback(() => {
    canceledRef.current = true;
  }, []);

  return (
    <Modal
      title="Meaure Autofocus Area"
      open
      centered
      closable={false}
      width={540}
      maskClosable={false}
      footer={
        isMeasuring
          ? [
              <Button key="cancel" onClick={handleCancel}>
                tCancel
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                tRe-select Area
              </Button>,
              <Button key="start" type="primary" onClick={handleStartMeasuring}>
                tStart Autofocus
              </Button>,
            ]
      }
    >
      <div className={styles.points}>
        {yRange.map((yValue, yIdx) => (
          <div className={styles.row} key={yIdx}>
            {xRange.map((xValue, xIdx) => (
              <div
                className={classNames(styles.point, {
                  [styles.finished]: isMeasuring && finishedPoints > yIdx * xRange.length + xIdx,
                })}
                key={`${yIdx}-${xIdx}`}
              />
            ))}
          </div>
        ))}
      </div>
      {!isMeasuring && (
        <>
          <div className={styles.controls}>
            <Col span={24}>
              <Row gutter={[24, 0]} justify="center" align="middle">
                <Col span={12}>
                  <Segmented
                    block
                    options={[
                      { value: Type.Amount, label: 'tAmount' },
                      { value: Type.Gap, label: 'tGap' },
                    ]}
                    onChange={(v: Type) => setSelectedType(v)}
                  />
                </Col>
                <Col span={12}>
                  <Row gutter={[0, 12]} justify="space-around" align="middle">
                    <Col span={12}>{selectedType === Type.Amount ? 'Rows' : 'Row Gap'}</Col>
                    <Col span={12}>
                      <InputNumber<number>
                        type="number"
                        value={selectedType === Type.Amount ? row : rowGap}
                        min={selectedType === Type.Amount ? 2 : 1}
                        onChange={selectedType === Type.Amount ? setRow : setRowGap}
                        step={1}
                        precision={0}
                        addonAfter={selectedType === Type.Amount ? undefined : 'mm'}
                      />
                    </Col>
                    <Col span={12}>{selectedType === Type.Amount ? 'Columns' : 'Column Gap'}</Col>
                    <Col span={12}>
                      <InputNumber<number>
                        type="number"
                        value={selectedType === Type.Amount ? column : columnGap}
                        min={selectedType === Type.Amount ? 2 : 1}
                        onChange={selectedType === Type.Amount ? setColumn : setColumnGap}
                        step={1}
                        precision={0}
                        addonAfter={selectedType === Type.Amount ? undefined : 'mm'}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </div>
          <button
            className={styles.link}
            type="button"
            onClick={() => browser.open('https://google.com')}
          >
            tHow to select the autofocus area for 3D curve
          </button>
        </>
      )}
      {isMeasuring && <div>{progressText}</div>}
    </Modal>
  );
};

export default MeasureArea;

export const showMeasureArea = (
  x: number,
  y: number,
  width: number,
  height: number
): Promise<{ points: number[][][]; gap: number[] } | null> => {
  if (isIdExist('measure-area')) popDialogById('measure-area');
  return new Promise<{ points: number[][][]; gap: number[] } | null>((resolve) => {
    addDialogComponent(
      'measure-area',
      <MeasureArea
        x={x}
        y={y}
        width={width}
        height={height}
        onFinished={(points, gap) => {
          resolve({ points, gap });
          popDialogById('measure-area');
        }}
        onClose={() => {
          resolve(null);
          popDialogById('measure-area');
        }}
      />
    );
  });
};
