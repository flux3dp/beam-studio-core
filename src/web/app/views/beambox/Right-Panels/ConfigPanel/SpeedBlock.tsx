import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';
import { Button, Popover } from 'antd-mobile';
import { ConfigProvider, InputNumber } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import doLayersContainsVector from 'helpers/layer/check-vector';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import storage from 'implementations/storage';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './Block.module.scss';

const SpeedBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'speed';
  const { hasVector } = useContext(LayerPanelContext);
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'), []
  );

  const { value, hasMultiValue } = state.speed;

  const { display: displayUnit, decimal } = useMemo(() => {
    const unit: 'mm' | 'inches' = storage.get('default-units') || 'mm';
    const display = { mm: 'mm/s', inches: 'in/s' }[unit];
    const d = { mm: 1, inches: 2 }[unit];
    return { display, decimal: d };
  }, []);
  const workarea = BeamboxPreference.read('workarea');
  const maxValue = constant.dimension.getMaxSpeed(workarea);
  const workareaMinSpeed = constant.dimension.getMinSpeed(workarea);
  let minValue = workareaMinSpeed;
  const enableLowSpeed = BeamboxPreference.read('enable-low-speed');
  if (minValue > 1 && enableLowSpeed) minValue = 1;
  let warningText = '';
  if (hasVector && value > 20 && BeamboxPreference.read('vector_speed_contraint') !== false) {
    warningText = t.speed_contrain_warning;
  } else if (value < workareaMinSpeed && enableLowSpeed) {
    warningText = t.low_speed_warning;
  }

  const handleChange = (val: number) => {
    dispatch({
      type: 'change',
      payload: { speed: val, configName: CUSTOM_PRESET_CONSTANT },
    });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    if (type !== 'modal')
      selectedLayers.forEach((layerName) => {
        writeData(layerName, DataType.speed, val);
        writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
      });
  };

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>{t.speed}</span>
      {type === 'panel-item' ? (
        <ConfigProvider theme={{ token: { borderRadius: 100 } }}>
          <InputNumber
            className={styles.input}
            type="number"
            min={minValue}
            max={maxValue}
            value={value}
            onChange={handleChange}
            precision={decimal}
            controls={false}
          />
        </ConfigProvider>
      ) : (
        <UnitInput
          id="speed"
          className={{ [styles.input]: true }}
          min={minValue}
          max={maxValue}
          unit={displayUnit}
          defaultValue={value}
          getValue={handleChange}
          decimal={decimal}
          displayMultiValue={hasMultiValue}
          step={10 ** -decimal}
        />
      )}
      <input
        id="speed_value"
        className={classNames({
          [styles['speed-for-vector']]:
            // when type is modal, this component is called without LayerPanelContext
            type === 'modal' ? doLayersContainsVector(selectedLayers) : hasVector,
        })}
        type="range"
        min={minValue}
        max={maxValue}
        step={0.1}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
      {warningText ? (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{warningText}</div>
        </div>
      ) : null}
    </div>
  );

  return type === 'panel-item' ? (
    <Popover visible={visible} content={content}>
      <ObjectPanelItem.Item
        id="speed"
        content={
          <Button
            className={classNames(objectPanelItemStyles['number-item'], styles['display-btn'])}
            shape="rounded"
            size="mini"
            fill="outline"
          >
            {value}
          </Button>
        }
        label={t.speed}
        autoClose={false}
      />
    </Popover>
  ) : (
    content
  );
};

export default memo(SpeedBlock);
