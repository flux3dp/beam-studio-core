import React, { useCallback, useMemo, useRef, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import checkDeviceStatus from 'helpers/check-device-status';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import promarkDataStore from 'helpers/device/promark/promark-data-store';
import useI18n from 'helpers/useI18n';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';
import {
  FisheyeCameraParametersV3,
  FisheyeCameraParametersV3Cali,
} from 'interfaces/FisheyePreview';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { loadCameraCalibrationTask } from 'helpers/device/promark/calibration';

import CheckpointData from './common/CheckpointData';
import Chessboard from './Promark/Chessboard';
import Instruction from './common/Instruction';
import SolvePnP from './common/SolvePnP';
import { promarkPnPPoints } from './common/solvePnPConstants';

enum Steps {
  CHECKPOINT_DATA = 0,
  PRE_CHESSBOARD = 1,
  CHESSBOARD = 2,
  PUT_PAPER = 3,
  SOLVE_PNP = 4,
}

interface Props {
  device: IDeviceInfo;
  onClose: (completed?: boolean) => void;
}

const PROGRESS_ID = 'promark-calibration';
const PromarkCalibration = ({ device: { serial, model }, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const tCali = lang.calibration;
  const workareaWidth = useMemo(() => getWorkarea(model).width, [model]);
  const calibratingParam = useRef<FisheyeCameraParametersV3Cali>({});
  const useOldData = useRef(false);
  const [step, setStep] = useState<Steps>(Steps.CHECKPOINT_DATA);
  const updateParam = useCallback((param: FisheyeCameraParametersV3Cali) => {
    calibratingParam.current = { ...calibratingParam.current, ...param };
  }, []);

  if (step === Steps.CHECKPOINT_DATA) {
    return (
      <CheckpointData
        askUser
        allowCheckPoint={false}
        updateParam={updateParam}
        getData={() => promarkDataStore.get(serial, 'cameraParameters')}
        onClose={onClose}
        onNext={(res: boolean) => {
          if (res) {
            useOldData.current = true;
            setStep(Steps.PUT_PAPER);
          } else setStep(Steps.PRE_CHESSBOARD);
        }}
      />
    );
  }
  if (step === Steps.PRE_CHESSBOARD) {
    return (
      <Instruction
        title={tCali.put_chessboard}
        steps={[tCali.put_chessboard_desc]}
        buttons={[
          { label: tCali.back, onClick: () => setStep(Steps.CHECKPOINT_DATA) },
          {
            label: tCali.next,
            onClick: () => setStep(Steps.CHESSBOARD),
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
        chessboard={[19, 19]}
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
        progressCaller.openNonstopProgress({
          id: PROGRESS_ID,
          message: tCali.drawing_calibration_image,
        });
        await loadCameraCalibrationTask(model, workareaWidth);
        await deviceMaster.doPromarkCalibration();
        progressCaller.update(PROGRESS_ID, { message: tCali.preparing_to_take_picture });
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
        steps={[tCali.put_paper_step1, tCali.put_paper_step2, tCali.perform_autofocus_bb2]}
        buttons={[
          {
            label: tCali.back,
            onClick: () => setStep(useOldData.current ? Steps.CHECKPOINT_DATA : Steps.CHESSBOARD),
          },
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
        refPoints={promarkPnPPoints[workareaWidth]}
        imgSource="usb"
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
          promarkDataStore.set(serial, 'cameraParameters', param);
          alertCaller.popUp({ message: tCali.camera_parameter_saved_successfully });
          onClose(true);
        }}
      />
    );
  }

  onClose();
  return <></>;
};

export const showPromarkCalibration = (device: IDeviceInfo): Promise<boolean> => {
  const id = 'promark-calibration';
  const onClose = () => popDialogById(id);
  if (isIdExist(id)) onClose();
  return new Promise<boolean>((resolve) => {
    addDialogComponent(
      id,
      <PromarkCalibration
        device={device}
        onClose={(completed = false) => {
          onClose();
          resolve(completed);
        }}
      />
    );
  });
};

export default PromarkCalibration;
