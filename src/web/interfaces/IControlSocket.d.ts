import EventEmitter from 'eventemitter3';

import { SwiftrayClient } from 'helpers/api/swiftray-client';

// eslint-disable-next-line import/no-cycle
import { IDeviceDetailInfo, IReport } from './IDevice';
import { WrappedWebSocket } from './WebSocket';
import { RawChipSettings } from './Cartridge';

interface IControlSocket extends EventEmitter {
  isConnected: boolean;
  connection: WrappedWebSocket | SwiftrayClient | null;
  isLineCheckMode: boolean;
  lineNumber: number;

  getMode(): string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  addTask<T>(taskFunction: (...args) => T, ...args: unknown[]): Promise<T>;
  connect(): Promise<void>;
  killSelf(): Promise<null>;
  setProgressListener(listener: (...args: unknown[]) => void): void;
  removeCommandListeners(): void;

  ls(path: string): Promise<{ files: string[]; directories: string[] }>;
  lsusb(): Promise<unknown>;
  fileInfo(path: string, fileName: string): Promise<unknown[]>;
  report(): Promise<{ device_status: IReport }>;
  upload(data: any, path?: string, fileName?: string): Promise<void>;
  abort(): Promise<unknown>;
  quit(): Promise<unknown>;
  start(): Promise<unknown>;
  pause(): Promise<unknown>;
  resume(): Promise<unknown>;
  restart(): Promise<unknown>;
  kick(): Promise<unknown>;
  quitTask(): Promise<unknown>;
  deviceDetailInfo(): Promise<IDeviceDetailInfo>;
  getPreview(): Promise<unknown[]>;
  select(path: string[], fileName: string): Promise<{ status: string }>;
  deleteFile(fileNameWithPath: string): Promise<unknown>;
  downloadFile(fileNameWithPath: string): Promise<(string | Blob)[]>;
  downloadLog(logName: string): Promise<(string | Blob)[]>;
  getLaserPower(): Promise<{ value: number }>;
  setLaserPower(power: number): Promise<unknown>;
  setLaserPowerTemp(power: number): Promise<unknown>;
  getLaserSpeed(): Promise<{ value: number }>;
  setLaserSpeed(speed: number): Promise<unknown>;
  setLaserSpeedTemp(speed: number): Promise<unknown>;
  getFan(): Promise<{ value: number }>;
  setFan(fanSpeed: number): Promise<unknown>;
  setFanTemp(fanSpeed: number): Promise<unknown>;
  setOriginX(x: number): Promise<unknown>;
  setOriginY(y: number): Promise<unknown>;
  getDoorOpen(): Promise<{ value: string }>;
  getDeviceSetting(name: string): Promise<unknown>;
  setDeviceSetting(name: string, value: string): Promise<unknown>;
  deleteDeviceSetting(name: string): Promise<unknown>;
  enterMaintainMode(): Promise<unknown>;
  endMaintainMode(): Promise<unknown>;
  maintainMove(args: { x?: number; y?: number; z?: number; f?: number }): Promise<unknown>;
  maintainCloseFan(): Promise<unknown>;
  maintainHome(): Promise<unknown>;
  enterRawMode(): Promise<unknown>;
  endRawMode(): Promise<unknown>;
  rawHome(zAxis?: boolean): Promise<void>;
  rawMoveZRelToLastHome(z: number): Promise<unknown>;
  rawStartLineCheckMode(): Promise<void>;
  rawEndLineCheckMode(): Promise<void>;
  rawMove(args: { x?: number; y?: number; z?: number; f?: number }): Promise<unknown>;
  rawSetWaterPump(on: boolean): Promise<unknown>;
  rawSetAirPump(on: boolean): Promise<unknown>;
  rawSetFan(on: boolean): Promise<unknown>;
  rawSetRotary(on: boolean): Promise<unknown>;
  rawSetLaser(args: { on: boolean; s?: number }): Promise<unknown>;
  rawSet24V(on: boolean): Promise<unknown>;
  rawAutoFocus(timeout?: number): Promise<void>;
  fwUpdate(file: File): Promise<unknown>;

  // method not supported by SwiftrayClient
  fetchCameraCalibImage?: (name?: string) => Promise<Blob>;
  enterCartridgeIOMode?: () => Promise<void>;
  endCartridgeIOMode?: () => Promise<void>;
  getCartridgeChipData?: () => Promise<{ status: string; data: { result: RawChipSettings } }>;
  cartridgeIOJsonRpcReq?: (
    method: string,
    params: unknown
  ) => Promise<{ status: string; data: { result: { hash: string; sign: string } } }>;
}

export default IControlSocket;
