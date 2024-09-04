import { CameraConfig, CameraParameters } from './Camera';
// import { IDeviceInfo } from './IDevice';

export interface PreviewManager {
  fullScreen?: boolean;

  setup(args?: { progressId?: string }): Promise<boolean>;

  end(): Promise<void>;

  preview(x: number, y: number, opts?: { overlapRatio?: number }): Promise<boolean>;

  previewRegion(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    opts?: { overlapRatio?: number }
  ): Promise<boolean>;

  previewFullWorkarea?: () => Promise<boolean>;

  reloadLevelingOffset?: () => Promise<void>;

  resetObjectHeight?: () => Promise<boolean>;

  getCameraOffset?: () => CameraParameters;

  getCameraOffsetStandard?: () => CameraConfig;

  getPhotoAfterMoveTo?: (x: number, y: number) => Promise<string>;
}
