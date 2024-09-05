import React, { useCallback, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import checkDeviceStatus from 'helpers/check-device-status';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import {
  FisheyeCameraParametersV3,
  FisheyeCameraParametersV3Cali,
} from 'interfaces/FisheyePreview';
import { setFisheyeConfig } from 'helpers/camera-calibration-helper';

import CheckpointData from './common/CheckpointData';
import Chessboard from './BB2Calibration/Chessboard';
import Instruction from './common/Instruction';
import moveLaserHead from './BB2Calibration/moveLaserHead';
import SolvePnP from './common/SolvePnP';

enum Steps {
  CHECKPOINT_DATA = 0,
  PRE_CHESSBOARD = 1,
  CHESSBOARD = 2,
  PUT_PAPER = 3,
  SOLVE_PNP = 4,
}

interface Props {
  onClose: (completed?: boolean) => void;
}

const PROGRESS_ID = 'bb2-calibration';
const BB2Calibration = ({ onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const tCali = lang.calibration;
  const calibratingParam = useRef<FisheyeCameraParametersV3Cali>({});
  const [step, setStep] = useState<Steps>(Steps.CHECKPOINT_DATA);
  const updateParam = useCallback((param: FisheyeCameraParametersV3Cali) => {
    calibratingParam.current = { ...calibratingParam.current, ...param };
  }, []);

  if (step === Steps.CHECKPOINT_DATA) {
    return (
      <CheckpointData
        allowCheckPoint={false}
        updateParam={updateParam}
        onClose={onClose}
        onNext={(res: boolean) => {
          console.log('res', res);
          if (!res) setStep(Steps.PRE_CHESSBOARD);
          else onClose(res);
        }}
      />
    );
  }
  if (step === Steps.PRE_CHESSBOARD) {
    return (
      <Instruction
        title="tPut Chessboard"
        steps={['tPlease place the chessboard in the center of workarea']}
        buttons={[
          { label: tCali.cancel, onClick: () => onClose(false) },
          {
            label: tCali.next,
            onClick: async () => {
              const res = await moveLaserHead();
              if (res) setStep(Steps.CHESSBOARD);
            },
            type: 'primary',
          },
        ]}
        onClose={onClose}
      />
    );
  }
  if (step === Steps.CHESSBOARD) {
    return (
      <Chessboard
        updateParam={updateParam}
        onNext={() => setStep(Steps.PUT_PAPER)}
        onClose={onClose}
      />
    );
  }
  if (step === Steps.PUT_PAPER) {
    const handleNext = async () => {
      const deviceStatus = await checkDeviceStatus(deviceMaster.currentDevice.info);
      if (!deviceStatus) return;
      try {
        progressCaller.update(PROGRESS_ID, { message: tCali.drawing_calibration_image });
        console.log('TODO: bb2 calibration file');
        await deviceMaster.doBB2Calibration();
        progressCaller.update(PROGRESS_ID, { message: tCali.preparing_to_take_picture });
        const res = await moveLaserHead();
        if (!res) return;
        setStep(Steps.SOLVE_PNP);
      } catch (err) {
        console.error(err);
      } finally {
        progressCaller.popById(PROGRESS_ID);
      }
    };
    return (
      <Instruction
        onClose={() => onClose(false)}
        // TODO: animation
        animationSrcs={[
          { src: 'video/ador-calibration-2/paper.webm', type: 'video/webm' },
          { src: 'video/ador-calibration-2/paper.mp4', type: 'video/mp4' },
        ]}
        title={tCali.put_paper}
        steps={[tCali.put_paper_step1, tCali.put_paper_step2, tCali.put_paper_step3]}
        buttons={[
          { label: tCali.back, onClick: () => setStep(Steps.CHESSBOARD) },
          { label: tCali.start_engrave, onClick: () => handleNext(), type: 'primary' },
        ]}
      />
    );
  }
  if (step === Steps.SOLVE_PNP) {
    return (
      <SolvePnP
        params={calibratingParam.current}
        dh={0}
        version={3}
        onClose={onClose}
        onBack={() => setStep(Steps.PUT_PAPER)}
        onNext={async (rvec, tvec) => {
          progressCaller.openNonstopProgress({ id: PROGRESS_ID, message: lang.device.processing });
          updateParam({ rvec, tvec });
          console.log('calibratingParam.current', calibratingParam.current);
          progressCaller.popById(PROGRESS_ID);
          const param: FisheyeCameraParametersV3 = {
            k: calibratingParam.current.k,
            d: calibratingParam.current.d,
            rvec,
            tvec,
            v: 3,
          };
          const res = await setFisheyeConfig(param);
          console.log(res);
          if (res.status === 'ok') {
            alertCaller.popUp({ message: tCali.camera_parameter_saved_successfully });
            onClose(true);
          } else {
            alertCaller.popUpError({
              message: `${tCali.failed_to_save_camera_parameter}:<br />${JSON.stringify(res)}`,
            });
          }
        }}
      />
    );
  }

  onClose();
  return <></>;
};

export const showBB2Calibration = (): Promise<boolean> => {
  const id = 'bb2-calibration';
  const onClose = () => popDialogById(id);
  if (isIdExist(id)) onClose();
  return new Promise<boolean>((resolve) => {
    addDialogComponent(
      id,
      <BB2Calibration
        onClose={(completed = false) => {
          onClose();
          resolve(completed);
        }}
      />
    );
  });
};

export default BB2Calibration;
