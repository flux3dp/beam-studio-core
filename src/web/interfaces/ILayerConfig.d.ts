export type ConfigKeyTypeMap = {
  // meta configs
  configName: string;
  module: number;
  color: string;
  clipRect: string; // x y w h
  ref: boolean;
  // common configs
  repeat: number;
  backlash: number;
  // laser configs
  speed: number;
  power: number;
  minPower: number;
  height: number;
  zStep: number;
  diode: number;
  focus: number;
  focusStep: number;
  // printing configs
  fullcolor: boolean;
  printingSpeed: number;
  ink: number;
  multipass: number;
  cRatio: number;
  mRatio: number;
  yRatio: number;
  kRatio: number;
  printingStrength: number;
  halftone: number;
  wInk: number;
  wSpeed: number;
  wMultipass: number;
  wRepeat: number;
  uv: number;
};

type ConfigKey = keyof ConfigKeyTypeMap;

export interface ConfigItem<T> {
  value: T;
  hasMultiValue?: boolean;
}

// Used for ConfigPanel, selected layer(s) config
export type ILayerConfig = {
  [key in keyof ConfigKeyTypeMap]: ConfigItem<ConfigKeyTypeMap[key]>;
}

// Saved parameters, containing presets and user saved configs
export type Preset = {
  isDefault?: boolean;
  name?: string;
  key?: string;
  hide?: boolean;
  module?: number;
} & { [key in keyof ILayerConfig]?: ConfigKeyTypeMap[key] };
