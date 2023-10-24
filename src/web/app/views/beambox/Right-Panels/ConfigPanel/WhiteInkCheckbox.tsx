import React, { useContext, useState } from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import ConfigPanelIcons from 'app/icons/config-panel/ConfigPanelIcons';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './WhiteInkCheckbox.module.scss';
import WhiteInkSettingsModal from './WhiteInkSettingsModal';

// TODO: add test
const WhiteInkCheckbox = (): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const [showModal, setShowModal] = useState(false);
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { wInk } = state;
  const { value } = wInk;

  const handleChange = (e: CheckboxChangeEvent) => {
    const newVal = (e.target.checked ? 1 : -1) * Math.abs(value);
    dispatch({
      type: 'change',
      payload: { wInk: newVal },
    });
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.wInk, newVal);
    });
  };

  return (
    <>
      <div className={styles.panel}>
        <Checkbox checked={value > 0} onChange={handleChange} className="white-ink-checkbox">
          <div className={styles.title}>{t.white_ink}</div>
        </Checkbox>
        {value > 0 && (
          <div className={styles.setting} onClick={() => setShowModal(true)}>
            <ConfigPanelIcons.Settings />
          </div>
        )}
      </div>
      {showModal && <WhiteInkSettingsModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default WhiteInkCheckbox;
