import React from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import useI18n from 'helpers/useI18n';

import AutoFocus from './AutoFocus';
import Diode from './Diode';

const { addonsSupportList } = constant;

// TODO: add test
const AddOnBlock = (): JSX.Element => {
  const lang = useI18n().beambox.right_panel.laser_panel;
  const workarea = beamboxPreference.read('enable-autofocus');

  const isAFEnabled = beamboxPreference.read('enable-autofocus') && addonsSupportList.autoFocus.includes(workarea);
  const isDiodeEnabled = beamboxPreference.read('enable-diode') && addonsSupportList.hybridLaser.includes(workarea);
  if (!isAFEnabled && !isDiodeEnabled) return null;

  return (
    <div className="addon-block">
      <div className="label">{lang.add_on}</div>
      <div className="addon-setting">
        {isAFEnabled && <AutoFocus />}
        {isDiodeEnabled && <Diode />}
      </div>
    </div>
  );
};

export default AddOnBlock;
