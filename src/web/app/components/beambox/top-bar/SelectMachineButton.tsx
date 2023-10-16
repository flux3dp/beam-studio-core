import React, { useContext, useMemo } from 'react';

import getDevice from 'helpers/device/get-device';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './SelectMachineButton.module.scss';

function SelectMachineButton(): JSX.Element {
  const isMobile = useIsMobile();
  const i18n = useI18n();
  const { isPreviewing, selectedDevice, setupPreviewMode } = useContext(CanvasContext);
  const text = useMemo(() => {
    if (isMobile) return '';
    if (selectedDevice) return selectedDevice.name;
    return i18n.topbar.select_machine;
  }, [isMobile, selectedDevice, i18n]);
  return (
    <div
      className={styles.button}
      onClick={() => (isPreviewing ? setupPreviewMode : getDevice)(true)}
    >
      <TopBarIcons.SelectMachine />
      {!isMobile && <span className={styles.text}>{text}</span>}
    </div>
  );
}

export default SelectMachineButton;
