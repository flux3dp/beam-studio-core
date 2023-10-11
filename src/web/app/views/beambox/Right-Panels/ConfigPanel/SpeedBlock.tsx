import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';
import { Button, Popover } from 'antd-mobile';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import doLayersContainsVector from 'helpers/layer/check-vector';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LayerModule from 'app/constants/layer-module/layer-modules';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import useI18n from 'helpers/useI18n';
import storage from 'implementations/storage';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';
import styles from './Block.module.scss';

const SpeedBlock = ({
  type = 'default',
  simpleMode = true,
}: {
  type?: 'default' | 'panel-item' | 'modal';
  simpleMode?: boolean;
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'speed';
  const { hasVector } = useContext(LayerPanelContext);
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'),
    []
  );

  const { value, hasMultiValue } = state.speed;
  const module = state.module.value;

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
        writeData(layerName, DataType.speed, val, true);
        writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
      });
  };

  const sliderOptions = useMemo(
    () =>
      simpleMode && module === LayerModule.PRINTER
        ? [
            { value: 10, label: t.slider.extremely_slow },
            { value: 30, label: t.slider.slow },
            { value: 60, label: t.slider.regular },
            { value: 100, label: t.slider.fast },
            { value: 150, label: t.slider.extremely_fast },
          ]
        : null,
    [simpleMode, module, t.slider]
  );

  const content = (
    <div className={classNames(styles.panel, styles[type])}>
      <span className={styles.title}>{t.speed}</span>
      <ConfigValueDisplay
        inputId="speed-input"
        type={type}
        max={maxValue}
        min={minValue}
        value={value}
        unit={displayUnit}
        hasMultiValue={hasMultiValue}
        decimal={decimal}
        onChange={handleChange}
        options={sliderOptions}
      />
      <ConfigSlider
        id="speed"
        value={value}
        onChange={handleChange}
        min={minValue}
        max={maxValue}
        step={0.1}
        speedLimit={
          module !== LayerModule.PRINTER &&
          (type === 'modal' ? doLayersContainsVector(selectedLayers) : hasVector)
        }
        options={sliderOptions}
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
