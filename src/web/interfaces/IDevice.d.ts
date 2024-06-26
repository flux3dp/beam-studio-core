import Control from '../helpers/api/control';
import Camera from '../helpers/api/camera';

export interface IDeviceInfo {
  ipaddr: string;
  st_id: number;
  error_label: never;
  uuid: string;
  model: string;
  version: string;
  password: boolean;
  plaintext_password: string;
  serial: string;
  source: string;
  name: string;
  addr: string;
  st_prog?: number;
}

export interface IDeviceConnection {
  info: IDeviceInfo;
  control: Control;
  errors: string[];
  camera: Camera;
  cameraNeedsFlip: boolean;
}

export interface IReport {
  session?: number;
  st_id: number;
  st_label: string;
  error: string[];
  prog: number;
  traveled: number;
  laser_pwr: number;
  raw_laser: number;
  Beam_Air: number;
}

export interface IDeviceDetailInfo {
  head_submodule_info: string;
  x_acc: string;
  head_type: string;
}

export interface IConfigSetting {
  min: number;
  max: number;
  value: number;
  step: number;
}
