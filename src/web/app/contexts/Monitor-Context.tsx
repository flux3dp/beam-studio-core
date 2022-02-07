/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/sort-comp */
import * as React from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import dialog from 'implementations/dialog';
import DeviceConstants from 'app/constants/device-constants';
import DeviceErrorHandler from 'helpers/device-error-handler';
import DeviceMaster from 'helpers/device-master';
import i18n from 'helpers/i18n';
import MonitorStatus from 'helpers/monitor-status';
import OutputError from 'helpers/output-error';
import Progress from 'app/actions/progress-caller';
import VersionChecker from 'helpers/version-checker';
import { IDeviceInfo, IReport } from 'interfaces/IDevice';
import { IProgress } from 'interfaces/IProgress';
import { ItemType, Mode } from 'app/constants/monitor-constants';

let LANG = i18n.lang;
const updateLang = () => {
  LANG = i18n.lang;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFirstBlobInArray = (array: any[]) => {
  const id = array.findIndex((elem) => elem instanceof Blob);
  if (id >= 0) {
    return array[id];
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findKeyInObjectArray = (array: any[], key: string) => {
  const res = array.filter((o) => Object.keys(o).some((name: string) => name === key));
  if (res.length > 0) {
    return res[0][key];
  }
  return null;
};

const {
  IDLE,
  PAUSED,
  PAUSED_FROM_STARTING,
  PAUSING_FROM_STARTING,
  PAUSED_FROM_RUNNING,
  PAUSING_FROM_RUNNING,
  ABORTED,
  ALARM,
  FATAL,
} = DeviceConstants.status;

export const MonitorContext = React.createContext(null);

interface Props {
  mode: Mode;
  previewTask?: { fcodeBlob: Blob, taskImageURL: string, taskTime: number };
  device: IDeviceInfo;
  onClose: () => void;
}

interface State {
  mode: Mode;
  currentPath: string[];
  highlightedItem: {
    type?: ItemType;
    name?: string;
  };
  fileInfo: any[];
  previewTask: { fcodeBlob: Blob, taskImageURL: string, taskTime: number };
  workingTask: any,
  taskImageURL: string | null;
  taskTime: number | null;
  report: IReport;
  uploadProgress: number | null;
  downloadProgress: number | null;
  shouldUpdateFileList: boolean;
  currentPosition: { x: number, y: number };
  relocateOrigin: { x: number, y: number };
  cameraOffset?: {
    x: number,
    y: number,
    angle: number,
    scaleRatioX: number,
    scaleRatioY: number,
  };
  isMaintainMoving?: boolean;
}

export class MonitorContextProvider extends React.Component<Props, State> {
  didErrorPopped: boolean;

  modeBeforeCamera: Mode;

  modeBeforeRelocate: Mode;

  reporter: NodeJS.Timeout;

  isGettingReport: boolean;

  constructor(props: Props) {
    super(props);
    const { mode, previewTask } = props;
    updateLang();
    this.isGettingReport = false;
    this.didErrorPopped = false;
    this.modeBeforeCamera = mode;
    this.modeBeforeRelocate = mode;
    this.state = {
      mode,
      currentPath: [],
      highlightedItem: {},
      fileInfo: null,
      previewTask,
      workingTask: null,
      taskImageURL: mode === Mode.PREVIEW ? previewTask.taskImageURL : null,
      taskTime: mode === Mode.PREVIEW ? previewTask.taskTime : null,
      report: {} as IReport,
      uploadProgress: null,
      downloadProgress: null,
      shouldUpdateFileList: false,
      currentPosition: { x: 0, y: 0 },
      relocateOrigin: { x: 0, y: 0 },
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchInitialInfo();
    this.startReport();
    const { mode } = this.state;
    if (mode === Mode.WORKING) {
      const taskInfo = await this.getWorkingTaskInfo();
      const { imageBlob, taskTime } = this.getTaskInfo(taskInfo);
      let taskImageURL = null;
      if (imageBlob) {
        taskImageURL = URL.createObjectURL(imageBlob);
      }
      this.setState({
        taskImageURL,
        taskTime,
        workingTask: taskInfo,
      });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    const { taskImageURL, previewTask } = this.state;
    if (prevState.taskImageURL && prevState.taskImageURL !== taskImageURL) {
      if (previewTask && prevState.taskImageURL !== previewTask.taskImageURL) {
        URL.revokeObjectURL(prevState.taskImageURL);
      }
    }
  }

  componentWillUnmount(): void {
    this.stopReport();
    const { taskImageURL } = this.state;
    URL.revokeObjectURL(taskImageURL);
  }

  startReport(): void {
    if (this.reporter) clearInterval(this.reporter);
    this.reporter = setInterval(async () => {
      try {
        if (this.isGettingReport) return;
        this.isGettingReport = true;
        const report = await DeviceMaster.getReport();
        this.isGettingReport = false;
        this.processReport(report);
      } catch (error) {
        if (error && error.status === 'raw') {
          return;
        }
        console.error('Monitor report error:', error);
        this.stopReport();
        const res = await DeviceMaster.reconnect();
        console.log(res);
        if (res.success) {
          this.startReport();
        } else {
          const { onClose } = this.props;
          const askRetryReconnect = () => new Promise<boolean>((resolve) => {
            Alert.popUp({
              id: 'monitor-reconnect',
              type: AlertConstants.SHOW_POPUP_ERROR,
              buttonType: AlertConstants.RETRY_CANCEL,
              message: LANG.monitor.ask_reconnect,
              onRetry: async () => {
                const res2 = await DeviceMaster.reconnect();
                if (res2.success) {
                  Alert.popById('connection-error');
                  resolve(true);
                } else {
                  const doRetry = await askRetryReconnect();
                  resolve(doRetry);
                }
              },
              onCancel: () => resolve(false),
            });
          });
          if (!Alert.checkIdExist('monitor-reconnect')) {
            const doRetry = await askRetryReconnect();
            if (doRetry) {
              this.startReport();
            } else {
              onClose();
            }
          }
        }
      }
    }, 1500);
  }

  stopReport(): void {
    clearInterval(this.reporter);
    this.reporter = null;
  }

  async fetchInitialInfo(): Promise<void> {
    try {
      const report = await DeviceMaster.getReport();
      this.processReport(report);
    } catch (error) {
      console.log('monitor fetch initial info error:\n', error);
      if (error.status === 'fatal') {
        await DeviceMaster.reconnect();
      }
    }
  }

  async processReport(report: IReport): Promise<void> {
    const { report: currentReport, mode } = this.state;
    const keys = Object.keys(report);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (currentReport[key] === undefined
          || JSON.stringify(currentReport[key]) !== JSON.stringify(report[key])) {
        console.log(key, 'changed');
        if (report.st_id > 0 && (mode !== Mode.WORKING || key === 'session')) {
          const keepsCameraMode = (mode === Mode.CAMERA
            && MonitorStatus.allowedCameraStatus.includes(report.st_id));
          if (!keepsCameraMode) {
            console.log('to work mode');
            this.enterWorkingMode();
          }
        } else if (report.st_id === IDLE) {
          if (mode === Mode.WORKING
              || (mode === Mode.CAMERA && this.modeBeforeCamera === Mode.WORKING)) {
            this.exitWorkingMode();
          }
        }
        this.setState({ report });
        break;
      }
    }

    if (!report.error || report.error.length === 0) {
      return;
    }

    let { error } = report;
    error = (error instanceof Array ? error : [error]);
    console.log(error);
    if (error[0] === 'TIMEOUT') {
      try {
        await DeviceMaster.reconnect();
      } catch (e) {
        console.error('Error when reconnect in monitor', e);
        Alert.popUp({
          id: 'monitor-error',
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: LANG.message.connectionTimeout,
        });
        const { onClose } = this.props;
        onClose();
      }
      return;
    }

    const state = [
      PAUSED_FROM_STARTING, PAUSED_FROM_RUNNING, ABORTED, PAUSING_FROM_RUNNING,
      PAUSING_FROM_STARTING, ALARM, FATAL,
    ];

    if (state.includes(report.st_id)) {
      const errorMessage = DeviceErrorHandler.translate(error);

      const handleRetry = async () => {
        const pauseStates = [
          PAUSED, PAUSED_FROM_STARTING, PAUSED_FROM_RUNNING, PAUSING_FROM_STARTING,
          PAUSING_FROM_RUNNING,
        ];
        if (report.st_id === ABORTED) {
          await DeviceMaster.quit();
          this.onPlay();
        } else if (pauseStates.includes(report.st_id)) {
          DeviceMaster.resume();
        }
      };

      const handleReport = async () => {
        const getContent = async () => {
          const contents = [];
          const bxLogs = OutputError.getOutput();
          contents.push(...bxLogs);

          this.stopReport();
          const { device } = this.props;
          const vc = VersionChecker(device.version);
          const playerLogName = vc.meetRequirement('NEW_PLAYER') ? 'playerd.log' : 'fluxplayerd.log';
          Progress.openSteppingProgress({ id: 'get_log', message: 'downloading' });
          const logFiles = await DeviceMaster.getLogsTexts([playerLogName, 'fluxrobotd.log'], (progress: { completed: number, size: number }) => {
            Progress.update('get_log', { message: 'downloading', percentage: (progress.completed / progress.size) * 100 });
          });
          Progress.popById('get_log');
          this.startReport();
          const logKeys = Object.keys(logFiles);
          for (let i = 0; i < logKeys.length; i += 1) {
            const key = logKeys[i];
            const blob = getFirstBlobInArray(logFiles[key]);
            if (blob) {
              contents.push(`\n===\n${key}\n===\n`);
              contents.push(blob);
            }
          }
          return new Blob(contents);
        };
        await dialog.writeFileDialog(getContent, LANG.beambox.popup.bug_report, 'devicelogs.txt', [{
          name: window.os === 'MacOS' ? 'txt (*.txt)' : 'txt',
          extensions: ['txt'],
        }]);
      };

      const id = error.join('_');
      if (!Alert.checkIdExist(id) && !this.didErrorPopped) {
        this.didErrorPopped = true;
        if ([ALARM, FATAL].includes(report.st_id)) {
          Alert.popUp({
            id,
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: errorMessage,
            primaryButtonIndex: 0,
            buttonLabels: [LANG.alert.abort],
            callbacks: [() => DeviceMaster.stop()],
          });
        } else if (error[0] === 'HARDWARE_ERROR' || error[0] === 'USER_OPERATION') {
          Alert.popUp({
            id,
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: errorMessage,
            buttonType: AlertConstants.RETRY_CANCEL,
            onRetry: handleRetry,
          });
        } else {
          Alert.popUp({
            id,
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: errorMessage,
            primaryButtonIndex: 0,
            buttonLabels: [LANG.alert.retry, LANG.monitor.bug_report, LANG.alert.cancel],
            callbacks: [handleRetry, handleReport, () => { }],
          });
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getWorkingTaskInfo(): Promise<any> {
    const res = await DeviceMaster.getPreviewInfo();
    return res;
  }

  // eslint-disable-next-line class-methods-use-this
  getTaskInfo(info: any[]): { imageBlob: Blob, taskTime: number } {
    const imageBlob = getFirstBlobInArray(info);
    const taskTime = findKeyInObjectArray(info, 'TIME_COST');

    return { imageBlob, taskTime };
  }

  enterWorkingMode = async (task?: { taskImageURL: string, taskTime: number }): Promise<void> => {
    if (!task) {
      const taskInfo = await this.getWorkingTaskInfo();
      const { imageBlob, taskTime } = this.getTaskInfo(taskInfo);
      let taskImageURL = null;
      if (imageBlob) {
        taskImageURL = URL.createObjectURL(imageBlob);
      }
      this.setState({
        mode: Mode.WORKING,
        taskImageURL,
        taskTime,
      });
    } else {
      this.setState({
        mode: Mode.WORKING,
        taskImageURL: task.taskImageURL,
        taskTime: task.taskTime,
      });
    }
  };

  exitWorkingMode = (): void => {
    const { mode, fileInfo, previewTask } = this.state;
    console.log(fileInfo);
    if (previewTask) {
      this.setState({
        mode: mode === Mode.CAMERA ? Mode.CAMERA : Mode.PREVIEW,
        taskImageURL: previewTask.taskImageURL,
        taskTime: previewTask.taskTime,
      });
      this.modeBeforeCamera = Mode.PREVIEW;
    } else if (fileInfo) {
      const { imageBlob, taskTime } = this.getTaskInfo(fileInfo);
      const taskImageURL = URL.createObjectURL(imageBlob);
      this.setState({
        mode: mode === Mode.CAMERA ? Mode.CAMERA : Mode.FILE_PREVIEW,
        taskImageURL,
        taskTime,
      });
      this.modeBeforeCamera = Mode.FILE_PREVIEW;
    } else {
      this.setState({
        mode: mode === Mode.CAMERA ? Mode.CAMERA : Mode.FILE,
      });
      this.modeBeforeCamera = Mode.FILE;
    }
  };

  toggleCamera = (): void => {
    const { mode } = this.state;
    if (mode !== Mode.CAMERA) {
      this.modeBeforeCamera = mode;
      this.setState({ mode: Mode.CAMERA });
    } else {
      this.setState({ mode: this.modeBeforeCamera });
    }
  };

  startRelocate = async (): Promise<void> => {
    const { mode } = this.state;
    if (mode === Mode.CAMERA_RELOCATE) return;

    this.modeBeforeRelocate = mode;
    const getCameraOffset = async () => {
      const isBorderless = BeamboxPreference.read('borderless') || false;
      const configName = isBorderless ? 'camera_offset_borderless' : 'camera_offset';
      const resp = await DeviceMaster.getDeviceSetting(configName);
      console.log(`Reading ${configName}\nResp = ${resp.value}`);
      resp.value = ` ${resp.value}`;
      let cameraOffset = {
        x: Number(/ X:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
        y: Number(/ Y:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
        angle: Number(/R:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
        scaleRatioX: Number((/SX:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]),
        scaleRatioY: Number((/SY:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]),
      };
      console.log(`Got ${configName}`, cameraOffset);
      if ((cameraOffset.x === 0) && (cameraOffset.y === 0)) {
        cameraOffset = {
          x: Constant.camera.offsetX_ideal,
          y: Constant.camera.offsetY_ideal,
          angle: 0,
          scaleRatioX: Constant.camera.scaleRatio_ideal,
          scaleRatioY: Constant.camera.scaleRatio_ideal,
        };
      }
      return cameraOffset;
    };

    Progress.popById('prepare-relocate');
    Progress.openNonstopProgress({
      id: 'prepare-relocate',
      message: LANG.monitor.prepareRelocate,
    });
    this.stopReport();
    try {
      const cameraOffset = await getCameraOffset();
      await DeviceMaster.enterRawMode();
      await DeviceMaster.rawSetRotary(false);
      await DeviceMaster.rawHome();
      this.setState({
        mode: Mode.CAMERA_RELOCATE,
        cameraOffset,
        currentPosition: { x: 0, y: 0 },
      });
    } catch (error) {
      console.error('Error when entering relocate mode', error);
      this.startReport();
    }
    Progress.popById('prepare-relocate');
  };

  endRelocate = (): void => {
    this.setState({ mode: this.modeBeforeRelocate }, () => {
      if (!this.reporter) {
        this.startReport();
      }
    });
  };

  onNavigationBtnClick = (): void => {
    const {
      mode, currentPath, previewTask, report,
    } = this.state;
    if (mode === Mode.FILE) {
      if (currentPath.length > 0) {
        currentPath.pop();
        this.setState({
          currentPath,
          highlightedItem: {},
        });
      } else if (previewTask) {
        console.log(previewTask.taskImageURL);
        this.setState({
          mode: Mode.PREVIEW,
          taskImageURL: previewTask.taskImageURL,
          taskTime: previewTask.taskTime,
        });
      }
    } else if (mode === Mode.PREVIEW || mode === Mode.FILE_PREVIEW) {
      this.setState({
        mode: Mode.FILE,
        fileInfo: null,
        highlightedItem: {},
      });
    } else if (mode === Mode.CAMERA) {
      this.toggleCamera();
    } else if (mode === Mode.CAMERA_RELOCATE) {
      this.endRelocate();
    } else if (mode === Mode.WORKING && MonitorStatus.isAbortedOrCompleted(report)) {
      DeviceMaster.quit();
    }
  };

  onHighlightItem = (item: { name: string, type: ItemType }): void => {
    const { highlightedItem } = this.state;
    if (!highlightedItem
        || highlightedItem.name !== item.name
        || highlightedItem.type !== item.type) {
      this.setState({ highlightedItem: item });
    }
  };

  onSelectFolder = (folderName: string): void => {
    const { currentPath } = this.state;
    currentPath.push(folderName);
    this.setState({
      currentPath,
      highlightedItem: {},
    });
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  onSelectFile = async (fileName: string, fileInfo: any): Promise<void> => {
    const { currentPath } = this.state;
    const path = currentPath.join('/');
    let info = fileInfo;
    if (!info) {
      info = await DeviceMaster.fileInfo(path, fileName);
    }
    console.log(info);
    const { imageBlob, taskTime } = this.getTaskInfo(info);
    let taskImageURL = null;
    if (imageBlob) {
      taskImageURL = URL.createObjectURL(imageBlob);
    }
    console.log(info);
    this.setState({
      mode: Mode.FILE_PREVIEW,
      fileInfo: info,
      taskImageURL,
      taskTime,
    });
  };

  setShouldUpdateFileList = (val: boolean): void => {
    this.setState({ shouldUpdateFileList: val });
  };

  onUpload = async (e: React.ChangeEvent): Promise<void> => {
    const fileElem = e.target as HTMLInputElement;
    if (fileElem.files.length > 0) {
      const doesFileExistInDirectory = async (path: string, fileName: string) => {
        const name = fileName.replace('.gcode', '.fc');
        try {
          const res = await DeviceMaster.fileInfo(path, name);
          if (!res.error || res.error.length === 0) {
            console.log(res.error, res.error.length === 0);
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      };
      const { currentPath } = this.state;
      const path = currentPath.join('/');
      const fileToBeUpload = fileElem.files[0];
      const fileExist = await doesFileExistInDirectory(path, fileToBeUpload.name.replace(/ /g, '_'));

      const doUpload = (file: File) => {
        this.setState({ uploadProgress: 0 });
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
          const fileInfo = file.name.split('.');
          const ext = fileInfo[fileInfo.length - 1];
          let type;
          let isValid = false;

          if (ext === 'fc') {
            type = { type: 'application/fcode' };
            isValid = true;
          } else if (ext === 'gcode') {
            type = { type: 'text/gcode' };
            isValid = true;
          }

          if (isValid) {
            const blob = new Blob([reader.result], type);

            await DeviceMaster.uploadToDirectory(blob, path, file.name, (progress: IProgress) => {
              const p = Math.floor((progress.step / progress.total) * 100);
              this.setState({ uploadProgress: p });
            });

            this.setState({ uploadProgress: null });
            this.setShouldUpdateFileList(true);
          } else {
            Alert.popUp({
              type: AlertConstants.SHOW_POPUP_INFO,
              message: LANG.monitor.extensionNotSupported,
            });
          }
        };
      };

      if (fileExist) {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_INFO,
          message: LANG.monitor.fileExistContinue,
          buttonType: AlertConstants.YES_NO,
          onYes: () => doUpload(fileToBeUpload),
        });
      } else {
        doUpload(fileToBeUpload);
      }
    }
  };

  onDownload = async (): Promise<void> => {
    try {
      const { currentPath, highlightedItem } = this.state;
      const { name } = highlightedItem;
      const path = currentPath.join('/');
      const file = await DeviceMaster.downloadFile(path, name, (p) => {
        this.setState({ downloadProgress: p });
      });
      this.setState({ downloadProgress: null });
      const getContent = async () => (file[1] as Blob);
      await dialog.writeFileDialog(getContent, name, name, [{
        name: i18n.lang.topmenu.file.all_files,
        extensions: ['*'],
      }]);
    } catch (e) {
      console.error('Error when downloading file', e);
    }
  };

  onDeleteFile = (): void => {
    const { currentPath, highlightedItem } = this.state;
    const path = currentPath.join('/');
    Alert.popUp({
      type: AlertConstants.SHOW_POPUP_INFO,
      message: LANG.monitor.confirmFileDelete,
      buttonType: AlertConstants.YES_NO,
      onYes: async () => {
        await DeviceMaster.deleteFile(path, highlightedItem.name);
        this.setShouldUpdateFileList(true);
      },
    });
  };

  onPlay = async (): Promise<void> => {
    const { device } = this.props;
    const {
      mode, report, currentPath, fileInfo, relocateOrigin,
    } = this.state;
    this.didErrorPopped = false;

    if (report.st_id === IDLE) {
      const vc = VersionChecker(device.version);
      console.log(device.version);
      if (vc.meetRequirement('RELOCATE_ORIGIN')) {
        console.log(relocateOrigin);
        await DeviceMaster.setOriginX(relocateOrigin.x);
        await DeviceMaster.setOriginY(relocateOrigin.y);
      }

      if (mode === Mode.PREVIEW) {
        const { previewTask } = this.state;
        const fCode = previewTask.fcodeBlob;
        try {
          await DeviceMaster.go(fCode, (progress: IProgress) => {
            const p = Math.floor((progress.step / progress.total) * 100);
            this.setState({ uploadProgress: p });
          });
          this.setState({ uploadProgress: null });
        } catch (error) {
          this.setState({ uploadProgress: null });
          Alert.popUp({ type: AlertConstants.SHOW_POPUP_ERROR, message: LANG.message.unable_to_start + error.error.join('_') });
        }
      } else if (mode === Mode.FILE_PREVIEW) {
        await DeviceMaster.goFromFile(currentPath.join('/'), fileInfo[0]);
      }
    } else if (MonitorStatus.isAbortedOrCompleted(report)) {
      DeviceMaster.restart();
    } else {
      // PAUSED
      DeviceMaster.resume();
    }
  };

  onPause = (): void => {
    DeviceMaster.pause();
  };

  onStop = (): void => {
    DeviceMaster.stop();
  };

  onMaintainMoveStart = (): void => {
    this.setState({ isMaintainMoving: true });
  };

  onMaintainMoveEnd = (x: number, y: number): void => {
    this.setState({
      isMaintainMoving: false,
      currentPosition: { x, y },
    });
  };

  onRelocate = (): void => {
    const { currentPosition } = this.state;
    const { x, y } = currentPosition;
    this.setState({
      relocateOrigin: { x, y },
      mode: this.modeBeforeRelocate,
    });
  };

  render(): JSX.Element {
    const { onClose, children } = this.props;
    const {
      enterWorkingMode,
      toggleCamera,
      startRelocate,
      endRelocate,
      onNavigationBtnClick,
      onHighlightItem,
      onSelectFolder,
      onSelectFile,
      setShouldUpdateFileList,
      onUpload,
      onDownload,
      onDeleteFile,
      onPlay,
      onPause,
      onStop,
      onMaintainMoveStart,
      onMaintainMoveEnd,
      onRelocate,
    } = this;
    return (
      <MonitorContext.Provider
        value={{
          onClose,
          ...this.state,
          enterWorkingMode,
          toggleCamera,
          startRelocate,
          endRelocate,
          onNavigationBtnClick,
          onHighlightItem,
          onSelectFolder,
          onSelectFile,
          setShouldUpdateFileList,
          onUpload,
          onDownload,
          onDeleteFile,
          onPlay,
          onPause,
          onStop,
          onMaintainMoveStart,
          onMaintainMoveEnd,
          onRelocate,
        }}
      >
        {children}
      </MonitorContext.Provider>
    );
  }
}
