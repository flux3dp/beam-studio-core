import React, { useContext, useState } from 'react';
import { Checkbox, Switch } from 'antd';

import ConfigPanelIcons from 'app/icons/config-panel/ConfigPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './WhiteInkCheckbox.module.scss';
import WhiteInkSettingsModal from './WhiteInkSettingsModal';

interface Props {
  type?: 'default' | 'panel-item' | 'modal';
}

// TODO: add test
const WhiteInkCheckbox = ({ type = 'default' }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const [showModal, setShowModal] = useState(false);
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { wInk } = state;
  const { value } = wInk;
  if (type === 'modal') return null;

  const handleChange = (checked: boolean) => {
    const newVal = (checked ? 1 : -1) * Math.abs(value);
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
      {type === 'default' ? (
        <div className={styles.panel}>
          <Checkbox
            checked={value > 0}
            onChange={(e) => handleChange(e.target.checked)}
            className="white-ink-checkbox"
          >
            <div className={styles.title}>{t.white_ink}</div>
          </Checkbox>
          {value > 0 && (
            <div className={styles.setting} onClick={() => setShowModal(true)}>
              <ConfigPanelIcons.Settings />
            </div>
          )}
        </div>
      ) : (
        <>
          <ObjectPanelItem.Divider />
          <ObjectPanelItem.Item
            id="white_ink"
            content={<Switch checked={value > 0} />}
            label={t.white_ink}
            onClick={() => handleChange(value < 0)}
          />
          {value > 0 && (
            <ObjectPanelItem.Item
              id="white_ink_setting"
              content={
                <div className={styles.icon}>
                  <ConfigPanelIcons.Settings />
                </div>
              }
              label={t.white_ink_settings}
              onClick={() => setShowModal(true)}
            />
          )}
        </>
      )}
      {showModal && <WhiteInkSettingsModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default WhiteInkCheckbox;
