import deviceMaster from 'helpers/device-master';
import progressCaller from 'app/actions/progress-caller';
import i18n from 'helpers/i18n';
import { FisheyeCameraParametersV2, FisheyePreviewManager } from 'interfaces/FisheyePreview';
import { IDeviceInfo } from 'interfaces/IDevice';

import FisheyePreviewManagerBase from './FisheyePreviewManagerBase';
import getAutoFocusPosition from './getAutoFocusPosition';
import getLevelingData from './getLevelingData';
import getHeight from './getHeight';
import rawAndHome from './rawAndHome';

// TODO: add test
class FisheyePreviewManagerV2 extends FisheyePreviewManagerBase implements FisheyePreviewManager {
  declare params: FisheyeCameraParametersV2;

  autoFocusRefKey: string;

  version = 2;

  constructor(device: IDeviceInfo, params: FisheyeCameraParametersV2) {
    super();
    this.device = device;
    this.params = params;
  }

  async setupFisheyePreview(progressId?: string): Promise<boolean> {
    const { lang } = i18n;
    if (!progressId) progressCaller.openNonstopProgress({ id: this.progressId });
    const device = deviceMaster.currentDevice.info;
    progressCaller.update(progressId || this.progressId, { message: 'Fetching leveling data...' });
    this.levelingData = await getLevelingData('bottom_cover');
    this.levelingOffset = await getLevelingData('offset');
    await rawAndHome(progressId || this.progressId);
    const height = await getHeight(device, progressId || this.progressId);
    if (typeof height !== 'number') return false;
    this.objectHeight = height;
    progressCaller.openNonstopProgress({
      id: progressId || this.progressId,
      message: lang.message.getProbePosition,
    });
    this.autoFocusRefKey = await getAutoFocusPosition(device);
    progressCaller.update(progressId || this.progressId, { message: lang.message.endingRawMode });
    await deviceMaster.endRawMode();
    // V2 calibration use point E as reference
    console.log(this.params);
    await deviceMaster.setFisheyeParam(this.params);
    this.onObjectHeightChanged();
    if (!progressId) progressCaller.popById(this.progressId);
    return true;
  }

  onObjectHeightChanged = async (): Promise<void> => {
    const { autoFocusRefKey, objectHeight, levelingData, levelingOffset } = this;
    const heightCompensation =
      levelingData[autoFocusRefKey] -
      levelingOffset[autoFocusRefKey] -
      (levelingData.E - levelingOffset.E);
    const finalHeight = objectHeight - heightCompensation;
    await deviceMaster.setFisheyeObjectHeight(finalHeight);
  };
}

export default FisheyePreviewManagerV2;
