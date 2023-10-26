import classNames from 'classnames';
import React, { memo, useCallback, useContext, useMemo } from 'react';
import { Button, Popover } from 'antd-mobile';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import configOptions from 'app/constants/config-options';
import constant from 'app/actions/beambox/constant';
import doLayersContainsVector from 'helpers/layer/check-vector';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LayerModule from 'app/constants/layer-module/layer-modules';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import objectPanelItemStyles from 'app/views/beambox/Right-Panels/ObjectPanelItem.module.scss';
import storage from 'implementations/storage';
import units from 'helpers/units';
import useI18n from 'helpers/useI18n';
import { CUSTOM_PRESET_CONSTANT, DataType, writeData } from 'helpers/layer/layer-config-helper';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';
import styles from './Block.module.scss';

const SpeedBlock = ({
  type = 'default',
}: {
  type?: 'default' | 'panel-item' | 'modal';
}): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const { selectedLayers, state, dispatch, simpleMode = true } = useContext(ConfigPanelContext);
  const { activeKey } = useContext(ObjectPanelContext);
  const visible = activeKey === 'speed';
  const { hasVector } = useContext(LayerPanelContext);
  const timeEstimationButtonEventEmitter = useMemo(
    () => eventEmitterFactory.createEventEmitter('time-estimation-button'),
    []
  );

  const { value, hasMultiValue } = state.speed;
  const module = state.module.value;

  const {
    display: displayUnit,
    decimal,
    calculateUnit: fakeUnit,
  } = useMemo(() => {
    const unit: 'mm' | 'inches' = storage.get('default-units') || 'mm';
    const display = { mm: 'mm/s', inches: 'in/s' }[unit];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculateUnit: 'mm' | 'inch' = { mm: 'mm', inches: 'inch' }[unit] as any;
    const d = { mm: 1, inches: 2 }[unit];
    return { display, decimal: d, calculateUnit };
  }, []);
  const workarea = BeamboxPreference.read('workarea');
  const maxValue = useMemo(() => constant.dimension.getMaxSpeed(workarea), [workarea]);
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
        ? configOptions.getPrintingSpeedOptions(lang)
        : null,
    [simpleMode, module, lang]
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
        decimal={decimal}
        unit={displayUnit}
      />
      {warningText ? (
        <div className={styles.warning}>
          <div className={styles['warning-icon']}>!</div>
          <div className={styles['warning-text']}>{warningText}</div>
        </div>
      ) : null}
    </div>
  );

  const getDisplayValue = useCallback(() => {
    const selectedOption = sliderOptions?.find((opt) => opt.value === value);
    if (selectedOption) return selectedOption.label;
    return +units.convertUnit(value, fakeUnit, 'mm').toFixed(decimal);
  }, [decimal, sliderOptions, value, fakeUnit]);

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
            <span style={{ whiteSpace: 'nowrap' }}>{getDisplayValue()}</span>
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
