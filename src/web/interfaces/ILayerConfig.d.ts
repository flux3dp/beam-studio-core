export interface IConfig<T> {
  value: T;
  hasMultiValue?: boolean;
}

export interface ILayerConfig {
  speed: IConfig<number>;
  power: IConfig<number>;
  ink: IConfig<number>;
  repeat: IConfig<number>;
  height: IConfig<number>;
  zStep: IConfig<number>;
  diode: IConfig<number>;
  configName: IConfig<string>;
  module: IConfig<number>;
  backlash: IConfig<number>;
  multipass: IConfig<number>;
  uv: IConfig<number>;
  halftone: IConfig<number>;
  wInk: IConfig<number>;
  wSpeed: IConfig<number>;
  wMultipass: IConfig<number>;
  wRepeat: IConfig<number>;
  color: IConfig<string>;
  fullcolor: IConfig<boolean>;
  cRatio: IConfig<number>;
  mRatio: IConfig<number>;
  yRatio: IConfig<number>;
  kRatio: IConfig<number>;
  printingStrength: IConfig<number>;
  clipRect: IConfig<string>; // x y w h
  ref: IConfig<boolean>;
  focus: IConfig<number>;
  focusStep: IConfig<number>;
}
