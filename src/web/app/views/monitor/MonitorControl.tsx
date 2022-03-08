import React from 'react';
import classNames from 'classnames';

import DeviceConstants from 'app/constants/device-constants';
import i18n from 'helpers/i18n';
import MonitorStatus, { ButtonTypes } from 'helpers/monitor-status';
import { ItemType, Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';
import { IReport } from 'interfaces/IDevice';

const LANG = i18n.lang.monitor;

enum ButtonPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export default class MonitorControl extends React.PureComponent {
  mapButtonTypeToElement(buttonType: ButtonTypes, position: ButtonPosition): JSX.Element {
    const { onPlay, onPause, onStop } = this.context;
    if (buttonType === ButtonTypes.PLAY) return this.renderControlButton(position, true, 'btn-go', LANG.go, onPlay);
    if (buttonType === ButtonTypes.DISABLED_PLAY) return this.renderControlButton(position, false, 'btn-go', LANG.go, null);
    if (buttonType === ButtonTypes.PAUSE) return this.renderControlButton(position, true, 'btn-pause', LANG.pause, onPause);
    if (buttonType === ButtonTypes.DISABLED_PAUSE) return this.renderControlButton(position, false, 'btn-pause', LANG.pause, null);
    if (buttonType === ButtonTypes.STOP) return this.renderControlButton(position, true, 'btn-stop', LANG.stop, onStop);
    if (buttonType === ButtonTypes.DISABLED_STOP) return this.renderControlButton(position, false, 'btn-stop', LANG.stop, null);
    return null;
  }

  renderRelocateButton(): JSX.Element {
    const { isMaintainMoving, onRelocate } = this.context;
    const className = classNames('controls right', { disabled: isMaintainMoving });
    return (
      <div className={className} onClick={onRelocate}>
        <div className="btn-control btn-relocate">
          <img src="img/beambox/icon-target.svg" />
        </div>
        <div className="description">{LANG.relocate}</div>
      </div>
    );
  }

  renderCameraButton(enable: boolean): JSX.Element {
    const { mode, toggleCamera } = this.context;
    const className = classNames('controls right', { disabled: !enable });
    const iconClass = classNames('btn-camera btn-control', { on: mode === Mode.CAMERA });
    const descriptionClass = classNames('description', { on: mode === Mode.CAMERA });
    return (
      <div className={className} onClick={toggleCamera}>
        <div className={iconClass} />
        <div className={descriptionClass}>{LANG.camera}</div>
      </div>
    );
  }

  renderUploadButton(enable: boolean): JSX.Element {
    const { onUpload } = this.context;
    const containerClass = classNames('controls left', { disabled: !enable });
    return (
      <div className={containerClass} onClick={onUpload}>
        <div className="btn-upload btn-control" />
        <input className="upload-control" type="file" accept=".fc" onChange={onUpload} />
        <div className="description">{LANG.upload}</div>
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderControlButton(
    position: ButtonPosition,
    enable: boolean,
    iconClass: string,
    description: string,
    callback = () => { },
  ): JSX.Element {
    const containerClass = classNames('controls', position, { disabled: !enable });
    return (
      <div className={containerClass} onClick={() => callback()}>
        <div className={classNames('btn-control', iconClass)} />
        <div className="description">{description}</div>
      </div>
    );
  }

  renderLeftButton(
    mode: Mode,
    currentPath: string[],
    report: IReport,
    onStop: () => void,
    endRelocate: () => void,
  ): JSX.Element {
    if (mode === Mode.FILE) return this.renderUploadButton(currentPath.length > 0);
    if (mode === Mode.PREVIEW || mode === Mode.FILE_PREVIEW) return this.renderControlButton(ButtonPosition.LEFT, false, 'btn-stop', LANG.stop, onStop);
    if (mode === Mode.WORKING) {
      return this.mapButtonTypeToElement(
        MonitorStatus.getControlButtonType(report).left, ButtonPosition.LEFT,
      );
    }
    if (mode === Mode.CAMERA) return this.renderControlButton(ButtonPosition.LEFT, false, 'btn-stop', LANG.stop);
    if (mode === Mode.CAMERA_RELOCATE) return this.renderControlButton(ButtonPosition.LEFT, true, 'btn-cancel', LANG.cancel, endRelocate);
    return null;
  }

  renderMidButton(
    mode: Mode,
    highlightedItem: {
      type: ItemType;
      name: string;
    },
    report: IReport,
    onDownload: () => Promise<void>,
    onPlay: () => Promise<void>,
  ): JSX.Element {
    if (mode === Mode.FILE) {
      return this.renderControlButton(
        ButtonPosition.CENTER,
        highlightedItem && highlightedItem.type === ItemType.FILE,
        'btn-download',
        LANG.download,
        onDownload,
      );
    }
    if (mode === Mode.PREVIEW || mode === Mode.FILE_PREVIEW) {
      return this.renderControlButton(
        ButtonPosition.CENTER,
        (!!report && report.st_id === DeviceConstants.status.IDLE),
        'btn-go',
        LANG.go,
        onPlay,
      );
    }
    if (mode === Mode.WORKING) {
      return this.mapButtonTypeToElement(
        MonitorStatus.getControlButtonType(report).mid,
        ButtonPosition.CENTER,
      );
    }
    if (mode === Mode.CAMERA) return this.renderControlButton(ButtonPosition.CENTER, false, 'btn-go', LANG.go);
    return null;
  }

  renderRightButton(mode: Mode, report: IReport): JSX.Element {
    if (mode === Mode.CAMERA_RELOCATE) {
      return this.renderRelocateButton();
    }
    const deviceStatusId = DeviceConstants.status;
    const isCameraEnabled = [
      deviceStatusId.IDLE,
      deviceStatusId.PAUSED,
      deviceStatusId.PAUSED_FROM_STARTING,
      deviceStatusId.PAUSED_FROM_RUNNING,
      deviceStatusId.COMPLETED,
      deviceStatusId.ABORTED,
    ].includes(report.st_id);
    return this.renderCameraButton(isCameraEnabled);
  }

  render(): JSX.Element {
    const {
      mode,
      currentPath,
      highlightedItem,
      report,
      onDownload,
      onPlay,
      onStop,
      endRelocate,
    } = this.context;
    return (
      <div className="operation">
        {this.renderLeftButton(mode, currentPath, report, onStop, endRelocate)}
        {this.renderMidButton(mode, highlightedItem, report, onDownload, onPlay)}
        {this.renderRightButton(mode, report)}
      </div>
    );
  }
}

MonitorControl.contextType = MonitorContext;
