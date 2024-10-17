// Swiftray Client Typescript API Client
import EventEmitter from 'eventemitter3';

import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { IDeviceDetailInfo, IDeviceInfo, IReport } from 'interfaces/IDevice';
import { IWrappedSwiftrayTaskFile } from 'interfaces/IWrappedFile';

interface ErrorObject {
  code: number;
  message: string;
  details?: any;
}

interface DeviceSettings {
  workingRange: {
    x: number;
    y: number;
  };
  origin: {
    x: number;
    y: number;
  };
  calibrationData: string;
}

// SystemInfo
interface SystemInfo {
  swiftrayVersion: string;
  qtVersion: string;
  os: string;
  cpuArchitecture: string;
  totalMemory: number;
  availableMemory: number;
}

// PreferenceSettingsObject
interface PreferenceSettingsObject {
  convertSettings: {
    unitScaling: number;
    optimizePaths: boolean;
    joinCurves: boolean;
    filletCorners: boolean;
    simplifyGeometry: boolean;
  };
}

class SwiftrayClient extends EventEmitter{
  private socket: WebSocket; // The websocket here is the browser websocket, not wrapped FLUX websocket

  private retryCount = 0;

  private maxRetries = 200;

  private retryDelay = 5000;

  private port = "";

  private instanceId = "";

  constructor(private url: string) {
    super();
    this.instanceId = Math.random().toString(36).substr(2, 9);
    console.log(`Swiftray Client instance ${this.instanceId} created`);
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
  }

  private handleOpen() {
    console.log('Connected to Swiftray server 🎉');
    this.retryCount = 0;
  }

  private handleClose() {
    console.log('Disconnected from Swiftray server');
    this.retry();
  }

  private handleError(error: Error) {
    console.error('Error connecting to Swiftray server:', error, this.retryCount);
  }

  private retry() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1;
      console.log(`Retrying connection (attempt ${this.retryCount})`);
      setTimeout(() => {
        this.connect();
      }, this.retryDelay);
    } else {
      throw new Error('Failed to connect to Swiftray server after maximum retries');
    }
  }

  private handleMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    this.emit(data.type, data);
  }

  public async action<T>(path: string, action: string, params?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      const payload = { id, action, params };
      this.socket.send(JSON.stringify({ type: 'action', path, data: payload }));

      const callback = (data) => {
        if (data.id === id) {
          this.removeListener('callback', callback);
          // console.log("SR Client Callback", data);
          resolve(data.result);
        }
      };
      this.addListener('callback', callback);
    });
  }


  // Parser API
  public async loadSVG(
    file: IWrappedSwiftrayTaskFile,
    eventListeners: {
      onProgressing: (progress) => void;
      onFinished: () => void;
      onError: (message: string) => void;
    },
    loadOptions: {
      model: string;
      rotaryMode: boolean;
      engraveDpi: number;
    }
  ): Promise<{ success: boolean; error?: ErrorObject }> {
    const uploadRes = await this.action<{ success: boolean; error?: ErrorObject }>(
      '/parser',
      'loadSVG',
      {
        file,
        model: loadOptions.model,
        rotaryMode: loadOptions.rotaryMode,
        engraveDpi: loadOptions.engraveDpi,
      }
    );
    return uploadRes;
  }

  public async convert(
    type: 'gcode' | 'fcode' | 'preview',
    eventListeners: {
      onProgressing: (progress) => void;
      onFinished: (
        taskBlob: Blob,
        fileName: string,
        timeCost: number,
        metadata: { [key: string]: string | number }
      ) => void;
      onError: (message: string) => void;
    },
    convertOptions: {
      model: WorkAreaModel;
      enableAutoFocus?: boolean;
      enableDiode?: boolean;
      shouldUseFastGradient?: boolean;
      shouldMockFastGradient?: boolean;
      vectorSpeedConstraint?: boolean;
      paddingAccel?: number;
      travelSpeed?: number;
    }
  ): Promise<{
    success: boolean;
    estimatedTime?: number;
    error?: ErrorObject;
  }> {
    const workarea = getWorkarea(convertOptions.model);
    const convertResult = await this.action<{
      success: boolean;
      fileName?: string;
      timeCost?: number;
      fcode?: string;
      gcode?: string;
      estimatedTime?: number;
      metadata?: { [key: string]: string | number }
      error?: ErrorObject;
    }>('/parser', 'convert', {
      type,
      workarea: {
        width: workarea.width,
        height: workarea.displayHeight || workarea.height,
      },
      ...convertOptions,
    });
    const taskBlob = new Blob(
      [type === 'fcode' ? Buffer.from(convertResult.fcode, 'base64') : convertResult.gcode],
      { type: 'text/plain' }
    );
    eventListeners.onFinished(taskBlob, convertResult.fileName, convertResult.timeCost, convertResult.metadata);
    return {
      success: convertResult.success,
      error: convertResult.error,
    };
  }

  public async interruptCalculation(): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action('/parser', 'interrupt');
  }


  public async loadSettings(data: PreferenceSettingsObject): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action('/parser', 'loadSettings', data);
  }

  // System API
  public async getSystemInfo(): Promise<{ success: boolean, info?: SystemInfo, error?: ErrorObject }> {
    return this.action('/ws/sr/system', 'getInfo');
  }

  // Device API
  public async listDevices(): Promise<{ success: boolean, devices?: IDeviceInfo[], error?: ErrorObject }> {
    return this.action('/devices', 'list');
  }

  public async connectDevice(port: string): Promise<{ success: boolean, error?: ErrorObject }> {
    this.port = port;
    return this.action(`/devices/${port}`, 'connect');
  }

  public async startTask(): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action(`/devices/${this.port}`, 'start');
  }

  public async pauseTask(): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action(`/devices/${this.port}`, 'pause');
  }

  public async resumeTask(): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action(`/devices/${this.port}`, 'resume');
  }

  public async stopTask(): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action(`/devices/${this.port}`, 'stop');
  }

  public async getDeviceParam<T = number>(name: string): Promise<{ status: string, value: T }> {
    return this.action(`/devices/${this.port}`, 'getParam', { name });
  }

  public async setDeviceParam(name: string, value: string | number): Promise<void> {
    return this.action(`/devices/${this.port}`, 'setParam', { name, value });
  }

  public async setDeviceCorrection(data: { [key: string]: number }): Promise<boolean> {
    return this.action(`/devices/${this.port}`, 'setCorrection', data);
  }

  public async getDeviceSettings(): Promise<{
    success: boolean, settings?: DeviceSettings, error?: ErrorObject
  }> {
    return this.action(`/devices/${this.port}`, 'getSettings');
  }

  public async updateDeviceSettings(settings: DeviceSettings): Promise<{
    success: boolean, error?: ErrorObject
  }> {
    return this.action(`/devices/${this.port}`, 'updateSettings', settings);
  }

  public async deleteDeviceSettings(name: string): Promise<{ success: boolean, error?: ErrorObject }>  {
    return this.action(`/devices/${this.port}`, 'deleteSettings', { name });
  }

  public async updateFirmware(blob: Blob): Promise<{ success: boolean, error?: ErrorObject }> {
    return this.action(`/devices/${this.port}`, 'updateFirmware', blob);
  }

  public async endMode(): Promise<{ success: boolean, error?: ErrorObject }>  {
    return this.action(`/devices/${this.port}`, 'endMode');
  }

  public async switchMode(mode: string): Promise<{ success: boolean, error?: ErrorObject }>  {
    return this.action(`/devices/${this.port}`, 'switchMode', mode);
  }

  public async quitTask(): Promise<{ success: boolean, error?: ErrorObject }>  {
    return this.action(`/devices/${this.port}`, 'quit');
  }

  public async downloadLog(logName: string): Promise<Blob> {
    return this.action(`/devices/${this.port}`, 'downloadLog', logName);
  }

  public async downloadFile(fileNameWithPath: string): Promise<Blob> {
    return this.action(`/devices/${this.port}`, 'downloadFile', fileNameWithPath);
  }

  public async close(): Promise<void> {
    console.error('Someone trying to close the Swiftray client');
    console.trace();
    this.socket.close();
  }

  public async deviceInfo(): Promise<IDeviceDetailInfo> {
    return this.action(`/devices/${this.port}`, 'info');
  }

  public async getPreview(): Promise<Blob> {
    return this.action(`/devices/${this.port}`, 'getPreview');
  }

  public async startFraming(): Promise<void> {
    return this.action(`/devices/${this.port}`, 'startFraming');
  }

  public async stopFraming(): Promise<void> {
    return this.action(`/devices/${this.port}`, 'stopFraming');
  }

  public async kick(): Promise<void> {
    return this.action(`/devices/${this.port}`, 'kick');
  }

  public async upload(data: Blob, path?: string): Promise<void> {
    return this.action(`/devices/${this.port}`, 'upload', { data, path });
  }

  public async sendGCode(command: string): Promise<void> {
    return this.action(`/devices/${this.port}`, 'sendGCode', command);
  }

  public async getDeviceStatus(): Promise<IReport> {
    return await this.action(`/devices/${this.port}`, 'getStatus') as any;
  }

  public async home(): Promise<void> {
    return this.action(`/devices/${this.port}`, 'home');
  }
}

const swiftrayClient = new SwiftrayClient('ws://localhost:6611');
const getDeviceClient = async (port: string): Promise<SwiftrayClient> => {
  console.log(`Connecting to device on port ${port}`);
  // TODO:SWIFTRAY - Open a new instance of Swiftray, and use different port number
  // const sc = new SwiftrayClient(`ws://localhost:6611/`);
  await swiftrayClient.connectDevice(port);
  return swiftrayClient;
}

export {
  swiftrayClient, // default connection to Swiftray server
  getDeviceClient,
  SwiftrayClient,
};
