import { Dispatch, useCallback, useEffect, useState } from 'react';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import i18n from 'helpers/i18n';
import { IConfigSetting } from 'interfaces/IDevice';

const useCamera = (
  handleImg?: (blob: Blob) => Promise<boolean> | boolean
): {
  exposureSetting: IConfigSetting | null;
  setExposureSetting: Dispatch<IConfigSetting | null>;
  handleTakePicture: (opts?: { retryTimes?: number; silent?: boolean }) => void;
} => {
  const [exposureSetting, setExposureSetting] = useState<IConfigSetting | null>(null);
  const handleTakePicture = useCallback(
    async (opts?: { retryTimes?: number; silent?: boolean }) => {
      const { retryTimes = 0, silent = false } = opts || {};
      if (!silent)
        progressCaller.openNonstopProgress({
          id: 'use-camera',
          message: i18n.lang.calibration.taking_picture,
        });
      const { imgBlob } = (await deviceMaster.takeOnePicture()) || {};
      if (!imgBlob) {
        if (retryTimes < 3) return handleTakePicture({ retryTimes: retryTimes + 1, silent });
        alertCaller.popUpError({ message: 'Unable to get image' });
        return null;
      }
      if (handleImg) {
        const res = await handleImg(imgBlob);
        if (!res && retryTimes < 3)
          return handleTakePicture({ retryTimes: retryTimes + 1, silent });
      }
      if (!silent) progressCaller.popById('use-camera');
      return imgBlob;
    },
    [handleImg]
  );

  useEffect(() => {
    const initSetup = async () => {
      progressCaller.openNonstopProgress({
        id: 'use-camera',
        message: i18n.lang.calibration.taking_picture,
      });
      try {
        await deviceMaster.connectCamera();
        const exposureRes = await deviceMaster.getDeviceSetting('camera_exposure_absolute');
        setExposureSetting(JSON.parse(exposureRes.value));
        handleTakePicture();
      } finally {
        progressCaller.popById('use-camera');
      }
    };
    initSetup();
    return () => {
      deviceMaster.disconnectCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { exposureSetting, setExposureSetting, handleTakePicture };
};

export default useCamera;
