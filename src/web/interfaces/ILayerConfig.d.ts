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
  type: IConfig<number>;
}
