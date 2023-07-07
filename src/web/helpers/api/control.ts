/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import EventEmitter from 'eventemitter3';

import ErrorConstants from 'app/constants/error-constants';
import rsaKey from 'helpers/rsa-key';
import Websocket from 'helpers/websocket';

const EVENT_COMMAND_MESSAGE = 'command-message';
const EVENT_COMMAND_ERROR = 'command-error';
const EVENT_COMMAND_FATAL = 'command-fatal';
const EVENT_COMMAND_PROGRESS = 'command-progress';

const MAX_TASK_QUEUE = 30;
const CONNECTION_TIMEOUT = 30 * 1000;
const CONNECITON_TIMEOUT_ERROR = {
  status: 'error',
  error: 'TIMEOUT',
  info: 'connection timeoout',
};

class Control extends EventEmitter {
  public isConnected = false;

  private taskQueue: {
    taskFunction: Function;
    args: any[];
    resolve: Function;
    reject: Function;
  }[] = [];

  private currentTask: {
    taskFunction: Function;
    args: any[];
    resolve: Function;
    reject: Function;
  } | null = null;

  private isProcessingTask = false;

  private ws: any | null;

  private dedicatedWs: any[] = [];

  private fileInfoWsId = 0;

  private mode = ''; // null, maintain or raw

  private _lineNumber = 0;

  private _isLineCheckMode = false;

  protected uuid: string;

  constructor(uuid: string) {
    super();
    this.uuid = uuid;
    this.on('error', (error) => {
      console.log(`Control ${this.uuid} Socket Error:`, error);
    });
  }

  get connection() {
    return this.ws;
  }

  getMode() {
    return this.mode;
  }

  get isLineCheckMode() {
    return this._isLineCheckMode;
  }

  set isLineCheckMode(lineCheckMode: boolean) {
    this._isLineCheckMode = lineCheckMode;
  }

  get lineNumber() {
    return this._lineNumber;
  }

  set lineNumber(lineNumber) {
    this._lineNumber = lineNumber;
  }

  addTask(taskFunction: Function, ...args: any[]): Promise<any> {
    if (this.taskQueue.length > MAX_TASK_QUEUE) {
      console.error(
        `Control ${this.uuid} task queue exceeds max queue length. Clear queue and then send task`
      );
      this.taskQueue = [];
      this.currentTask = null;
      this.isProcessingTask = false;
    }

    const promise = new Promise<any>((resolve, reject) => {
      this.taskQueue.push({ taskFunction, args, resolve, reject });
      if (!this.isProcessingTask && !this.currentTask) {
        this.doTask();
      }
    });
    return promise;
  }

  async doTask() {
    this.currentTask = this.taskQueue.shift();
    const { taskFunction, args, resolve, reject } = this.currentTask;

    try {
      const res = await taskFunction(...args);
      resolve(res);
    } catch (error) {
      reject(error);
    }
    if (this.taskQueue.length > 0) {
      this.doTask();
    } else {
      this.currentTask = null;
      this.isProcessingTask = false;
    }
  }

  async connect() {
    this.ws = await this.createWs();
  }

  async createWs() {
    const { uuid } = this;
    let timeoutTimer = null;

    const ws = await new Promise((resolve, reject) => {
      const newSocket = Websocket({
        method: `control/${uuid}`,
        onMessage: (data) => {
          switch (data.status) {
            case 'connecting':
              clearTimeout(timeoutTimer);
              timeoutTimer = setTimeout(() => {
                reject(CONNECITON_TIMEOUT_ERROR);
              }, CONNECTION_TIMEOUT);
              break;
            case 'connected':
              clearTimeout(timeoutTimer);
              // if (!dedicated) {
              //     this.createDedicatedWs(this.fileInfoWsId);
              //     this.isConnected = true;
              // }
              this.isConnected = true;
              console.log('Control WS Connected', data);
              this.emit('connected', data);
              resolve(newSocket);
              break;
            default:
              this.emit('message', data);
              this.emit(EVENT_COMMAND_MESSAGE, data);
              break;
          }
        },
        onDebug: (response: any) => {
          this.emit('debug', response);
        },
        onError: (response: any) => {
          clearTimeout(timeoutTimer);
          this.emit('error', response);
          this.emit(EVENT_COMMAND_ERROR, response);
        },
        onFatal: (response: any) => {
          clearTimeout(timeoutTimer);
          reject(response);
          this.emit('fatal', response);
          this.emit(EVENT_COMMAND_FATAL, response);
        },
        onClose: (response: CloseEvent) => {
          clearTimeout(timeoutTimer);
          reject(response);
          console.log(`Control of ${uuid} closed:`, response);
          this.isConnected = false;
          this.emit('close', response);
        },
        onOpen() {
          newSocket.send(rsaKey());
        },
        autoReconnect: false,
      });
    });
    return ws;
  }

  killSelf = async () => {
    for (let i = 0; i < this.dedicatedWs.length; i += 1) {
      const ws = this.dedicatedWs[i];
      if (ws) {
        ws.send('kick');
        ws.close();
      }
    }
    this.ws.send('kick');
    this.ws.close();
    await new Promise((r) => setTimeout(r, 500));
    return null;
  };

  setProgressListener(listener: (...args: any[]) => void) {
    this.removeAllListeners(EVENT_COMMAND_PROGRESS);
    this.on(EVENT_COMMAND_PROGRESS, listener);
  }

  removeCommandListeners() {
    this.removeAllListeners(EVENT_COMMAND_MESSAGE);
    this.removeAllListeners(EVENT_COMMAND_ERROR);
    this.removeAllListeners(EVENT_COMMAND_FATAL);
    this.removeAllListeners(EVENT_COMMAND_PROGRESS);
  }

  setTimeoutTimer(reject: Function, timeout = 30000) {
    const timeoutTimer = setTimeout(() => {
      reject({
        status: 'error',
        text: 'TIMEOUT',
        error: 'TIMEOUT',
      });
    }, timeout);
    return timeoutTimer;
  }

  setDefaultErrorResponse(reject: Function, timeoutTimer?: NodeJS.Timeout) {
    this.on(EVENT_COMMAND_ERROR, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.removeCommandListeners();
      reject(response);
    });
  }

  setDefaultFatalResponse(reject: Function, timeoutTimer?: NodeJS.Timeout) {
    this.on(EVENT_COMMAND_FATAL, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.removeCommandListeners();
      reject(response);
    });
  }

  useWaitAnyResponse(command: string, timeout = 30000) {
    // Resolve after any response, equals to useDefaultResponse in old Control
    return new Promise<any>((resolve, reject) => {
      const timeoutTimer = this.setTimeoutTimer(reject, timeout);
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        clearTimeout(timeoutTimer);
        this.removeCommandListeners();
        resolve(response);
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);
      this.ws.send(command);
    });
  }

  useWaitOKResponse(command: string, timeout = 30000) {
    // Resolve after get response whose status is ok
    return new Promise<{ data: any[]; response: any }>((resolve, reject) => {
      const data = [];
      const timeoutTimer = this.setTimeoutTimer(reject, timeout);
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        data.push(response);
        if (response.status === 'ok') {
          clearTimeout(timeoutTimer);
          this.removeCommandListeners();
          resolve({ data, response });
        }
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);
      this.ws.send(command);
    });
  }

  useRawLineCheckCommand(command: string, timeout = 30000) {
    return new Promise<any>((resolve, reject) => {
      let timeoutTimer = this.setTimeoutTimer(reject, timeout);
      let responseString = '';
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (response && response.status === 'raw') {
          console.log(response.text);
          responseString += response.text;
          let responseStrings = responseString.split('\n');
          responseStrings = responseStrings.filter(
            (s, i) => !s.startsWith('DEBUG:') || i === responseStrings.length - 1
          );
          const isCommandCompleted = responseStrings.some(
            (s) => s.startsWith(`LN${this._lineNumber} 0`) || s.startsWith(`L${this._lineNumber} 0`)
          );
          const hasERL = responseStrings.some((s) => {
            if (s.startsWith('ERL')) {
              const correctLineNumber = Number(response.text.substring(3).split(' ')[0]);
              this._lineNumber = correctLineNumber;
              return true;
            }
            return false;
          });
          const hasError = responseStrings.some((s) => s.startsWith('ER'));
          console.log(responseStrings);
          responseString = responseStrings[responseStrings.length - 1];
          if (isCommandCompleted) {
            this._lineNumber += 1;
            this.removeCommandListeners();
            resolve(null);
          } else if (hasERL) {
            const cmd = this.buildLineCheckCommand(command);
            console.log(cmd);
            timeoutTimer = this.setTimeoutTimer(reject, timeout);
            this.ws.send(cmd);
          } else if (hasError) {
            const cmd = this.buildLineCheckCommand(command);
            timeoutTimer = this.setTimeoutTimer(reject, timeout);
            this.ws.send(cmd);
          }
        }
        if (response.text.indexOf('ER:RESET') >= 0) {
          this.removeCommandListeners();
          reject(response);
        } else if (response.text.indexOf('error:') >= 0) {
          this.removeCommandListeners();
          reject(response);
        }
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);

      const cmd = this.buildLineCheckCommand(command);
      console.log(cmd);
      this.ws.send(cmd);
    });
  }

  buildLineCheckCommand(command: string) {
    const newCommand = `N${this._lineNumber}${command}`;
    let crc = 0;
    for (let i = 0; i < newCommand.length; i += 1) {
      if (newCommand[i] !== ' ') {
        const charCode = newCommand.charCodeAt(i);
        crc ^= charCode;
        crc += charCode;
      }
    }
    crc %= 65536;
    return `${newCommand} *${crc}`;
  }

  ls = async (path: string) => (await this.useWaitOKResponse(`file ls ${path}`)).response;

  lsusb = () => this.useWaitAnyResponse('file lsusb');

  fileInfo = async (path: string, fileName: string) => {
    const { data } = await this.useWaitOKResponse(`file fileinfo ${path}/${fileName}`);
    return [fileName, ...data];
  };

  report = () => new Promise<any>((resolve, reject) => {
    let retryTime = 0;
    const timeoutTimer = this.setTimeoutTimer(reject, 3000);
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'ok') {
        clearTimeout(timeoutTimer);
        this.removeCommandListeners();
        resolve(response);
      } else if (retryTime < 3) {
        retryTime += 1;
        console.log('retry report');
        this.ws.send('play report');
      } else {
        reject(response);
      }
    });
    this.setDefaultErrorResponse(reject, timeoutTimer);
    this.setDefaultFatalResponse(reject, timeoutTimer);
    this.ws.send('play report');
  });

  prepareUpload = (data, resolve: Function, reject: Function) => {
    const CHUNK_PKG_SIZE = 4096;
    const length = data.length || data.size;
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'continue') {
        for (let i = 0; i < length; i += CHUNK_PKG_SIZE) {
          const chunk = data.slice(i, i + CHUNK_PKG_SIZE);
          this.ws.send(chunk);
        }
      } else if (response.status === 'uploading') {
        this.emit(EVENT_COMMAND_PROGRESS, { step: response.sent, total: data.size });
      } else if (response.status === 'ok') {
        this.removeCommandListeners();
        resolve();
      } else if (response.status === 'error') {
        this.removeCommandListeners();
        reject(response);
      }
    });
    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);
  };

  upload = (data, path?: string, fileName?: string) => new Promise((resolve, reject) => {
    this.prepareUpload(data, resolve, reject);

    if (path && fileName) {
      fileName = fileName.replace(/ /g, '_');
      const ext = fileName.split('.');
      if (ext[ext.length - 1] === 'fc') {
        this.ws.send(`upload application/fcode ${data.size} ${path}/${fileName}`);
      } else if (ext[ext.length - 1] === 'gcode') {
        const newFileName = fileName.split('.');
        newFileName.pop();
        newFileName.push('fc');
        fileName = newFileName.join('.');
        this.ws.send(`upload text/gcode ${data.size} ${path}/${fileName}`);
      }
    } else {
      this.ws.send(`file upload application/fcode ${data.size}`);
    }
  });

  abort = () => new Promise<any>((resolve, reject) => {
    let retryTime = 0;
    const retryTimeInterval = 2000;
    let timeoutTimer: null | NodeJS.Timeout;

    const retry = (needsQuit = false) => {
      retryTime += 1;
      setTimeout(() => {
        timeoutTimer = this.setTimeoutTimer(reject, 10000);
        if (needsQuit) this.ws.send('play abort');
        else this.ws.send('play report');
      }, retryTimeInterval);
    };

    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        console.log('Control Abort Tried 3 times');
        if (response.cmd === 'play report') {
          if (response.device_status.st_id === 0) {
            this.removeCommandListeners();
            resolve(null);
            return;
          }
          if (response.device_status.st_id === 64) this.ws.send('play quit');
        }
        this.removeCommandListeners();
        reject(response);
      } else {
        const deviceStatus = response.device_status || {};
        if (deviceStatus.st_id === 0 || deviceStatus.st_id === 128) {
          this.removeCommandListeners();
          resolve(null);
        } else {
          retry(response.status !== 'ok');
        }
      }
    });

    this.on(EVENT_COMMAND_ERROR, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        this.removeCommandListeners();
        reject(response);
      } else {
        retry();
      }
    });

    this.on(EVENT_COMMAND_FATAL, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        this.removeCommandListeners();
        reject(response);
      } else {
        retry();
      }
    });

    timeoutTimer = this.setTimeoutTimer(reject, 10000);
    this.ws.send('play abort');
  });

  quit = () => new Promise((resolve, reject) => {
    let retryTime = 0;
    const retryTimeInterval = 2000;
    let timeoutTimer: null | NodeJS.Timeout;

    const retry = (needsQuit = false) => {
      retryTime += 1;
      setTimeout(() => {
        timeoutTimer = this.setTimeoutTimer(reject, 10000);
        if (needsQuit) this.ws.send('play quit');
        else this.ws.send('play report');
      }, retryTimeInterval);
    };

    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        console.log('Control Quit Tried 3 times');
        if (response.cmd === 'play report') {
          if (response.device_status.st_id === 0) {
            this.removeCommandListeners();
            resolve(null);
            return;
          }
        }
        this.removeCommandListeners();
        reject(response);
      } else {
        const deviceStatus = response.device_status || {};
        if (deviceStatus.st_id === 0) {
          this.removeCommandListeners();
          resolve(null);
        } else {
          retry(response.status !== 'ok');
        }
      }
    });

    this.on(EVENT_COMMAND_ERROR, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        this.removeCommandListeners();
        reject(response);
      } else {
        retry();
      }
    });

    this.on(EVENT_COMMAND_FATAL, (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (retryTime >= 3) {
        this.removeCommandListeners();
        reject(response);
      } else {
        retry();
      }
    });

    timeoutTimer = this.setTimeoutTimer(reject, 10000);
    this.ws.send('play quit');
  });

  start = () => this.useWaitAnyResponse('play start');

  pause = () => this.useWaitAnyResponse('play pause');

  resume = () => this.useWaitAnyResponse('play resume');

  restart = () => this.useWaitAnyResponse('play restart');

  kick = () => this.useWaitAnyResponse('kick');

  quitTask = () => {
    this.mode = '';
    return this.useWaitAnyResponse('task quit');
  };

  deviceInfo = () => this.useWaitAnyResponse('deviceInfo');

  getPreview = async () => {
    const { data } = await this.useWaitOKResponse('play info');
    return data;
  };

  select = (path, fileName: string) => this.useWaitAnyResponse(
    fileName === '' ? `play select ${path.join('/')}` : `play select ${path}/${fileName}`
  );

  deleteFile = (fileNameWithPath: string) => this.useWaitAnyResponse(`file rmfile ${fileNameWithPath}`);

  downloadFile = (fileNameWithPath: string) => new Promise((resolve, reject) => {
    const file = [];
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'continue') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else {
        file.push(response);
      }

      if (response instanceof Blob) {
        this.removeCommandListeners();
        resolve(file);
      }
    });
    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(`file download ${fileNameWithPath}`);
  });

  downloadLog = (logName: string) => new Promise((resolve, reject) => {
    const file = [];
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'transfer') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else if (!Object.keys(response).includes('completed')) {
        file.push(response);
      }

      if (response instanceof Blob) {
        this.removeCommandListeners();
        resolve(file);
      }
    });
    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(`fetch_log ${logName}`);
  });

  fetchCameraCalibImage = (fileName: string) => new Promise((resolve, reject) => {
    const file = [];
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'transfer') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else if (!Object.keys(response).includes('completed')) {
        file.push(response);
      }

      if (response instanceof Blob) {
        this.removeCommandListeners();
        resolve(response);
      }
    });
    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(`fetch_camera_calib_pictures ${fileName}`);
  });

  fetchFisheyeParams = () => new Promise((resolve, reject) => {
    const file = [];
    this.on(EVENT_COMMAND_MESSAGE, async (response) => {
      if (response.status === 'transfer') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else if (!Object.keys(response).includes('completed')) {
        file.push(response);
      }

      if (response instanceof Blob) {
        this.removeCommandListeners();
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const jsonString = e.target.result as string;
          console.log(jsonString);
          const data = JSON.parse(jsonString);
          console.log(data);
          resolve(data);
        };
        fileReader.readAsText(response);
        console.log(response);
      }
    });
    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send('fetch_fisheye_params');
  });

  getLaserPower = async () => {
    const res = (await this.useWaitOKResponse('play get_laser_power')).response;
    return res;
  };

  setLaserPower = async (power: number) => {
    const res = (await this.useWaitOKResponse(`play set_laser_power ${power}`)).response;
    return res;
  };

  setLaserPowerTemp = async (power: number) => {
    const res = (await this.useWaitOKResponse(`play set_laser_power_temp ${power}`)).response;
    return res;
  };

  getLaserSpeed = async () => {
    const res = (await this.useWaitOKResponse('play get_laser_speed')).response;
    return res;
  };

  setLaserSpeed = async (speed: number) => {
    const res = (await this.useWaitOKResponse(`play set_laser_speed ${speed}`)).response;
    return res;
  };

  setLaserSpeedTemp = async (speed: number) => {
    const res = (await this.useWaitOKResponse(`play set_laser_speed_temp ${speed}`)).response;
    return res;
  };

  getFan = async () => {
    const res = (await this.useWaitOKResponse('play get_fan')).response;
    return res;
  };

  setFan = async (fanSpeed: number) => {
    const res = (await this.useWaitOKResponse(`play set_fan ${fanSpeed}`)).response;
    return res;
  };

  setFanTemp = async (fanSpeed: number) => {
    const res = (await this.useWaitOKResponse(`play set_fan_temp ${fanSpeed}`)).response;
    return res;
  };

  setOriginX = async (x: number) => {
    const res = (await this.useWaitOKResponse(`play set_origin_x ${x}`)).response;
    return res;
  };

  setOriginY = async (y: number) => {
    const res = (await this.useWaitOKResponse(`play set_origin_y ${y}`)).response;
    return res;
  };

  getDeviceSetting = (name: string) => this.useWaitAnyResponse(`config get ${name}`);

  setDeviceSetting = (name: string, value: string) => this.useWaitAnyResponse(`config set ${name} ${value}`);

  deleteDeviceSetting = (name: string) => this.useWaitAnyResponse(`config del ${name}`);

  enterMaintainMode = async () => {
    const res = await this.useWaitAnyResponse('task maintain');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.mode = 'maintain';
    return res;
  };

  endMaintainMode = () => {
    this.mode = '';
    return this.useWaitAnyResponse('task quit');
  };

  maintainMove = (args: any) => {
    let command = '';
    args.f = args.f || '6000';
    command += ` f:${args.f}`;
    if (typeof args.x !== 'undefined') {
      command += ` x:${args.x}`;
    }
    if (typeof args.y !== 'undefined') {
      command += ` y:${args.y}`;
    }
    if (typeof args.z !== 'undefined') {
      command += ` z:${args.z}`;
    }
    return this.useWaitAnyResponse(`maintain move${command}`);
  };

  maintainCloseFan = () => this.useWaitAnyResponse('maintain close_fan');

  maintainHome = () => this.useWaitAnyResponse('maintain home');

  enterRawMode = async () => {
    const res = await this.useWaitAnyResponse('task raw');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.mode = 'raw';
    return res;
  };

  endRawMode = () => {
    this.mode = '';
    return this.useWaitAnyResponse('task quit');
  };

  rawHome = () => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    return new Promise((resolve, reject) => {
      let didErrorOccur = false;
      let isCmdResent = false;
      let responseString = '';
      let retryTimes = 0;
      let timeoutTimer: null | NodeJS.Timeout;
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        clearTimeout(timeoutTimer);
        if (response && response.status === 'raw') {
          responseString += response.text;
          console.log('raw homing:\t', responseString);
        }
        const resps = responseString.split('\n');
        if (resps.some((resp) => resp.includes('ok')) && !didErrorOccur) {
          this.removeCommandListeners();
          resolve(response);
          return;
        }
        if (
          response.text.indexOf('ER:RESET') >= 0
          || response.text.indexOf('DEBUG: RESET') >= 0
          || response.text.indexOf('error:') >= 0
          || resps.some((resp) => resp.includes('ER:RESET'))
          || resps.some((resp) => resp.includes('DEBUG: RESET'))
          || resps.some((resp) => resp.includes('error:'))
        ) {
          didErrorOccur = true;
          if (retryTimes > 5) {
            this.removeCommandListeners();
            reject(response);
            return;
          }
          if (!isCmdResent) {
            isCmdResent = true;
            setTimeout(() => {
              didErrorOccur = false;
              isCmdResent = false;
              responseString = '';
              retryTimes += 1;
              timeoutTimer = this.setTimeoutTimer(reject, 10000);
              this.ws.send('raw home');
            }, 1000);
          }
        } else {
          timeoutTimer = this.setTimeoutTimer(reject, 10000);
        }
        responseString = resps[resps.length - 1] || '';
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);

      timeoutTimer = this.setTimeoutTimer(reject, 10000);
      this.ws.send('raw home');
    });
  };

  rawStartLineCheckMode = () => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    return new Promise((resolve, reject) => {
      let isCmdResent = false;
      let responseString = '';
      const command = '$@';
      let retryTimes = 0;
      let timeoutTimer: null | NodeJS.Timeout;
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        clearTimeout(timeoutTimer);
        if (response && response.status === 'raw') {
          console.log('raw line check:\t', response.text);
          responseString += response.text;
        }
        const resps = responseString.split('\n');
        const i = resps.findIndex((r) => r === 'CTRL LINECHECK_ENABLED');
        if (i < 0) responseString = resps[resps.length - 1] || '';
        if (i >= 0) {
          this._isLineCheckMode = true;
          this._lineNumber = 1;
          this.removeCommandListeners();
          resolve(null);
          return;
        }
        if (
          response.text.indexOf('ER:RESET') >= 0
          || resps.some((resp) => resp.includes('ER:RESET'))
          || response.text.indexOf('error:') >= 0
        ) {
          if (retryTimes >= 5) {
            this.removeCommandListeners();
            reject(response);
            return;
          }
          if (!isCmdResent) {
            isCmdResent = true;
            setTimeout(() => {
              isCmdResent = false;
              responseString = '';
              timeoutTimer = this.setTimeoutTimer(reject, 10000);
              this.ws.send(command);
              retryTimes += 1;
            }, 200);
          }
        } else {
          timeoutTimer = this.setTimeoutTimer(reject, 10000);
        }
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);

      timeoutTimer = this.setTimeoutTimer(reject, 10000);
      this.ws.send(command);
    });
  };

  rawEndLineCheckMode = () => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    return new Promise((resolve, reject) => {
      let isCmdResent = false;
      let responseString = '';
      const command = 'M172';
      let retryTimes = 0;
      let timeoutTimer: null | NodeJS.Timeout;
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        clearTimeout(timeoutTimer);
        if (response && response.status === 'raw') {
          console.log('raw end line check:\t', response.text);
          responseString += response.text;
        }
        const resps = responseString.split('\n');
        const i = resps.findIndex((r) => r === 'CTRL LINECHECK_DISABLED');
        if (i < 0) responseString = resps[resps.length - 1] || '';
        if (i >= 0) {
          this._isLineCheckMode = false;
          this.removeCommandListeners();
          resolve(null);
          return;
        }
        if (
          response.text.indexOf('ER:RESET') >= 0
          || resps.some((resp) => resp.includes('ER:RESET'))
          || response.text.indexOf('error:') >= 0
        ) {
          if (retryTimes >= 5) {
            this.removeCommandListeners();
            reject(response);
            return;
          }
          if (!isCmdResent) {
            isCmdResent = true;
            setTimeout(() => {
              isCmdResent = false;
              responseString = '';
              this.ws.send(command);
              retryTimes += 1;
            }, 200);
          }
        } else {
          timeoutTimer = this.setTimeoutTimer(reject, 10000);
        }
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);
      timeoutTimer = this.setTimeoutTimer(reject, 10000);

      this.ws.send(command);
    });
  };

  rawMove = (args: any) => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    let command = 'G1';
    args.f = args.f || '6000';
    command += `F${args.f}`;
    if (typeof args.x !== 'undefined') {
      command += `X${Math.round(args.x * 1000) / 1000}`;
    }
    if (typeof args.y !== 'undefined') {
      command += `Y${Math.round(args.y * 1000) / 1000}`;
    }
    if (!this._isLineCheckMode) {
      console.log('raw move command:', command);
      return this.useWaitAnyResponse(command);
    }
    return this.useRawLineCheckCommand(command);
  };

  rawSetWaterPump = (on: boolean) => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    const command = on ? 'B1' : 'B2';
    if (!this._isLineCheckMode) return this.useWaitAnyResponse(command);
    return this.useRawLineCheckCommand(command);
  };

  rawSetAirPump = (on: boolean) => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    const command = on ? 'B3' : 'B4';
    if (!this._isLineCheckMode) return this.useWaitAnyResponse(command);
    return this.useRawLineCheckCommand(command);
  };

  rawSetFan = (on: boolean) => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    const command = on ? 'B5' : 'B6';
    if (!this._isLineCheckMode) return this.useWaitAnyResponse(command);
    return this.useRawLineCheckCommand(command);
  };

  rawSetRotary = (on: boolean) => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    const command = on ? 'R1' : 'R0';
    if (!this._isLineCheckMode) return this.useWaitAnyResponse(command);
    return this.useRawLineCheckCommand(command);
  };

  rawLooseMotorB12 = async () => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    await this.useWaitAnyResponse('$1=0');
    const command = 'B12';
    if (!this._isLineCheckMode) {
      await this.useWaitAnyResponse(command);
    } else {
      await this.useRawLineCheckCommand(command);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const res = await this.useWaitAnyResponse('$1=255');
    return res;
  };

  rawLooseMotorB34 = () => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    const command = 'B34';
    if (!this._isLineCheckMode) return this.useWaitAnyResponse(command);
    return this.useRawLineCheckCommand(command);
  };

  rawGetProbePos = (): Promise<{ x: number; y: number; z: number; a: number; didAf: boolean }> => {
    if (this.mode !== 'raw') {
      throw new Error(ErrorConstants.CONTROL_SOCKET_MODE_ERROR);
    }
    return new Promise((resolve, reject) => {
      let isCmdResent = false;
      let responseString = '';
      const command = 'M136P254';
      let retryTimes = 0;
      let timeoutTimer: null | NodeJS.Timeout;
      this.on(EVENT_COMMAND_MESSAGE, (response) => {
        clearTimeout(timeoutTimer);
        if (response && response.status === 'raw') {
          console.log('raw get probe position:\t', response.text);
          responseString += response.text;
        }
        const resps = responseString.split('\n');
        const i = resps.findIndex((r) => r === 'ok\r');
        if (i < 0) responseString = resps[resps.length - 1] || '';
        if (i >= 0) {
          const resIdx = resps.findIndex((r) => r.match(/\[PRB:([\d.]+),([\d.]+),([\d.]+),([\d.]+):(\d)\]/));
          if (resIdx >= 0) {
            const resStr = resps[resIdx];
            const match = resStr.match(/\[PRB:([\d.]+),([\d.]+),([\d.]+),([\d.]+):(\d)\]/);
            const [, x, y, z, a, didAf] = match;
            this.removeCommandListeners();
            resolve({ x: Number(x), y: Number(y), z: Number(z), a: Number(a), didAf: didAf === '1' });
          } else {
            this.removeCommandListeners();
            reject(response);
          }
          return;
        }
        if (
          response.text.indexOf('ER:RESET') >= 0
          || resps.some((resp) => resp.includes('ER:RESET'))
          || response.text.indexOf('error:') >= 0
        ) {
          if (retryTimes >= 5) {
            this.removeCommandListeners();
            reject(response);
            return;
          }
          if (!isCmdResent) {
            isCmdResent = true;
            setTimeout(() => {
              isCmdResent = false;
              responseString = '';
              this.ws.send(command);
              retryTimes += 1;
            }, 200);
          }
        } else {
          timeoutTimer = this.setTimeoutTimer(reject, 10000);
        }
      });
      this.setDefaultErrorResponse(reject, timeoutTimer);
      this.setDefaultFatalResponse(reject, timeoutTimer);
      timeoutTimer = this.setTimeoutTimer(reject, 10000);

      this.ws.send(command);
    });
  };

  fwUpdate = (file: File) => new Promise((resolve, reject) => {
    const blob = new Blob([file], { type: 'binary/flux-firmware' });
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'ok') {
        this.removeCommandListeners();
        resolve(response);
      } else if (response.status === 'continue') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
        this.ws.send(blob);
      } else if (response.status === 'uploading') {
        response.percentage = ((response.sent || 0) / blob.size) * 100;
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else {
        this.removeCommandListeners();
        reject(response);
      }
    });

    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(`update_fw binary/flux-firmware ${blob.size}`);
  });

  toolheadUpdate = (file: File) => new Promise((resolve, reject) => {
    const blob = new Blob([file], { type: 'binary/flux-firmware' });
    const args = ['maintain', 'update_hbfw', 'binary/fireware', blob.size];
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'ok') {
        this.removeCommandListeners();
        resolve(response);
      } else if (response.status === 'continue') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
        this.ws.send(blob);
      } else if (['operating', 'uploading', 'update_hbfw'].includes(response.status)) {
        response.percentage = ((response.sent || 0) / blob.size) * 100;
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else {
        this.removeCommandListeners();
        reject(response);
      }
    });

    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(args.join(' '));
  });

  uploadFisheyeParams = (data: string) => new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: 'application/json' });
    this.on(EVENT_COMMAND_MESSAGE, (response) => {
      if (response.status === 'ok') {
        this.removeCommandListeners();
        resolve(response);
      } else if (response.status === 'continue') {
        this.emit(EVENT_COMMAND_PROGRESS, response);
        this.ws.send(blob);
      } else if (response.status === 'uploading') {
        response.percentage = ((response.sent || 0) / blob.size) * 100;
        this.emit(EVENT_COMMAND_PROGRESS, response);
      } else {
        this.removeCommandListeners();
        reject(response);
      }
    });

    this.setDefaultErrorResponse(reject);
    this.setDefaultFatalResponse(reject);

    this.ws.send(`update_fisheye_params application/json ${blob.size}`);
  });
}

export default Control;
