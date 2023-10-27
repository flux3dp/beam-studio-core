import React, { useEffect, useMemo, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import dialogCaller from 'app/actions/dialog-caller';
import deviceMaster from 'helpers/device-master';
import isDev from 'helpers/is-dev';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import {
  addFisheyeCalibrateImg,
  calculateRegressionParam,
  doFishEyeCalibration,
  startFisheyeCalibrate,
} from 'helpers/camera-calibration-helper';
import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';

import Align from './AdorCalibration/Align';
import Calibrate from './AdorCalibration/Calibrate';
import CalibrationType from './AdorCalibration/calibrationTypes';
import Instruction from './AdorCalibration/Instruction';

const PROGRESS_ID = 'fish-eye-calibration';
const DIALOG_ID = 'fish-eye-calibration';

enum Step {
  WAITING = 0,
  CALIBRATE = 1,
  PUT_PAPER = 2,
  FOCUS_AND_CUT = 3,
  ALIGN = 4,
}

interface Props {
  type?: CalibrationType;
  onClose: (completed?: boolean) => void;
}

const calibrated = {
  [CalibrationType.CAMERA]: new Set<string>(),
  [CalibrationType.PRINTER_HEAD]: new Set<string>(),
  [CalibrationType.IR_LASER]: new Set<string>(),
};

// TODO: add unit test
const AdorCalibration = ({ type = CalibrationType.CAMERA, onClose }: Props): JSX.Element => {
  const isDevMode = isDev();
  const lang = useI18n().calibration;
  const param = useRef<FisheyeCameraParameters>({} as any);
  const [step, setStep] = useState<Step>(Step.WAITING);
  const currentDeviceId = useMemo(() => deviceMaster.currentDevice.info.uuid, []);
  const checkFirstStep = async () => {
    let fisheyeParameters: FisheyeCameraParameters = null;
    try {
      fisheyeParameters = await deviceMaster.fetchFisheyeParams();
    } catch (err) {
      // do nothing
    }
    if (!fisheyeParameters) {
      if (type === CalibrationType.CAMERA) {
        setStep(Step.CALIBRATE);
        return;
      }
      alertCaller.popUp({ message: lang.calibrate_camera_before_calibrate_modules });
      onClose(false);
      return;
    }
    if (type === CalibrationType.CAMERA && isDevMode) {
      const res = await new Promise<boolean>((resolve) => {
        alertCaller.popUp({
          message: 'Skip Caculating?',
          buttonType: alertConstants.YES_NO,
          onYes: () => resolve(true),
          onNo: () => resolve(false),
        });
      });
      if (!res) {
        setStep(Step.CALIBRATE);
        return;
      }
    }
    const { k, d, heights, points, z3regParam, center } = fisheyeParameters;
    param.current = { ...param.current, k, d, heights, points, z3regParam, center };
    if (calibrated[type].has(currentDeviceId)) {
      const res = await new Promise<boolean>((resolve) => {
        alertCaller.popUp({
          message: lang.ask_for_readjust,
          buttonType: alertConstants.CUSTOM_CANCEL,
          buttonLabels: [lang.skip],
          callbacks: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (res) {
        setStep(Step.ALIGN);
        return;
      }
    }
    setStep(Step.PUT_PAPER);
  };

  useEffect(() => {
    if (step === Step.WAITING) checkFirstStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: can be moved out of this component
  const handleMultiHeightCalibrateNext = async (imgs: { height: number; blob: Blob }[]) => {
    try {
      progressCaller.openSteppingProgress({
        id: PROGRESS_ID,
        message: lang.uploading_images,
        percentage: 0,
      });
      await startFisheyeCalibrate();
      for (let i = 0; i < imgs.length; i += 1) {
        const { height, blob } = imgs[i];
        // eslint-disable-next-line no-await-in-loop
        await addFisheyeCalibrateImg(height, blob);
        progressCaller.update(PROGRESS_ID, {
          message: lang.uploading_images,
          percentage: Math.round(100 * ((i + 1) / imgs.length)),
        });
      }
      progressCaller.popById(PROGRESS_ID);
      progressCaller.openSteppingProgress({
        id: PROGRESS_ID,
        message: lang.calculating_camera_matrix,
      });
      const { k, d } = await doFishEyeCalibration((val) => {
        progressCaller.update(PROGRESS_ID, {
          message: lang.calculating_camera_matrix,
          percentage: Math.round(100 * val),
        });
      });
      progressCaller.popById(PROGRESS_ID);
      progressCaller.openSteppingProgress({
        id: PROGRESS_ID,
        message: lang.calculating_regression_parameters,
      });
      const { data, errors } = await calculateRegressionParam((val) => {
        progressCaller.update(PROGRESS_ID, {
          message: lang.calculating_regression_parameters,
          percentage: Math.round(100 * val),
        });
      });
      param.current = { ...param.current, k, d, z3regParam: data };
      setStep(Step.PUT_PAPER);
      if (errors.length > 0) {
        console.log(errors);
        if (isDevMode) {
          const errorHeights = errors.map((e) => e.height).join(', ');
          alertCaller.popUp({
            message: `Unable to find perspective points for heights: ${errorHeights}`,
          });
        }
      }
    } catch (e) {
      alertCaller.popUp({ message: `${lang.failed_to_calibrate_camera}: ${e}` });
    } finally {
      progressCaller.popById(PROGRESS_ID);
    }
  };

  switch (step) {
    case Step.CALIBRATE:
      return <Calibrate onClose={onClose} onNext={handleMultiHeightCalibrateNext} />;
    case Step.ALIGN:
      return (
        <Align
          type={type}
          fisheyeParam={param.current}
          onBack={() => setStep(Step.FOCUS_AND_CUT)}
          onClose={onClose}
        />
      );
    case Step.PUT_PAPER:
      return (
        <Instruction
          onClose={() => onClose(false)}
          title={lang.camera_calibration}
          text={
            type === CalibrationType.IR_LASER
              ? lang.please_place_black_acrylic
              : lang.please_place_paper_center
          }
          buttons={[
            { label: lang.next, onClick: () => setStep(Step.FOCUS_AND_CUT), type: 'primary' },
          ]}
          animationSrcs={
            type === CalibrationType.IR_LASER
              ? [
                  { src: 'video/put_black_acrylic.webm', type: 'video/webm' },
                  { src: 'video/put_black_acrylic.mp4', type: 'video/mp4' },
                ]
              : [
                  { src: 'video/put_paper.webm', type: 'video/webm' },
                  { src: 'video/put_paper.mp4', type: 'video/mp4' },
                ]
          }
        />
      );
    case Step.FOCUS_AND_CUT:
      return (
        <Instruction
          onClose={() => onClose(false)}
          title={lang.camera_calibration}
          text={lang.ador_autofocus}
          buttons={[
            { label: lang.back, onClick: () => setStep(Step.PUT_PAPER) },
            {
              label:
                type === CalibrationType.PRINTER_HEAD ? lang.start_printing : lang.start_engrave,
              onClick: async () => {
                progressCaller.openNonstopProgress({
                  id: PROGRESS_ID,
                  message: lang.drawing_calibration_image,
                });
                try {
                  if (type === CalibrationType.CAMERA) await deviceMaster.doAdorCalibrationCut();
                  else if (type === CalibrationType.PRINTER_HEAD)
                    await deviceMaster.doAdorPrinterCalibration();
                  else await deviceMaster.doAdorIRCalibration();
                  calibrated[type].add(currentDeviceId);
                  setStep(Step.ALIGN);
                } finally {
                  progressCaller.popById(PROGRESS_ID);
                }
              },
              type: 'primary',
            },
          ]}
          animationSrcs={
            type === CalibrationType.PRINTER_HEAD
              ? [
                  { src: 'video/ador-focus-printer.webm', type: 'video/webm' },
                  { src: 'video/ador-focus-printer.mp4', type: 'video/mp4' },
                ]
              : [
                  { src: 'video/ador-focus-laser.webm', type: 'video/webm' },
                  { src: 'video/ador-focus-laser.mp4', type: 'video/mp4' },
                ]
          }
        />
      );
    default:
      return null;
  }
};

export const showAdorCalibration = async (
  type: CalibrationType = CalibrationType.CAMERA
): Promise<boolean> => {
  if (dialogCaller.isIdExist(DIALOG_ID)) return false;
  return new Promise((resolve) => {
    dialogCaller.addDialogComponent(
      DIALOG_ID,
      <AdorCalibration
        type={type}
        onClose={(completed = false) => {
          dialogCaller.popDialogById(DIALOG_ID);
          resolve(completed);
        }}
      />
    );
    resolve(true);
  });
};

export default AdorCalibration;
