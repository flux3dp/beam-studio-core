import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';
import { Button, Popover } from 'antd-mobile';

import configOptions from 'app/constants/config-options';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import useI18n from 'helpers/useI18n';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';
import styles from './Block.module.scss';

const MAX_VALUE = 15;
const MIN_VALUE = 1;

function InkBlock({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch, simpleMode = true } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'power';
  const { ink } = state;
  const handleChange = (value: number) => {
    dispatch({
      type: 'change',
      payload: { ink: value },
    });
    if (type !== 'modal')
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.ink, value);
      });
  };
  const sliderOptions = useMemo(
    () => (simpleMode ? configOptions.getSaturationOptions(lang) : null),
    [simpleMode, lang]
  );

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>{t.ink_saturation}</span>
      <ConfigValueDisplay
        inputId="saturation-input"
        type={type}
        max={MAX_VALUE}
        min={MIN_VALUE}
        value={ink.value}
        hasMultiValue={ink.hasMultiValue}
        onChange={handleChange}
        options={sliderOptions}
      />
      <ConfigSlider
        id="saturation"
        value={ink.value}
        onChange={handleChange}
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={1}
        options={sliderOptions}
      />
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
            {ink.value}
          </Button>
        }
        label={t.ink_saturation}
        autoClose={false}
      />
    </Popover>
  ) : (
    content
  );
}

export default memo(InkBlock);
