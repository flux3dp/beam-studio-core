import classNames from 'classnames';
import React from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import checkSoftwareForAdor from 'helpers/check-software';
import CommonTools from 'app/components/beambox/top-bar/CommonTools';
import constant from 'app/actions/beambox/constant';
import Discover from 'helpers/api/discover';
import DocumentButton from 'app/components/beambox/top-bar/DocumentButton';
import ElementTitle from 'app/components/beambox/top-bar/ElementTitle';
import FileName from 'app/components/beambox/top-bar/FileName';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import FrameButton from 'app/components/beambox/top-bar/FrameButton';
import getDevice from 'helpers/device/get-device';
import GoButton from 'app/components/beambox/top-bar/GoButton';
import i18n from 'helpers/i18n';
import isWeb from 'helpers/is-web';
import Menu from 'app/components/beambox/top-bar/Menu';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import PathPreviewButton from 'app/components/beambox/top-bar/PathPreviewButton';
import PreviewButton from 'app/components/beambox/top-bar/PreviewButton';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import SelectMachineButton from 'app/components/beambox/top-bar/SelectMachineButton';
import showResizeAlert from 'helpers/device/fit-device-workarea-alert';
import storage from 'implementations/storage';
import TopBarHints from 'app/components/beambox/top-bar/TopBarHints';
import tutorialConstants from 'app/constants/tutorial-constants';
import tutorialController from 'app/views/tutorials/tutorialController';
import UserAvatar from 'app/components/beambox/top-bar/UserAvatar';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { TopBarHintsContextProvider } from 'app/contexts/TopBarHintsContext';

// TODO: move all styles from web to modules.scss
import styles from './TopBar.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { $ } = window;
const LANG = i18n.lang.topbar;
const isWhiteTopBar = window.os !== 'MacOS' && !isWeb();

interface State {
  hasDiscoverdMachine: boolean;
}

export default class TopBar extends React.PureComponent<Record<string, never>, State> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private discover: any;

  private defaultDeviceSerial: string | undefined;

  private isSettingUpPreviewMode = false;

  constructor(props: Record<string, never>) {
    super(props);
    this.defaultDeviceSerial = storage.get('selected-device');
    this.isSettingUpPreviewMode = false;
    this.state = {
      hasDiscoverdMachine: false,
    };
  }

  componentDidMount(): void {
    this.discover = Discover('top-bar', (deviceList) => {
      const { hasDiscoverdMachine } = this.state;
      const hasMachine = deviceList.some((device) => device.serial !== 'XXXXXXXXXX');
      if (hasMachine !== hasDiscoverdMachine) {
        this.setState({ hasDiscoverdMachine: hasMachine });
      }
      this.getDefaultDevice(deviceList);
    });
  }

  componentDidUpdate(): void {
    const { setShouldStartPreviewController, shouldStartPreviewController, setSetupPreviewMode } =
      this.context;
    setSetupPreviewMode(() => this.setupPreviewMode);
    if (shouldStartPreviewController) {
      this.setupPreviewMode();
      setShouldStartPreviewController(false);
    }
  }

  componentWillUnmount(): void {
    this.discover.removeListener('top-bar');
  }

  getDefaultDevice = (deviceList: IDeviceInfo[]): void => {
    const { selectedDevice, setSelectedDevice } = this.context;
    if (!selectedDevice && this.defaultDeviceSerial) {
      const defauldDevice = deviceList.find((device) => device.serial === this.defaultDeviceSerial);
      if (defauldDevice && !checkSoftwareForAdor(defauldDevice, false)) {
        this.defaultDeviceSerial = null;
      } else {
        setSelectedDevice(defauldDevice);
      }
    }
  };

  setupPreviewMode = async (showModal = false): Promise<void> => {
    if (this.isSettingUpPreviewMode) return;
    this.isSettingUpPreviewMode = true;
    const { device, isWorkareaMatched } = await getDevice(showModal);
    if (!(await PreviewModeController.checkDevice(device))) {
      this.isSettingUpPreviewMode = false;
      return;
    }
    if (!isWorkareaMatched && !(await showResizeAlert(device))) {
      this.isSettingUpPreviewMode = false;
      return;
    }

    const {
      setMode,
      startPreviewCallback,
      setStartPreviewCallback,
      updateCanvasContext,
    } = this.context;
    const workarea = document.getElementById('workarea');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    FnWrapper.useSelectTool();
    svgCanvas.clearSelection();
    $(workarea).css('cursor', 'wait');

    const onPreviewError = (errMessage) => {
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
      setMode(CanvasMode.Draw);
      $(workarea).css('cursor', 'auto');
    };

    try {
      await PreviewModeController.start(device, onPreviewError);
      if (!PreviewModeController.isPreviewModeOn) {
        $(workarea).css('cursor', 'auto');
        this.isSettingUpPreviewMode = false;
        return;
      }
      $(workarea).css('cursor', 'url(img/camera-cursor.svg) 9 12, cell');
      if (constant.adorModels.includes(device.model)) {
        PreviewModeController.previewFullWorkarea(() => {
          updateCanvasContext();
          if (tutorialController.getNextStepRequirement() === tutorialConstants.PREVIEW_PLATFORM) {
            tutorialController.handleNextStep();
          }
        });
      }
      setMode(CanvasMode.Preview);
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
    } finally {
      this.isSettingUpPreviewMode = false;
    }
  };

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
    if (isWeb()) {
      const { currentUser } = this.context;
      return (
        <div className={classNames('top-bar-menu-container', styles.menu)}>
          <Menu email={currentUser?.email} />
        </div>
      );
    }
    return null;
  }

  render(): JSX.Element {
    const { togglePathPreview } = this.context;
    const { hasDiscoverdMachine } = this.state;
    const { mode, hasUnsavedChange, currentUser } = this.context;
    return (
      <div
        className={classNames('top-bar', styles['top-bar'], { white: isWhiteTopBar })}
        onClick={() => ObjectPanelController.updateActiveKey(null)}
      >
        {(window.os === 'Windows' && !!window.titlebar) || (
          <FileName hasUnsavedChange={hasUnsavedChange} />
        )}
        <UserAvatar user={currentUser} />
        <PreviewButton />
        <div className={styles.right}>
          <SelectMachineButton />
          <DocumentButton />
          <FrameButton />
          <PathPreviewButton
            isDeviceConnected={hasDiscoverdMachine}
            togglePathPreview={togglePathPreview}
          />
          <GoButton hasText={isWhiteTopBar} hasDiscoverdMachine={hasDiscoverdMachine} />
        </div>
        <SelectedElementContext.Consumer>
          {({ selectedElement }) => <ElementTitle selectedElem={selectedElement} />}
        </SelectedElementContext.Consumer>
        {this.renderHint()}
        {this.renderMenu()}
        <CommonTools
          isWeb={isWeb()}
          hide={mode !== CanvasMode.Draw}
        />
      </div>
    );
  }
}

TopBar.contextType = CanvasContext;
