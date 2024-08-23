export type ConfigKeyTypeMap = {
  speed: number;
  printingSpeed: number;
  power: number;
  minPower: number;
  ink: number;
  repeat: number;
  height: number;
  zStep: number;
  diode: number;
  configName: string;
  module: number;
  backlash: number;
  multipass: number;
  uv: number;
  halftone: number;
  wInk: number;
  wSpeed: number;
  wMultipass: number;
  wRepeat: number;
  color: string;
  fullcolor: boolean;
  cRatio: number;
  mRatio: number;
  yRatio: number;
  kRatio: number;
  printingStrength: number;
  clipRect: string; // x y w h
  ref: boolean;
  focus: number;
  focusStep: number;
};

type ConfigKey = keyof ConfigKeyTypeMap;

export interface ConfigItem<T> {
  value: T;
  hasMultiValue?: boolean;
}

export type ILayerConfig = {
  [key in keyof ConfigKeyTypeMap]: ConfigItem<ConfigKeyTypeMap[key]>;
}

export type IParameter = {
  isDefault?: boolean;
  name?: string;
  key?: string;
  hide?: boolean;
  module?: number;
} & { [key in keyof ILayerConfig]?: ConfigKeyTypeMap[key] };
