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
import { extrinsicRegression, setFisheyeConfig, updateData } from 'helpers/camera-calibration-helper';

import CheckDraftingData from './AdorCalibrationV2/CheckDraftingData';
import CheckPictures from './AdorCalibrationV2/CheckPictures';
import FindCorner from './AdorCalibrationV2/FindCorner';
import Instruction from './AdorCalibration/Instruction';
import SolvePnP from './AdorCalibrationV2/SolvePnP';
import { getMaterialHeight, prepareToTakePicture, saveDraftingParameters } from './AdorCalibrationV2/utils';

enum Step {
  ASK_CAMERA_TYPE = 0,
  CHECK_DRAFTING_DATA = 1,
  CHECK_PICTURE = 2,
  PUT_PAPER = 3,
  FIND_CORNER = 4,
  SOLVE_PNP_1 = 5,
  ELVATED_CUT = 6,
  SOLVE_PNP_2 = 7,
  FINISH = 8,
}

const PROGRESS_ID = 'fisheye-calibration-v2';
const DIALOG_ID = 'fisheye-calibration-v2';

interface Props {
  onClose: (completed?: boolean) => void;
}

const AdorCalibrationV2 = ({ onClose }: Props): JSX.Element => {
  const calibratingParam = useRef<FisheyeCameraParametersV2Cali>({});
  const lang = useI18n();
  const tCali = lang.calibration;
  const [withPitch, setWithPitch] = useState(false);
  const [step, setStep] = useState<Step>(Step.ASK_CAMERA_TYPE);
  const [usePreviousData, setUsePreviousData] = useState(false);
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
  if (step === Step.CHECK_DRAFTING_DATA) {
    return (
      <CheckDraftingData
        updateParam={updateParam}
        onNext={(res) => {
          if (res) {
            setUsePreviousData(true);
            console.log('calibratingParam.current', calibratingParam.current);
            if (calibratingParam.current.heights?.length > 0) setStep(Step.ELVATED_CUT);
            else setStep(Step.PUT_PAPER);
          } else onNext();
        }}
        onClose={onClose}
      />
    );
  }
  if (step === Step.CHECK_PICTURE) {
    return (
      <CheckPictures
        updateParam={updateParam}
        onNext={async (res) => {
          if (res) {
            await saveDraftingParameters(calibratingParam.current);
            setUsePreviousData(true);
          }
          onNext();
        }}
        onClose={onClose}
      />
    );
  }
  if (step === Step.PUT_PAPER) {
    const handleNext = async (doCutting = true) => {
      progressCaller.openNonstopProgress({
        id: PROGRESS_ID,
        message: 'tGetting plane height',
      });
      try {
        const height = await getMaterialHeight();
        console.log('height', height);
        if (usePreviousData) {
          const dh = height - calibratingParam.current.refHeight;
          calibratingParam.current.dh = dh;
        } else {
          calibratingParam.current.refHeight = height;
        }
        progressCaller.update(PROGRESS_ID, { message: tCali.drawing_calibration_image });
        if (doCutting) {
          if (usePreviousData) await deviceMaster.doAdorCalibrationV2(2);
          else await deviceMaster.doAdorCalibrationV2(1, withPitch);
        }
        progressCaller.update(PROGRESS_ID, { message: 'tPreparing to taking picture' });
        await prepareToTakePicture();
        setStep(usePreviousData ? Step.SOLVE_PNP_1 : Step.FIND_CORNER);
      } catch (err) {
        console.error(err);
      } finally {
        progressCaller.popById(PROGRESS_ID);
      }
    };
    return (
      <Instruction
        onClose={() => onClose(false)}
        animationSrcs={[
          { src: 'video/ador-put-paper.webm', type: 'video/webm' },
          { src: 'video/ador-put-paper.mp4', type: 'video/mp4' },
        ]}
        title={
          usePreviousData
            ? 'Please put paper at the center of workarea'
            : 'Please put paper to cover the whole work area'
        }
        buttons={[
          { label: tCali.back, onClick: () => setStep(Step.CHECK_DRAFTING_DATA) },
          { label: tCali.skip, onClick: () => handleNext(false) },
          {
            label: tCali.start_engrave,
            onClick: () => handleNext(true),
            type: 'primary',
          },
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
        onBack={() => setStep(Step.PUT_PAPER)}
        onNext={async () => {
          await saveDraftingParameters(calibratingParam.current);
          setStep(Step.ELVATED_CUT);
        }}
      />
    );
  if (step === Step.SOLVE_PNP_1) {
    return (
      <SolvePnP
        hasNext
        params={calibratingParam.current}
        onClose={onClose}
        onBack={() => setStep(Step.PUT_PAPER)}
        onNext={async (rvec, tvec) => {
          updateParam({
            rvec,
            tvec,
            rvecs: [rvec],
            tvecs: [tvec],
            heights: [calibratingParam.current.dh],
          });
          await updateData(calibratingParam.current);
          await saveDraftingParameters(calibratingParam.current);
          console.log('calibratingParam.current', calibratingParam.current);
          setStep(Step.ELVATED_CUT);
        }}
      />
    );
  }
  if (step === Step.ELVATED_CUT) {
    const handleNext = async () => {
      progressCaller.openNonstopProgress({
        id: PROGRESS_ID,
        message: 'tGetting plane height',
      });
      try {
        const height = await getMaterialHeight();
        console.log('height', height);
        const dh = height - calibratingParam.current.refHeight;
        console.log('dh', dh);
        calibratingParam.current.dh = dh;
        progressCaller.update(PROGRESS_ID, { message: tCali.drawing_calibration_image });
        await deviceMaster.doAdorCalibrationV2(2, withPitch);
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
        animationSrcs={[]}
        onClose={() => onClose(true)}
        title="Please put material about 15mm at the center of the work area"
        buttons={[
          { label: tCali.back, onClick: () => setStep(Step.PUT_PAPER) },
          {
            label: tCali.start_engrave,
            onClick: () => handleNext(),
            type: 'primary',
          },
        ]}
      />
    );
  }
  return (
    <SolvePnP
      params={calibratingParam.current}
      onClose={onClose}
      onBack={onBack}
      onNext={async (rvec, tvec) => {
        const { rvecs, tvecs, heights } = calibratingParam.current;
        rvecs.push(rvec);
        tvecs.push(tvec);
        heights.push(calibratingParam.current.dh);
        updateParam({ rvecs, tvecs, heights });
        const { success, data } = await extrinsicRegression(rvecs, tvecs, heights);
        if (!success) {
          alertCaller.popUpError({ message: 'Failed to do extrinsic regression.' });
          return;
        }
        updateParam(data);
        console.log('calibratingParam.current', calibratingParam.current);
        const param: FisheyeCameraParametersV2 = {
          source: calibratingParam.current.source,
          k: calibratingParam.current.k,
          d: calibratingParam.current.d,
          refHeight: calibratingParam.current.refHeight,
          rvec: calibratingParam.current.rvec,
          tvec: calibratingParam.current.tvec,
          rvec_polyfit: calibratingParam.current.rvec_polyfit,
          tvec_polyfit: calibratingParam.current.tvec_polyfit,
          levelingData: calibratingParam.current.levelingData,
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
