import classNames from 'classnames';
import React, { memo, useContext } from 'react';
import { Button, Popover } from 'antd-mobile';
import { ConfigProvider, InputNumber } from 'antd';

import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const MAX_VALUE = 100;
const MIN_VALUE = 1;

function PowerBlock({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'power';
  const { power } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { power: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal')
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.strength, value);
        writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
      });
  };

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>{t.strength}</span>
      {type === 'panel-item' ? (
        <ConfigProvider theme={{ token: { borderRadius: 100 } }}>
          <InputNumber
            className={styles.input}
            type="number"
            min={MIN_VALUE}
            max={MAX_VALUE}
            value={power.value}
            onChange={handleChange}
            precision={1}
            controls={false}
          />
        </ConfigProvider>
      ) : (
        <UnitInput
          id="power"
          className={{ [styles.input]: true }}
          min={MIN_VALUE}
          max={MAX_VALUE}
          unit="%"
          defaultValue={power.value}
          getValue={handleChange}
          decimal={1}
          displayMultiValue={power.hasMultiValue}
        />
      )}
      <input
        id="power_value"
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        value={power.value}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
      />
      {power.value < 10 && (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{t.low_power_warning}</div>
        </div>
      )}
    </div>
  );

  return type === 'panel-item' ? (
    <Popover visible={visible} content={content}>
      <ObjectPanelItem.Item
        id="power"
        content={
          <Button
            className={objectPanelItemStyles['number-item']}
            shape="rounded"
            size="mini"
            fill="outline"
          >
            {power.value}
          </Button>
        }
        label={t.strength}
        autoClose={false}
      />
    </Popover>
  ) : (
    content
  );
}

export default memo(PowerBlock);
