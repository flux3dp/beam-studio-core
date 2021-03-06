import React from 'react';
import classNames from 'classnames';
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import checkDeviceStatus from 'helpers/check-device-status';
import CommonTools from 'app/components/beambox/top-bar/CommonTools';
import Constant from 'app/actions/beambox/constant';
import DeviceMaster from 'helpers/device-master';
import diodeBoundaryDrawer from 'app/actions/beambox/diode-boundary-drawer';
import Discover from 'helpers/api/discover';
import ElementTitle from 'app/components/beambox/top-bar/ElementTitle';
import fileExportHelper from 'helpers/file-export-helper';
import FileName from 'app/components/beambox/top-bar/FileName';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import GoButton from 'app/components/beambox/top-bar/GoButton';
import i18n from 'helpers/i18n';
import Menu from 'app/components/beambox/top-bar/Menu';
import Modal from 'app/widgets/Modal';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import PathPreviewButton from 'app/components/beambox/top-bar/PathPreviewButton';
import PreviewButton from 'app/components/beambox/top-bar/PreviewButton';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import Progress from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import TopBarHints from 'app/components/beambox/top-bar/TopBarHints';
import VersionChecker from 'helpers/version-checker';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { TopBarLeftPanelContext } from 'app/contexts/TopBarLeftPanelContext';
import { TopBarHintsContextProvider } from 'app/contexts/TopBarHintsContext';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const { $ } = window;
const { lang } = i18n;
const LANG = i18n.lang.topbar;
const isWhiteTopBar = window.os !== 'MacOS' && window.FLUX.version !== 'web';

interface State {
  hasDiscoverdMachine: boolean;
  shouldShowDeviceList: boolean;
  deviceListType?: string | null;
  selectDeviceCallback: (device?: IDeviceInfo) => void;
}

interface Props {
  isPathPreviewing: boolean;
  togglePathPreview: () => void
}

export default class TopBar extends React.Component<Props, State> {
  private deviceList: IDeviceInfo[];

  private discover: any;

  constructor(props: Props) {
    super(props);
    this.deviceList = [];
    this.state = {
      hasDiscoverdMachine: false,
      shouldShowDeviceList: false,
      selectDeviceCallback: () => { },
    };
  }

  componentDidMount(): void {
    this.discover = Discover(
      'top-bar',
      (deviceList) => {
        const { hasDiscoverdMachine, shouldShowDeviceList } = this.state;
        const filteredList = deviceList.filter((device) => device.serial !== 'XXXXXXXXXX');
        filteredList.sort((deviceA, deviceB) => deviceA.name.localeCompare(deviceB.name));
        this.deviceList = filteredList;
        if ((filteredList.length > 0) !== hasDiscoverdMachine) {
          this.setState({ hasDiscoverdMachine: filteredList.length > 0 });
        }
        if (shouldShowDeviceList) this.forceUpdate();
      },
    );
  }

  componentDidUpdate(): void {
    const { setShouldStartPreviewController, shouldStartPreviewController } = this.context;
    if (shouldStartPreviewController) {
      this.showCameraPreviewDeviceList();
      setShouldStartPreviewController(false);
    }
  }

  componentWillUnmount(): void {
    this.discover.removeListener('top-bar');
  }

  showCameraPreviewDeviceList = (): void => {
    if (!PreviewModeController.isPreviewMode()) {
      this.showDeviceList('camera', (device) => this.startPreviewModeController(device));
    }
  };

  startPreviewModeController = async (device: IDeviceInfo): Promise<void> => {
    const {
      setIsPreviewing,
      setTopBarPreviewMode,
      startPreviewCallback,
      setStartPreviewCallback,
    } = this.context;
    const workarea = document.getElementById('workarea');
    if (['fbm1', 'fbb1b', 'fbb1p', 'fhexa1'].includes(device.model) && device.model !== BeamboxPreference.read('workarea')) {
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
            diodeBoundaryDrawer.updateCanvasSize();
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
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
        caption,
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
            message: `${LANG.alerts.fail_to_start_preview}<br/>${errMessage}`,
          });
        }
        setTopBarPreviewMode(false);
        setIsPreviewing(false);
        $(workarea).css('cursor', 'auto');
      });
      $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
      if (startPreviewCallback) {
        startPreviewCallback();
        setStartPreviewCallback(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      if (error.message && error.message.startsWith('Camera WS')) {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: `${LANG.alerts.fail_to_connect_with_camera}<br/>${error.message || ''}`,
        });
      } else {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: `${LANG.alerts.fail_to_start_preview}<br/>${error.message || ''}`,
        });
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      FnWrapper.useSelectTool();
    }
  };

  showDeviceList = (type: string, selectDeviceCallback: (device: IDeviceInfo) => void): void => {
    const { deviceList } = this;
    if (deviceList.length > 0) {
      if (storage.get('auto_connect') !== 0 && deviceList.length === 1) {
        this.handleSelectDevice(deviceList[0], (device) => selectDeviceCallback(device));
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
        buttonType: AlertConstants.CUSTOM_CANCEL,
        buttonLabels: [lang.topbar.menu.add_new_machine],
        callbacks: async () => {
          const res = await fileExportHelper.toggleUnsavedChangedDialog();
          if (res) window.location.hash = '#initialize/connect/select-connection-type';
        },
      });
    }
  };

  resetStartPreviewCallback = (): void => {
    const { startPreviewCallback, setStartPreviewCallback, updateTopBar } = this.context;
    if (startPreviewCallback) {
      setStartPreviewCallback(null);
      updateTopBar();
    }
  };

  hideDeviceList = (): void => {
    this.setState({
      shouldShowDeviceList: false,
      selectDeviceCallback: () => { },
    });
  };

  handleSelectDevice = async (
    device: IDeviceInfo,
    callback: (device: IDeviceInfo) => void,
  ): Promise<void> => {
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
      // eslint-disable-next-line no-console
      console.error(e);
      Alert.popUp({
        id: 'fatal-occurred',
        message: `#813 ${e.toString()}`,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
    }
  };

  renderDeviceList(): JSX.Element {
    const { deviceList } = this;
    const { shouldShowDeviceList, selectDeviceCallback, deviceListType } = this.state;
    if (!shouldShowDeviceList) {
      return null;
    }
    const status = lang.machine_status;
    let progress;
    const options = deviceList.map((device) => {
      const statusText = status[device.st_id] || status.UNKNOWN;

      if (device.st_prog === 0) {
        progress = '';
      } else if (device.st_id === 16 && typeof device.st_prog === 'number') {
        progress = `${(device.st_prog * 100).toFixed(1)}%`;
      } else {
        progress = '';
      }

      const img = `img/icon_${device.source === 'h2h' ? 'usb' : 'wifi'}.svg`;

      return (
        <li
          key={device.uuid}
          onClick={() => this.handleSelectDevice(device, (d) => selectDeviceCallback(d))}
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

    const list = (options.length > 0) ? options : (<div key="spinner-roller" className="spinner-roller spinner-roller-reverse" />);
    const menuClass = classNames('menu', deviceListType);
    return (
      <Modal
        onClose={() => {
          this.resetStartPreviewCallback();
          this.hideDeviceList();
        }}
      >
        <div className={menuClass}>
          <div className={classNames('arrow', { 'arrow-left': deviceListType === 'camera', 'arrow-right': deviceListType === 'export' })} />
          <div className="device-list">
            <ul>{list}</ul>
          </div>
        </div>
      </Modal>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderHint(): JSX.Element {
    return (
      <TopBarHintsContextProvider>
        <TopBarHints />
      </TopBarHintsContextProvider>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderMenu(): JSX.Element {
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

  render(): JSX.Element {
    const { isPathPreviewing, togglePathPreview } = this.props;
    const { hasDiscoverdMachine } = this.state;
    const {
      isPreviewing,
      fileName,
      hasUnsavedChange,
      selectedElem,
      setTopBarPreviewMode,
      setIsPreviewing,
      endPreviewMode,
    } = this.context;
    const { deviceList } = this;
    return (
      <div className={classNames('top-bar', { white: isWhiteTopBar })}>
        <FileName fileName={fileName} hasUnsavedChange={hasUnsavedChange} />
        <PreviewButton
          isPreviewing={isPreviewing}
          isPathPreviewing={isPathPreviewing}
          showCameraPreviewDeviceList={this.showCameraPreviewDeviceList}
          endPreviewMode={endPreviewMode}
          setTopBarPreviewMode={setTopBarPreviewMode}
          enterPreviewMode={() => setIsPreviewing(true)}
        />
        <PathPreviewButton
          isPathPreviewing={isPathPreviewing}
          isDeviceConnected={deviceList.length > 0}
          togglePathPreview={togglePathPreview}
        />
        <GoButton
          hasText={isWhiteTopBar}
          hasDiscoverdMachine={hasDiscoverdMachine}
          hasDevice={this.deviceList.length > 0}
          endPreviewMode={endPreviewMode}
          showDeviceList={this.showDeviceList}
        />
        {this.renderDeviceList()}
        <ElementTitle selectedElem={selectedElem} />
        {this.renderHint()}
        {this.renderMenu()}
        <CommonTools
          isWeb={window.FLUX.version === 'web'}
          hide={isPreviewing || isPathPreviewing}
        />
      </div>
    );
  }
}

TopBar.contextType = TopBarLeftPanelContext;
