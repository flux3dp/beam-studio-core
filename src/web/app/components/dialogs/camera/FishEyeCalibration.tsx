import React, { useCallback, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import dialogCaller from 'app/actions/dialog-caller';
import progressCaller from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import {
  addFisheyeCalibrateImg,
  doFishEyeCalibration,
  findPerspectivePoints,
  startFisheyeCalibrate
} from 'helpers/camera-calibration-helper';
import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';
import { IDeviceInfo } from 'interfaces/IDevice';

import Align from './FishEyeCalibration/Align';
import Calibrate from './FishEyeCalibration/Calibrate';
import Cut from './FishEyeCalibration/Cut';

const PROGRESS_ID = 'fish-eye-calibration';
const DIALOG_ID = 'fish-eye-calibration';

enum Step {
  CALIBRATE = 1,
  CUT = 2,
  ALIGN = 3,
}

interface Props {
  device: IDeviceInfo;
  step?: Step;
  onClose: (completed?: boolean) => void;
}

// TODO: add unit test
const FishEyeCalibration = ({ device, step: initStep = Step.CALIBRATE, onClose }: Props): JSX.Element => {
  // TODO: save in machine firmware
  const param = useRef<FisheyeCameraParameters>({} as any);
  const [step, setStep] = useState<Step>(initStep);

  const handleCalibrateNext = async (img: Blob) => {
    try {
      progressCaller.openNonstopProgress({ id: PROGRESS_ID, message: 'tCalculating Camera Matrix' });
      await startFisheyeCalibrate();
      await addFisheyeCalibrateImg(img);
      const { k, d } = await doFishEyeCalibration();
      const { points } = await findPerspectivePoints(img);
      param.current = { ...param.current, k, d, corners: points };
      setStep(Step.CUT);
    } catch (e) {
      alertCaller.popUp({ message: `tUnable to calibrate camera ${e}` });
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
  };

  const handleCutNext = useCallback(() => setStep(Step.ALIGN), []);
  const handleCutBack = useCallback(() => setStep(Step.CALIBRATE), []);

  const handleAlignBack = useCallback(() => setStep(Step.CUT), []);
  const handleAlignNext = useCallback((x: number, y: number) => {
    param.current = { ...param.current, cx: x, cy: y };
    const currentStorage = storage.get('fisheye-calibration') || {};
    // TODO: save in machine firmware
    storage.set('fisheye-calibration', {
      ...currentStorage,
      [device.uuid]: {
        ...param.current,
      },
    });
    console.log(param.current);
    onClose(true);
  }, [device.uuid, onClose]);

  switch (step) {
    case Step.CALIBRATE:
      return (
        <Calibrate
          onClose={onClose}
          onNext={handleCalibrateNext}
        />
      );
    case Step.CUT:
      return (
        <Cut onBack={handleCutBack} onClose={onClose} onNext={handleCutNext} />
      );
    case Step.ALIGN:
      return (
        <Align
          fisheyeParam={param.current}
          onBack={handleAlignBack}
          onNext={handleAlignNext}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
};

export const showFishEyeCalibration = async (device: IDeviceInfo): Promise<boolean> => {
  if (dialogCaller.isIdExist(DIALOG_ID)) return false;
  return new Promise((resolve) => {
    dialogCaller.addDialogComponent(
      DIALOG_ID,
      <FishEyeCalibration
        device={device}
        onClose={(completed = false) => {
          dialogCaller.popDialogById(DIALOG_ID);
          resolve(completed);
        }}
      />
    );
    resolve(true);
  });
};

export default FishEyeCalibration;
