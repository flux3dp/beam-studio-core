import React, { useCallback, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import dialogCaller from 'app/actions/dialog-caller';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import {
  FisheyeCameraParametersV2,
  FisheyeCameraParametersV2Cali,
} from 'interfaces/FisheyePreview';
import { setFisheyeConfig } from 'helpers/camera-calibration-helper';

import FindCorner from './AdorCalibrationV2/FindCorner';
import Instruction from './AdorCalibration/Instruction';
import SolvePnP from './AdorCalibrationV2/SolvePnP';
import { getMaterialHeight, prepareToTakePicture } from './AdorCalibrationV2/utils';

enum Step {
  ASK_CAMERA_TYPE = 0,
  PUT_PAPER = 1,
  FOCUS_AND_CUT = 2,
  FIND_CORNER = 3,
  ELVATED_CUT = 4,
  CAL_CAM_POS = 5,
  FINISH = 6,
}

const calibrated = new Set<string>();
const PROGRESS_ID = 'fish-eye-calibration-v2';
const DIALOG_ID = 'fish-eye-calibration-v2';

interface Props {
  onClose: (completed?: boolean) => void;
}

const AdorCalibrationV2 = ({ onClose }: Props): JSX.Element => {
  const calibratingParam = useRef<FisheyeCameraParametersV2Cali>({});
  const lang = useI18n().calibration;
  const [withPitch, setWithPitch] = useState(false);
  const [step, setStep] = useState<Step>(Step.ASK_CAMERA_TYPE);
  const onBack = useCallback(() => setStep((prev) => prev - 1), []);
  const onNext = useCallback(() => setStep((prev) => prev + 1), []);
  const updateParam = useCallback((param: FisheyeCameraParametersV2Cali) => {
    calibratingParam.current = { ...calibratingParam.current, ...param };
  }, []);
  if (step === Step.ASK_CAMERA_TYPE) {
    const onClick = (val: boolean) => {
      setWithPitch(val);
      onNext();
    };
    return (
      <Instruction
        onClose={() => onClose(false)}
        animationSrcs={[]}
        title="Please Select your camera type"
        buttons={[
          { label: '正拍', type: 'primary', onClick: () => onClick(false) },
          { label: '斜拍', type: 'primary', onClick: () => onClick(true) },
        ]}
      />
    );
  }
  if (step === Step.PUT_PAPER) {
    console.log('TODO: add v2 put paper animation and text');
    return (
      <Instruction
        onClose={() => onClose(false)}
        animationSrcs={[
          { src: 'video/ador-put-paper.webm', type: 'video/webm' },
          { src: 'video/ador-put-paper.mp4', type: 'video/mp4' },
        ]}
        title="Please put paper to cover the whole work area"
        buttons={[{ label: 'Next', type: 'primary', onClick: onNext }]}
      />
    );
  }
  if (step === Step.FOCUS_AND_CUT) {
    const handleNext = async (doCutting = true) => {
      progressCaller.openNonstopProgress({
        id: PROGRESS_ID,
        message: 'tGetting plane height',
      });
      try {
        const refHeight = await getMaterialHeight();
        console.log('refHeight', refHeight);
        calibratingParam.current.refHeight = refHeight;
        progressCaller.update(PROGRESS_ID, { message: lang.drawing_calibration_image });
        if (doCutting) await deviceMaster.doAdorCalibrationV2(1, withPitch);
        progressCaller.update(PROGRESS_ID, { message: 'tPreparing to taking picture' });
        await prepareToTakePicture();
        onNext();
      } catch (err) {
        console.error(err);
      } finally {
        progressCaller.popById(PROGRESS_ID);
      }
    };
    return (
      <Instruction
        onClose={() => onClose(false)}
        title={lang.camera_calibration}
        text={lang.ador_autofocus_material}
        buttons={[
          { label: lang.back, onClick: onBack },
          { label: lang.skip, onClick: () => handleNext(false) },
          {
            label: lang.start_engrave,
            onClick: () => handleNext(true),
            type: 'primary',
          },
        ]}
        animationSrcs={[
          { src: 'video/ador-focus-laser.webm', type: 'video/webm' },
          { src: 'video/ador-focus-laser.mp4', type: 'video/mp4' },
        ]}
      />
    );
  }
  if (step === Step.FIND_CORNER)
    return (
      <FindCorner
        withPitch={withPitch}
        updateParam={updateParam}
        onClose={onClose}
        onBack={onBack}
        onNext={onNext}
      />
    );
  if (step === Step.ELVATED_CUT) {
    return (
      <Instruction
        animationSrcs={[]}
        onClose={() => onClose(true)}
        title="Please put material about 10mm at the center of the work area"
        buttons={[
          {
            label: 'Next',
            type: 'primary',
            onClick: async () => {
              progressCaller.openNonstopProgress({
                id: PROGRESS_ID,
                message: 'tGetting plane height',
              });
              try {
                const elevatedHeight = await getMaterialHeight();
                const dh = elevatedHeight - calibratingParam.current.refHeight;
                console.log('dh', dh);
                calibratingParam.current.dh = dh;
                progressCaller.update(PROGRESS_ID, { message: lang.drawing_calibration_image });
                await deviceMaster.doAdorCalibrationV2(2, withPitch);
                progressCaller.update(PROGRESS_ID, { message: 'tPreparing to taking picture' });
                await prepareToTakePicture();
                onNext();
              } catch (err) {
                console.error(err);
              } finally {
                progressCaller.popById(PROGRESS_ID);
              }
            },
          },
        ]}
      />
    );
  }
  return (
    <SolvePnP
      dh={calibratingParam.current.dh}
      updateParam={updateParam}
      onClose={onClose}
      onBack={onBack}
      onFinish={async () => {
        console.log('calibratingParam.current', calibratingParam.current);
        const param: FisheyeCameraParametersV2 = {
          k: calibratingParam.current.k,
          d: calibratingParam.current.d,
          refHeight: calibratingParam.current.refHeight,
          rvec: calibratingParam.current.rvec,
          tvec: calibratingParam.current.tvec,
          rvec_polyfit: calibratingParam.current.rvec_polyfit,
          tvec_polyfit: calibratingParam.current.tvec_polyfit,
          v: 2,
        };
        const res = await setFisheyeConfig(param);
        console.log(res);
        if (res.status === 'ok') {
          alertCaller.popUp({ message: 'Camera parameters saved successfully.' });
          onClose(true);
        } else {
          alertCaller.popUpError({
            message: `Failed to save camera parameters. ${JSON.stringify(res)}`,
          });
        }
      }}
    />
  );
};

export const showAdorCalibrationV2 = async (): Promise<boolean> => {
  if (dialogCaller.isIdExist(DIALOG_ID)) return false;
  return new Promise((resolve) => {
    dialogCaller.addDialogComponent(
      DIALOG_ID,
      <AdorCalibrationV2
        onClose={(completed = false) => {
          dialogCaller.popDialogById(DIALOG_ID);
          resolve(completed);
        }}
      />
    );
  });
};

export default AdorCalibrationV2;
