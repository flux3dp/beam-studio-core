import React, { memo, useEffect } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';
import useWorkarea from 'helpers/hooks/useWorkarea';
import { getSupportInfo } from 'app/constants/add-on';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import AutoFocus from './AutoFocus';
import Diode from './Diode';
import styles from './AddOnBlock.module.scss';

const AddOnBlock = (): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const lang = useI18n().beambox.right_panel.laser_panel;
  const workarea = useWorkarea();
  const supportInfo = getSupportInfo(workarea as WorkAreaModel);
  useEffect(() => {
    const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
    canvasEvents.on('document-settings-saved', forceUpdate);
    return () => {
      canvasEvents.off('document-settings-saved', forceUpdate);
    };
  }, [forceUpdate]);

  const isAFEnabled = beamboxPreference.read('enable-autofocus') && supportInfo.autoFocus;
  const isDiodeEnabled = beamboxPreference.read('enable-diode') && supportInfo.hybridLaser;
  console.log('isAFEnabled', isAFEnabled);
  console.log('isDiodeEnabled', isDiodeEnabled);
  if (!isAFEnabled && !isDiodeEnabled) return null;

  return (
    <div>
      <div className={styles.label}>{lang.add_on}</div>
      <div className={styles.settings}>
        {isAFEnabled && <AutoFocus />}
        {isDiodeEnabled && <Diode />}
      </div>
    </div>
  );
};

export default memo(AddOnBlock);
