import classNames from 'classnames';
import React from 'react';

import checkSoftwareForAdor from 'helpers/check-software';
import CommonTools from 'app/components/beambox/top-bar/CommonTools';
import Discover from 'helpers/api/discover';
import DocumentButton from 'app/components/beambox/top-bar/DocumentButton';
import ElementTitle from 'app/components/beambox/top-bar/ElementTitle';
import FileName from 'app/components/beambox/top-bar/FileName';
import FrameButton from 'app/components/beambox/top-bar/FrameButton';
import GoButton from 'app/components/beambox/top-bar/GoButton';
import isWeb from 'helpers/is-web';
import Menu from 'app/components/beambox/top-bar/Menu';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import PathPreviewButton from 'app/components/beambox/top-bar/PathPreviewButton';
import PreviewButton from 'app/components/beambox/top-bar/PreviewButton';
import SelectMachineButton from 'app/components/beambox/top-bar/SelectMachineButton';
import storage from 'implementations/storage';
import TopBarHints from 'app/components/beambox/top-bar/TopBarHints';
import UserAvatar from 'app/components/beambox/top-bar/UserAvatar';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { IDeviceInfo } from 'interfaces/IDevice';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { TopBarHintsContextProvider } from 'app/contexts/TopBarHintsContext';

// TODO: move all styles from web to modules.scss
import styles from './TopBar.module.scss';

const isWhiteTopBar = window.os !== 'MacOS' && !isWeb();

interface State {
  hasDiscoverdMachine: boolean;
}

export default class TopBar extends React.PureComponent<Record<string, never>, State> {
  // eslint-disable-next-line react/static-property-placement
  declare context: React.ContextType<typeof CanvasContext>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private discover: any;

  private defaultDeviceSerial: string | undefined;

  constructor(props: Record<string, never>) {
    super(props);
    this.defaultDeviceSerial = storage.get('selected-device');
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
