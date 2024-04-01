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
    const { device, params } = this;
    progressCaller.update(progressId || this.progressId, { message: 'Fetching leveling data...' });
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
    console.log(params);
    await deviceMaster.setFisheyeParam(params);
    await this.updateLevelingData();
    this.onObjectHeightChanged();
    if (!progressId) progressCaller.popById(this.progressId);
    return true;
  }

  updateLevelingData = async (): Promise<void> => {
    const data = { ...this.params.levelingData };
    const keys = Object.keys(data);
    keys.forEach((key) => {
      data[key] = Math.round((data[key] + this.levelingOffset[key] ?? 0) * 1000) / 1000;
    });
    await deviceMaster.setFisheyeLevelingData(this.levelingOffset);
  };

  async reloadLevelingOffset(): Promise<void> {
    this.levelingOffset = await getLevelingData('offset');
    await this.updateLevelingData();
    this.onObjectHeightChanged();
  }

  onObjectHeightChanged = async (): Promise<void> => {
    const { autoFocusRefKey, objectHeight, levelingOffset } = this;
    const heightCompensation = levelingOffset.E - levelingOffset[autoFocusRefKey];
    const finalHeight = objectHeight - heightCompensation;
    await deviceMaster.setFisheyeObjectHeight(finalHeight);
  };
}

export default FisheyePreviewManagerV2;
