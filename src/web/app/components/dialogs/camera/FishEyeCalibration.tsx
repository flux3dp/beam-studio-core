import React, { useCallback, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import dialogCaller from 'app/actions/dialog-caller';
import progressCaller from 'app/actions/progress-caller';
import {
  addFisheyeCalibrateImg,
  doFishEyeCalibration,
  findPerspectivePoints,
  setFisheyeConfig,
  startFisheyeCalibrate,
} from 'helpers/camera-calibration-helper';
import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';

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
  step?: Step;
  onClose: (completed?: boolean) => void;
}

// TODO: add unit test
const FishEyeCalibration = ({ step: initStep = Step.CALIBRATE, onClose }: Props): JSX.Element => {
  const param = useRef<FisheyeCameraParameters>({} as any);
  const [step, setStep] = useState<Step>(initStep);
  const handleMultiHeightCalibrateNext = async (imgs: { height: number; blob: Blob }[]) => {
    try {
      progressCaller.openSteppingProgress({ id: PROGRESS_ID, message: 'tUploading Images', percentage: 0 });
      await startFisheyeCalibrate();
      for (let i = 0; i < imgs.length; i += 1) {
        const { height, blob } = imgs[i];
        // eslint-disable-next-line no-await-in-loop
        await addFisheyeCalibrateImg(height, blob);
        progressCaller.update(PROGRESS_ID, {
          message: 'tUploading Images',
          percentage: Math.round(100 * ((i + 1) / imgs.length)),
        });
      }
      progressCaller.popById(PROGRESS_ID);
      progressCaller.openSteppingProgress({ id: PROGRESS_ID, message: 'Calculating Camera Matrix' });
      const { k, d } = await doFishEyeCalibration((val) => {
        progressCaller.update(PROGRESS_ID, {
          message: 'Calculating Camera Matrix',
          percentage: Math.round(100 * val),
        });
      });
      progressCaller.openSteppingProgress({ id: PROGRESS_ID, message: 'Finding Perspective Points' });
      const { points, heights, errors } = await findPerspectivePoints((val) => {
        progressCaller.update(PROGRESS_ID, {
          message: 'Finding Perspective Points',
          percentage: Math.round(100 * val),
        });
      });
      console.log(errors);
      param.current = { ...param.current, k, d, heights, points };
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
    param.current = { ...param.current, center: [x, y] };
    setFisheyeConfig(param.current);
    onClose(true);
  }, [onClose]);

  switch (step) {
    case Step.CALIBRATE:
      return (
        <Calibrate
          onClose={onClose}
          onNext={handleMultiHeightCalibrateNext}
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

export const showFishEyeCalibration = async (): Promise<boolean> => {
  if (dialogCaller.isIdExist(DIALOG_ID)) return false;
  return new Promise((resolve) => {
    dialogCaller.addDialogComponent(
      DIALOG_ID,
      <FishEyeCalibration
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
