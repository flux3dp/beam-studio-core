import classNames from 'classnames';
import React, { memo, useContext, useMemo } from 'react';
import { Col } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';

import Context from './Context';
import styles from './Inputs.module.scss';

const Inputs = () => {
  const { dispatch, state } = useContext(Context);
  const { selectedItem: { name, isCustomized }, configs, displayValues } = state;
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const speedLimit = useMemo(() => {
    const model = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
    return model === 'fhexa1' ? 900 : 300;
  }, []);

  const unit = useMemo(() => storage.get('default-units') || 'mm', []);
  const { speedUnit, speedDecimal, zStepUnit, zStepDecimal, zStepStep } = useMemo(() => ({
    speedUnit: { mm: 'mm/s', inches: 'in/s' }[unit],
    speedDecimal: { mm: 1, inches: 3 }[unit],
    zStepUnit: { mm: 'mm', inches: 'in' }[unit],
    zStepDecimal: { mm: 2, inches: 4 }[unit],
    zStepStep: { mm: 0.5, inches: 0.01 }[unit],
  }), [unit]);

  const selectedConfig = configs.find((c) => c.name === name);
  const disabled = !isCustomized || !selectedConfig || selectedConfig.isDefault;
  const { power, speed, repeat, zStep } = displayValues;

  return (
    <>
      <div>
        <br />
        <strong>
          {isCustomized ? name : t.dropdown[unit][name]}
        </strong>
      </div>
      <div className={classNames(styles.container, { [styles.disabled]: disabled })}>
        <Col span={11}>
          <div className={styles.control}>
            <span className={styles.label}>{t.power.text}</span>
            <UnitInput
              id="laser-power"
              className={{ [styles.input]: true }}
              min={1}
              max={100}
              disabled={disabled}
              unit="%"
              getValue={(value) => dispatch({ type: 'change', payload: { name, key: 'power', value } })}
              defaultValue={power}
              decimal={1}
              step={1}
            />
          </div>
          <div className={styles.control}>
            <span className={styles.label}>{t.laser_speed.text}</span>
            <UnitInput
              id="laser-speed"
              className={{ [styles.input]: true }}
              min={3}
              max={speedLimit}
              disabled={disabled}
              unit={speedUnit}
              getValue={(value) => dispatch({ type: 'change', payload: { name, key: 'speed', value } })}
              defaultValue={speed}
              decimal={speedDecimal}
              step={1}
            />
          </div>
        </Col>
        <Col span={11}>
          <div className={styles.control}>
            <span className={styles.label}>{t.repeat}</span>
            <UnitInput
              id="laser-repeat"
              className={{ [styles.input]: true }}
              min={1}
              max={100}
              disabled={disabled}
              unit={t.times}
              getValue={(value) => dispatch({ type: 'change', payload: { name, key: 'repeat', value } })}
              defaultValue={repeat}
              decimal={0}
              step={1}
            />
          </div>
          <div className={styles.control}>
            <span className={styles.label}>{t.z_step}</span>
            <UnitInput
              id="laser-z-step"
              className={{ [styles.input]: true }}
              min={0}
              max={20}
              disabled={disabled}
              unit={zStepUnit}
              getValue={(value) => dispatch({ type: 'change', payload: { name, key: 'zStep', value } })}
              defaultValue={zStep}
              decimal={zStepDecimal}
              step={zStepStep}
            />
          </div>
        </Col>
      </div>
    </>
  );
};

export default memo(Inputs);
