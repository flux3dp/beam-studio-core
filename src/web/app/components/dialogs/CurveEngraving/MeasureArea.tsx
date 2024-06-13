/* eslint-disable no-await-in-loop */
/* eslint-disable react/no-array-index-key */
import classNames from 'classnames';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Col, Modal, InputNumber, Row, Segmented } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import browser from 'implementations/browser';
import checkDeviceStatus from 'helpers/check-device-status';
import durationFormatter from 'helpers/duration-formatter';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { BBox, MeasureData, Points } from 'interfaces/ICurveEngraving';

import rangeGenerator from './rangeGenerator';
import styles from './MeasureArea.module.scss';

const debugging = false;

enum Type {
  Amount = 1,
  Gap = 2,
}

interface Props {
  bbox: BBox;
  onFinished: (data: MeasureData) => void;
  onClose: () => void;
}

const MeasureArea = ({
  bbox: { x, y, width, height },
  onFinished,
  onClose,
}: Props): JSX.Element => {
  const lang = useI18n();
  const [selectedType, setSelectedType] = useState(Type.Amount);
  const [row, setRow] = useState(12);
  const [column, setColumn] = useState(8);
  const [rowGap, setRowGap] = useState(Math.round(width / 10));
  const [columnGap, setColumnGap] = useState(Math.round(height / 10));
  const [objectHeight, setObjectHeight] = useState(10); // [mm]
  const canceledRef = useRef(false);
  const [cancelling, setCancelling] = useState(false);
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

  const checkAndUpdate = useCallback((newVal, setState) => {
    setState((cur: number) => {
      if (Number.isNaN(Number(newVal)) || !newVal) return cur;
      return newVal;
    });
  }, []);

  const handleStartMeasuring = async () => {
    if (isMeasuring) return;
    canceledRef.current = false;
    setCancelling(false);
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
    try {
      setProgressText(lang.message.enteringRawMode);
      await deviceMaster.enterRawMode();
      setProgressText(lang.message.homing);
      await deviceMaster.rawHome();
      if (canceledRef.current) {
        setIsMeasuring(false);
        return;
      }
      const currentPosition = { x: 0, y: 0 };
      setProgressText(lang.curve_engraving.starting_measurement);
      const points: Points = [];
      const totalPoints = xRange.length * yRange.length;
      let finished = 0;
      const workarea = getWorkarea(device.model as WorkAreaModel);
      const [offsetX, offsetY, offsetZ] = workarea.autoFocusOffset || [0, 0, 0];
      const feedrate = 6000;
      const start = Date.now();
      let lowest: number = null;
      let highest: number = null;
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
            const dist = Math.hypot(pointX - currentPosition.x, pointY - currentPosition.y);
            const time = (dist / feedrate) * 60;
            await new Promise((resolve) => setTimeout(resolve, time * 1000));
            currentPosition.x = pointX;
            currentPosition.y = pointY;
          }
          try {
            if (!debugging) {
              const z = await deviceMaster.rawMeasureHeight(
                lowest === null
                  ? { relZ: objectHeight }
                  : { baseZ: Math.max(lowest - objectHeight, 0) }
              );
              if (lowest === null || z > lowest) lowest = z; // actually the max measured value
              const pointZ = typeof z === 'number' ? Math.max(0, z - offsetZ) : null;
              // actually the min measured value, use pointZ to display Plane when z is null
              if (highest === null || z < highest) highest = pointZ;
              points[i].push([pointX, pointY, pointZ]);
            } else {
              // Debugging height measurement
              const z = 4 + 2 * Math.sin(pointX) + 2 * Math.cos(pointY);
              if (lowest === null || z > lowest) lowest = z;
              if (highest === null || z < highest) highest = z;
              points[i].push([pointX, pointY, z]);
            }
          } catch (error) {
            points[i].push([pointX, pointY, null]);
            console.error(`Failed to measure height at point ${pointX}, ${pointY}`, error);
          }
          const elapsedTime = Date.now() - start;

          finished += 1;
          const finishedRatio = finished / totalPoints;
          const remainingTime = (elapsedTime / finishedRatio - elapsedTime) / 1000;
          setProgressText(`${lang.message.time_remaining} ${durationFormatter(remainingTime)}`);
          setFinishedPoints(finished);
        }
      }
      onFinished({
        points,
        gap: [xRange[1] - xRange[0], yRange[1] - yRange[0]],
        objectHeight,
        lowest,
        highest,
      });
      onClose();
    } catch (error) {
      alertCaller.popUpError({ message: `Failed to measure area ${error.message}` });
      setIsMeasuring(false);
      console.log(error);
      return;
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        await deviceMaster.rawLooseMotor();
        await deviceMaster.endRawMode();
      }
    }
  };

  const handleCancel = useCallback(() => {
    canceledRef.current = true;
    setProgressText(lang.message.cancelling);
    setCancelling(true);
  }, [lang]);

  return (
    <Modal
      title={lang.curve_engraving.measure_audofocus_area}
      open
      centered
      closable={false}
      width={540}
      maskClosable={false}
      footer={
        isMeasuring
          ? [
              <Button key="cancel" disabled={cancelling} onClick={handleCancel}>
                {lang.alert.cancel}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                {lang.curve_engraving.reselect_area}
              </Button>,
              <Button key="start" type="primary" onClick={handleStartMeasuring}>
                {lang.curve_engraving.start_autofocus}
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
              <Row gutter={[48, 0]} justify="center">
                <Col className={styles.col} span={12}>
                  <Row gutter={[0, 12]} justify="space-around" align="middle">
                    <Col span={24}>
                      <Segmented
                        block
                        options={[
                          { value: Type.Amount, label: lang.curve_engraving.amount },
                          { value: Type.Gap, label: lang.curve_engraving.gap },
                        ]}
                        onChange={(v: Type) => setSelectedType(v)}
                      />
                    </Col>
                    <Col span={12}>
                      {selectedType === Type.Amount
                        ? lang.curve_engraving.rows
                        : lang.curve_engraving.gap}
                    </Col>
                    <Col span={12}>
                      <InputNumber<number>
                        type="number"
                        value={selectedType === Type.Amount ? row : rowGap}
                        min={selectedType === Type.Amount ? 2 : 1}
                        onChange={(val) =>
                          checkAndUpdate(val, selectedType === Type.Amount ? setRow : setRowGap)
                        }
                        step={1}
                        precision={0}
                        addonAfter={selectedType === Type.Amount ? undefined : 'mm'}
                      />
                    </Col>
                    <Col span={12}>
                      {selectedType === Type.Amount
                        ? lang.curve_engraving.coloumns
                        : lang.curve_engraving.column_gap}
                    </Col>
                    <Col span={12}>
                      <InputNumber<number>
                        type="number"
                        value={selectedType === Type.Amount ? column : columnGap}
                        min={selectedType === Type.Amount ? 2 : 1}
                        onChange={(val) =>
                          checkAndUpdate(
                            val,
                            selectedType === Type.Amount ? setColumn : setColumnGap
                          )
                        }
                        step={1}
                        precision={0}
                        addonAfter={selectedType === Type.Amount ? undefined : 'mm'}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col className={styles.col} span={12}>
                  <Row gutter={[0, 12]} align="middle">
                    <Col className={styles.title} span={24}>
                      {lang.curve_engraving.set_object_height}
                    </Col>
                    <Col className={styles.info} span={24}>
                      {lang.curve_engraving.set_object_height_desc}
                    </Col>
                    <Col span={12}>
                      <InputNumber<number>
                        type="number"
                        value={objectHeight}
                        min={0}
                        onChange={(val) => checkAndUpdate(val, setObjectHeight)}
                        step={1}
                        precision={0}
                        addonAfter="mm"
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
            {lang.curve_engraving.measure_area_help}
          </button>
        </>
      )}
      {isMeasuring && <div>{progressText}</div>}
    </Modal>
  );
};

export default MeasureArea;

export const showMeasureArea = (bbox: BBox): Promise<MeasureData | null> => {
  if (isIdExist('measure-area')) popDialogById('measure-area');
  return new Promise<MeasureData | null>((resolve) => {
    addDialogComponent(
      'measure-area',
      <MeasureArea
        bbox={bbox}
        onFinished={(data) => {
          resolve(data);
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
