import classNames from 'classnames';
import React, { memo, useContext, useState } from 'react';
import { Button, Mask, Popover } from 'antd-mobile';
import { ConfigProvider, InputNumber } from 'antd';

import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const MAX_VALUE = 9;
const MIN_VALUE = 1;

// TODO: add unit test after UI confirmed
function InkBlock({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element {
  const lang = useI18n();
  // TODO: add ink translation to i18n
  const t = lang.beambox.right_panel.laser_panel;
  const [visible, setVisible] = useState(false);
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { ink } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { ink: value, configName: CUSTOM_PRESET_CONSTANT },
    });
    if (type !== 'modal')
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.ink, value);
      });
  };

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>tInk</span>
      {type === 'panel-item' ? (
        <ConfigProvider theme={{ token: { borderRadius: 100 } }}>
          <InputNumber
            className={styles.input}
            type="number"
            min={MIN_VALUE}
            max={MAX_VALUE}
            value={ink.value}
            onChange={handleChange}
            precision={0}
            controls={false}
          />
        </ConfigProvider>
      ) : (
        <UnitInput
          id="power"
          className={{ [styles.input]: true }}
          min={MIN_VALUE}
          max={MAX_VALUE}
          defaultValue={ink.value}
          getValue={handleChange}
          decimal={0}
          displayMultiValue={ink.hasMultiValue}
        />
      )}
      <input
        id="power_value"
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        value={ink.value}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
      />
    </div>
  );

  return type === 'panel-item' ? (
    <>
      <Mask
        visible={visible}
        onMaskClick={() => {
          ObjectPanelController.updateActiveKey(null);
          setVisible(false);
        }}
        color="transparent"
      />
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
              {ink.value}
            </Button>
          }
          label="tInk"
          onClick={() => setVisible(true)}
        />
      </Popover>
    </>
  ) : (
    content
  );
}

export default memo(InkBlock);
