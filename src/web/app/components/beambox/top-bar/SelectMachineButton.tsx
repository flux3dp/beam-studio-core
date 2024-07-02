import React, { useContext, useMemo } from 'react';

import getDevice from 'helpers/device/get-device';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './SelectMachineButton.module.scss';

function SelectMachineButton(): JSX.Element {
  const isMobile = useIsMobile();
  const i18n = useI18n();
  const { mode, selectedDevice, setupPreviewMode } = useContext(CanvasContext);
  const text = useMemo(() => {
    if (isMobile) return '';
    if (selectedDevice) return selectedDevice.name;
    return i18n.topbar.select_machine;
  }, [isMobile, selectedDevice, i18n]);
  return (
    <div
      className={styles.button}
      onClick={() => (mode === CanvasMode.Preview ? setupPreviewMode : getDevice)(true)}
    >
      <TopBarIcons.SelectMachine />
      {!isMobile && <span className={styles.text} data-testid="select-machine">{text}</span>}
    </div>
  );
}

export default SelectMachineButton;
