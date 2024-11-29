import classNames from 'classnames';
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { TopBarHintsContextProvider } from 'app/contexts/TopBarHintsContext';

import Tabs from './tabs/Tabs';
// TODO: move all styles from web to modules.scss
import styles from './TopBar.module.scss';

const isWhiteTopBar = window.os !== 'MacOS' && !isWeb();

const Topbar = (): JSX.Element => {
  const isWebMode = useMemo(() => isWeb(), []);
  const { mode, currentUser, togglePathPreview, setSelectedDevice } = useContext(CanvasContext);
  const [hasDiscoveredMachine, setHasDiscoveredMachine] = useState(false);
  const defaultDeviceUUID = useRef<string | null>(storage.get('selected-device'));
  useEffect(() => {
    const discover = Discover('top-bar', (deviceList) => {
      setHasDiscoveredMachine(deviceList.some((device) => device.serial !== 'XXXXXXXXXX'));
      setSelectedDevice((cur) => {
        if (!cur && defaultDeviceUUID.current) {
          const defauldDevice = deviceList.find(
            (device) => device.uuid === defaultDeviceUUID.current
          );
          if (defauldDevice && !checkSoftwareForAdor(defauldDevice, false)) {
            defaultDeviceUUID.current = null;
          } else {
            return defauldDevice;
          }
        }
        return cur;
      });
    });
    return () => {
      discover.removeListener('top-bar');
    };
  }, [setSelectedDevice]);

  return (
    <div
      className={classNames('top-bar', styles['top-bar'], { white: isWhiteTopBar })}
      onClick={() => ObjectPanelController.updateActiveKey(null)}
    >
      {(window.os === 'Windows' && !!window.titlebar) || (
        <FileName hasUnsavedChange={hasUnsavedChange} />
      )}
      <div className={classNames(styles.controls, styles.left)}>
        <UserAvatar user={currentUser} />
        <PreviewButton />
        <CommonTools isWeb={isWebMode} hide={mode !== CanvasMode.Draw} />
        {!isWebMode && <Tabs />}
      </div>
      <div className={classNames(styles.controls, styles.right)}>
        <SelectMachineButton />
        <DocumentButton />
        <FrameButton />
        <PathPreviewButton
          isDeviceConnected={hasDiscoveredMachine}
          togglePathPreview={togglePathPreview}
        />
        <GoButton hasText={isWhiteTopBar} hasDiscoverdMachine={hasDiscoveredMachine} />
      </div>
      <SelectedElementContext.Consumer>
        {({ selectedElement }) => <ElementTitle selectedElem={selectedElement} />}
      </SelectedElementContext.Consumer>
      <TopBarHintsContextProvider>
        <TopBarHints />
      </TopBarHintsContextProvider>
      {isWeb() && (
        <div className={classNames('top-bar-menu-container', styles.menu)}>
          <Menu email={currentUser?.email} />
        </div>
      )}
    </div>
  );
};

export default memo(Topbar);
