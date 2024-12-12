import classNames from 'classnames';
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';

import checkSoftwareForAdor from 'helpers/check-software';
import CommonTools from 'app/components/beambox/top-bar/CommonTools';
import Discover from 'helpers/api/discover';
import DocumentButton from 'app/components/beambox/top-bar/DocumentButton';
import ElementTitle from 'app/components/beambox/top-bar/ElementTitle';
import FrameButton from 'app/components/beambox/top-bar/FrameButton';
import GoButton from 'app/components/beambox/top-bar/GoButton';
import isWeb from 'helpers/is-web';
import Menu from 'app/components/beambox/top-bar/Menu';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import PathPreviewButton from 'app/components/beambox/top-bar/PathPreviewButton';
import SelectMachineButton from 'app/components/beambox/top-bar/SelectMachineButton';
import storage from 'implementations/storage';
import TopBarHints from 'app/components/beambox/top-bar/TopBarHints';
import UserAvatar from 'app/components/beambox/top-bar/UserAvatar';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { CanvasMode } from 'app/constants/canvasMode';
import {
  registerWindowUpdateTitle,
  unregisterWindowUpdateTitle,
} from 'app/components/beambox/top-bar/FileName';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { TopBarHintsContextProvider } from 'app/contexts/TopBarHintsContext';

import styles from './TopBar.module.scss';
import Tabs from './tabs/Tabs';

const Topbar = (): JSX.Element => {
  const { isWebMode, hasTitleBar } = useMemo(() => {
    const web = isWeb();
    return { isWebMode: web, hasTitleBar: window.os !== 'MacOS' && !web };
  }, []);
  const { mode, currentUser, togglePathPreview, setSelectedDevice } = useContext(CanvasContext);
  const [hasDiscoveredMachine, setHasDiscoveredMachine] = useState(false);
  const defaultDeviceUUID = useRef<string | null>(storage.get('selected-device'));
  useEffect(() => {
    registerWindowUpdateTitle();
    return () => {
      unregisterWindowUpdateTitle();
    };
  }, []);

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
    <>
      <div
        className={styles['top-bar']}
        onClick={() => ObjectPanelController.updateActiveKey(null)}
      >
        <div
          className={classNames(styles.controls, styles.left, {
            [styles['margin-left']]: hasTitleBar,
          })}
        >
          {!hasTitleBar && <div className={styles['drag-area']} />}
          <UserAvatar user={currentUser} />
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
          <GoButton hasDiscoverdMachine={hasDiscoveredMachine} />
        </div>
        {isWeb() && (
          <div className={classNames('top-bar-menu-container', styles.menu)}>
            <Menu email={currentUser?.email} />
          </div>
        )}
      </div>
      <SelectedElementContext.Consumer>
        {({ selectedElement }) => <ElementTitle selectedElem={selectedElement} />}
      </SelectedElementContext.Consumer>
      <TopBarHintsContextProvider>
        <TopBarHints />
      </TopBarHintsContextProvider>
    </>
  );
};

export default memo(Topbar);
