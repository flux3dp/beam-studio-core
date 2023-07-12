import React, { useCallback, useEffect, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialogCaller from 'app/actions/dialog-caller';
import deviceMaster from 'helpers/device-master';
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
  WAITING = 0,
  CALIBRATE = 1,
  CUT = 2,
  ALIGN = 3,
}

interface Props {
  step?: Step;
  onClose: (completed?: boolean) => void;
}

// TODO: add unit test
const FishEyeCalibration = ({ step: initStep = Step.WAITING, onClose }: Props): JSX.Element => {
  const param = useRef<FisheyeCameraParameters>({} as any);
  const [step, setStep] = useState<Step>(initStep);
  const askSkipCalculation = async () => {
    let fisheyeParameters: FisheyeCameraParameters = null;
    try {
      fisheyeParameters = await deviceMaster.fetchFisheyeParams();
    } catch (err) {
      // do nothing
    }

    const res = await new Promise<boolean>((resolve) => {
      alertCaller.popUp({
        message: 'Skip Caculating?',
        buttonType: alertConstants.YES_NO,
        onYes: () => resolve(true),
        onNo: () => resolve(false),
      });
    });
    if (!res || !fisheyeParameters) {
      setStep(Step.CALIBRATE);
      return;
    }
    const { k, d, heights, points } = fisheyeParameters;
    param.current = { ...param.current, k, d, heights, points };
    setStep(Step.CUT);
  };

  useEffect(() => {
    if (step === Step.WAITING) askSkipCalculation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      progressCaller.popById(PROGRESS_ID);
      progressCaller.openSteppingProgress({ id: PROGRESS_ID, message: 'Calculating Perspective Points' });
      const { points, heights, errors } = await findPerspectivePoints((val) => {
        progressCaller.update(PROGRESS_ID, {
          message: 'Calculating Perspective Points',
          percentage: Math.round(100 * val),
        });
      });
      if (errors.length > 0) {
        console.log(errors);
        const errorHeights = errors.map((e) => e.height).join(', ');
        alertCaller.popUp({ message: `tUnable to find perspective points for heights: ${errorHeights}` });
      }
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
    try {
      setFisheyeConfig(param.current);
    } catch (err) {
      alertCaller.popUp({ message: `tUnable to save camera config ${err}` });
    }
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
