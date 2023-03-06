interface Config {
  value: number | string;
  hasMultiValue: boolean;
}

export interface ILayerConfig {
  speed: Config;
  power: Config;
  repeat: Config;
  height: Config;
  zStep: Config;
  diode: Config;
  configName: Config;
}
