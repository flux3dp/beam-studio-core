import React from 'react';
import classNames from 'classnames';
import { sprintf } from 'sprintf-js';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import checkDeviceStatus from 'helpers/check-device-status';
import CommonTools from 'app/views/beambox/TopBar/CommonTools';
import Constant from 'app/actions/beambox/constant';
import DeviceMaster from 'helpers/device-master';
import Discover from 'helpers/api/discover';
import ElementTitle from 'app/views/beambox/TopBar/ElementTitle';
import FileName from 'app/views/beambox/TopBar/FileName';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import GoButton from 'app/views/beambox/TopBar/GoButton';
import i18n from 'helpers/i18n';
import LeftPanel from 'app/views/beambox/LeftPanel/LeftPanel';
import Menu from 'app/views/beambox/TopBar/Menu';
import Modal from 'app/widgets/Modal';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import Progress from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import TopBarHints from 'app/views/beambox/TopBar/TopBarHints';
import TutorialConstants from 'app/constants/tutorial-constants';
import VersionChecker from 'helpers/version-checker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { TopBarContext } from './contexts/TopBarContext';
import { TopBarHintsContextProvider } from './contexts/TopBarHintsContext';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const { $ } = window;
const lang = i18n.lang;
const LANG = i18n.lang.topbar;
const isNotMac = window.os !== 'MacOS';

interface State {
  isPreviewing: boolean;
  hasDiscoverdMachine: boolean;
  shouldShowDeviceList: boolean;
  deviceListDir: string;
  deviceListType?: string | null;
  selectDeviceCallback: (device?: IDeviceInfo) => void;
}

export class TopBar extends React.Component<{}, State> {
  private deviceList: IDeviceInfo[];

  private discover: any;

  constructor(props) {
    super(props);
    this.deviceList = [];
    this.state = {
      isPreviewing: false,
      hasDiscoverdMachine: false,
      shouldShowDeviceList: false,
      deviceListDir: 'right',
      selectDeviceCallback: () => { },
    };
  }

  componentDidMount() {
    this.discover = Discover(
      'top-bar',
      (deviceList) => {
        const { hasDiscoverdMachine, shouldShowDeviceList } = this.state;
        deviceList = deviceList.filter((device) => device.serial !== 'XXXXXXXXXX');
        deviceList.sort((deviceA, deviceB) => deviceA.name.localeCompare(deviceB.name));
        this.deviceList = deviceList;
        if ((deviceList.length > 0) !== hasDiscoverdMachine) {
          this.setState({ hasDiscoverdMachine: deviceList.length > 0 });
        }
        if (shouldShowDeviceList) {
          this.setState(this.state);
        }
      }
    );
  }

  componentWillUnmount() {
    this.discover.removeListener('top-bar');
  }

  componentDidUpdate() {
    const { setShouldStartPreviewController, shouldStartPreviewController } = this.context;
    if (shouldStartPreviewController) {
      this.showCameraPreviewDeviceList();
      setShouldStartPreviewController(false);
    }
  }

  renderPreviewButton = () => {
    const { isPreviewing } = this.state;
    const borderless = BeamboxPreference.read('borderless') || false;
    const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
    const previewText = (borderless && supportOpenBottom) ? `${LANG.preview} ${LANG.borderless}` : LANG.preview
    return (
      <div className={classNames('preview-button-container', { previewing: isPreviewing })}>
        <div className="img-container" onClick={() => { isPreviewing ? this.showCameraPreviewDeviceList() : this.changeToPreviewMode() }}>
          <img src="img/top-bar/icon-camera.svg" draggable={false} />
        </div>
        {isPreviewing ? <div className="title" onClick={() => this.showCameraPreviewDeviceList()}>{previewText}</div> : null}
      </div>
    );
  }

  changeToPreviewMode = () => {
    const { setTopBarPreviewMode } = this.context;
    svgCanvas.setMode('select');

    $('#workarea').contextMenu({ menu: [] }, () => { });
    $('#workarea').contextmenu(() => {
      this.endPreviewMode();
      return false;
    });
    setTopBarPreviewMode(true);
    const workarea = window['workarea'];
    $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
    this.setState({ isPreviewing: true });
    if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_PREVIEW_MODE) {
      TutorialController.handleNextStep();
    }
  }

  showCameraPreviewDeviceList = () => {
    if (!PreviewModeController.isPreviewMode()) {
      this.showDeviceList('camera', (device) => { this.startPreviewModeController(device) });
    }
  }

  startPreviewModeController = async (device: IDeviceInfo) => {
    const { setTopBarPreviewMode, startPreivewCallback, setStartPreviewCallback } = this.context;
    const workarea = window['workarea'];
    if (['fbm1', 'fbb1b', 'fbb1p', 'fbb2b'].includes(device.model) && device.model !== BeamboxPreference.read('workarea')) {
      const res = await new Promise((resolve) => {
        Alert.popUp({
          message: sprintf(lang.beambox.popup.change_workarea_before_preview, device.name),
          buttonType: AlertConstants.YES_NO,
          onYes: () => {
            BeamboxPreference.write('workarea', device.model);
            BeamboxPreference.write('model', device.model);
            svgCanvas.setResolution(Constant.dimension.getWidth(BeamboxPreference.read('workarea')), Constant.dimension.getHeight(BeamboxPreference.read('workarea')));
            svgEditor.resetView();
            PreviewModeBackgroundDrawer.updateCanvasSize();
            beamboxStore.emitUpdateLaserPanel();
            OpenBottomBoundaryDrawer.update();
            resolve(true);
          },
          onNo: () => resolve(false),
        });
      });
      if (!res) {
        return;
      }
    }

    FnWrapper.useSelectTool();
    svgCanvas.clearSelection();
    const vc = VersionChecker(device.version);
    Progress.openNonstopProgress({
      id: 'start-preview-controller',
      message: lang.message.tryingToConenctMachine,
    });
    if (!vc.meetRequirement('USABLE_VERSION')) {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: lang.beambox.popup.should_update_firmware_to_continue,
      });
      Progress.popById('start-preview-controller');
      return;
    }

    if (BeamboxPreference.read('borderless') && !vc.meetRequirement('BORDERLESS_MODE')) {
      const message = `#814 ${lang.camera_calibration.update_firmware_msg1} 2.5.1 ${lang.camera_calibration.update_firmware_msg2} ${lang.beambox.popup.or_turn_off_borderless_mode}`;
      const caption = lang.beambox.left_panel.borderless_preview;
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
        caption
      });
      Progress.popById('start-preview-controller');
      return;
    }
    Progress.popById('start-preview-controller');

    $(workarea).css('cursor', 'wait');
    try {
      await PreviewModeController.start(device, (errMessage) => {
        if (errMessage === 'Timeout has occurred') {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: LANG.alerts.start_preview_timeout,
          });
        } else {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: `${LANG.alerts.fail_to_start_preview}<br/>${errMessage}`,
          });
        }
        setTopBarPreviewMode(false);
        this.setState({ isPreviewing: false });
        $(workarea).css('cursor', 'auto');
      });
      $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
      if (startPreivewCallback) {
        startPreivewCallback();
        setStartPreviewCallback(null);
      }
    } catch (error) {
      console.error(error);
      if (error.message && error.message.startsWith('Camera WS')) {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: `${LANG.alerts.fail_to_connect_with_camera}<br/>${error.message || ''}`,
        });
      } else {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: `${LANG.alerts.fail_to_start_preview}<br/>${error.message || ''}`,
        });
      }
      FnWrapper.useSelectTool();
      return;
    }
  }

  endPreviewMode = () => {
    const { setTopBarPreviewMode } = this.context;
    try {
      if (PreviewModeController.isPreviewMode()) {
        PreviewModeController.end();
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_EDIT_MODE) {
        TutorialController.handleNextStep();
      }
      FnWrapper.useSelectTool();
      $('#workarea').off('contextmenu');
      svgEditor.setWorkAreaContextMenu();
      setTopBarPreviewMode(false);
      this.setState({
        isPreviewing: false,
      });
    }
  }

  showDeviceList = (type, selectDeviceCallback) => {
    const { deviceList } = this;
    if (deviceList.length > 0) {
      if (storage.get('auto_connect') !== 0 && deviceList.length === 1) {
        this.handleSelectDevice(deviceList[0], (device) => { selectDeviceCallback(device) });
        return;
      }
      this.setState({
        shouldShowDeviceList: true,
        deviceListType: type,
        selectDeviceCallback,
      });
    } else {
      Alert.popUp({
        caption: lang.alert.oops,
        message: lang.device_selection.no_beambox,
      });
    }
  }

  resetStartPreviewCallback = () => {
    const { startPreivewCallback, setStartPreviewCallback, updateTopBar } = this.context;
    if (startPreivewCallback) {
      setStartPreviewCallback(null);
      updateTopBar();
    }
  }

  hideDeviceList = () => {
    this.setState({
      shouldShowDeviceList: false,
      selectDeviceCallback: () => { }
    });
  }

  renderDeviceList() {
    const { deviceList } = this;
    const { shouldShowDeviceList, selectDeviceCallback, deviceListType } = this.state;
    if (!shouldShowDeviceList) {
      return null;
    }
    let status = lang.machine_status;
    let progress;
    let options = deviceList.map((device) => {
      let statusText = status[device.st_id] || status.UNKNOWN;

      if (device.st_prog === 0) {
        progress = '';
      }
      else if (16 === device.st_id && 'number' === typeof device.st_prog) {
        progress = (device.st_prog * 100).toFixed(1) + '%';
      }
      else {
        progress = '';
      }

      let img = `img/icon_${device.source === 'h2h' ? 'usb' : 'wifi'}.svg`;

      return (
        <li
          key={device.uuid}
          onClick={() => { this.handleSelectDevice(device, (device) => { selectDeviceCallback(device) }) }}
          data-test-key={device.serial}
        >
          <label className="name">{device.name}</label>
          <label className="status">{statusText}</label>
          <label className="progress">{progress}</label>
          <label className="connection-type">
            <div className="type">
              <img src={img} />
            </div>
          </label>
        </li>
      );
    });

    let list = (0 < options.length) ? options : (<div key="spinner-roller" className="spinner-roller spinner-roller-reverse" />);
    const menuClass = classNames('menu', deviceListType);
    return (
      <Modal onClose={() => {
        this.resetStartPreviewCallback();
        this.hideDeviceList();
      }}>
        <div className={menuClass}>
          <div className={classNames('arrow', { 'arrow-left': deviceListType === 'camera', 'arrow-right': deviceListType === 'export' })} />
          <div className="device-list">
            <ul>{list}</ul>
          </div>
        </div>
      </Modal>
    );
  }

  handleSelectDevice = async (device, callback: Function) => {
    this.hideDeviceList();
    try {
      const status = await DeviceMaster.select(device);
      if (status && status.success) {
        const res = await checkDeviceStatus(device);
        if (res) {
          callback(device);
        }
      }
    } catch (e) {
      console.error(e);
      Alert.popUp({
        id: 'fatal-occurred',
        message: '#813' + e.toString(),
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
    }
  }

  renderHint() {
    return (
      <TopBarHintsContextProvider>
        <TopBarHints />
      </TopBarHintsContextProvider>
    );
  }

  renderMenu() {
    if (window.FLUX.version === 'web') {
      const { currentUser } = this.context;
      return (
        <div className={classNames('top-bar-menu-container')}>
          <Menu email={currentUser?.email} />
        </div>
      );
    }
    return null;
  }

  render() {
    const { isPreviewing, hasDiscoverdMachine } = this.state;
    const { setShouldStartPreviewController, currentUser, fileName, hasUnsavedChange, selectedElem } = this.context;
    return (
      <div className="top-bar-left-panel-container">
        <LeftPanel
          isPreviewing={isPreviewing}
          setShouldStartPreviewController={setShouldStartPreviewController}
          endPreviewMode={this.endPreviewMode}
        />
        <div className={classNames('top-bar', { win: isNotMac })}>
          <FileName fileName={fileName} hasUnsavedChange={hasUnsavedChange} />
          {this.renderPreviewButton()}
          <GoButton
            isNotMac={isNotMac}
            hasDiscoverdMachine={hasDiscoverdMachine}
            hasDevice={this.deviceList.length > 0}
            endPreviewMode={this.endPreviewMode}
            showDeviceList={this.showDeviceList}
          />
          {this.renderDeviceList()}
          <ElementTitle selectedElem={selectedElem} />
          {this.renderHint()}
          {this.renderMenu()}
          <CommonTools
            isWeb={window.FLUX.version === 'web'}
            isPreviewing={isPreviewing}
          />
        </div>
      </div>
    );
  }
}

TopBar.contextType = TopBarContext;
