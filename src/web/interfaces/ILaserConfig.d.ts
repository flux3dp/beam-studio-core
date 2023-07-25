export interface ILaserConfig extends ILaserData {
  name: string,
  isDefault?: boolean,
  key? : string,
  module?: number,
}

export interface ILaserData {
  speed: number,
  power: number,
  repeat?: number,
  zStep?: number,
}

export interface ILaserDataChanges {
  speed?: number,
  power?: number,
  repeat?: number,
  zStep?: number,
}
