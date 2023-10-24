import React, { useMemo } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';

import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';

import styles from './WhiteInkSettingsModal.module.scss';

interface Props {
  value: number;
  hasMultiValue?: boolean;
  onChange: (val: number) => void;
}

// TODO: add test
const WhiteInkSpeed = ({ value, hasMultiValue, onChange }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  const { display: displayUnit, decimal } = useMemo(() => {
    const unit: 'mm' | 'inches' = storage.get('default-units') || 'mm';
    const display = { mm: 'mm/s', inches: 'in/s' }[unit];
    const d = { mm: 1, inches: 2 }[unit];
    return { display, decimal: d };
  }, []);
  const workarea = beamboxPreference.read('workarea');
  const maxValue = useMemo(() => constant.dimension.getMaxSpeed(workarea), [workarea]);
  const minValue = useMemo(() => constant.dimension.getMinSpeed(workarea), [workarea]);
  const sliderOptions = null;

  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.speed}</span>
      <ConfigValueDisplay
        inputId="white-speed-input"
        max={maxValue}
        min={minValue}
        value={value}
        hasMultiValue={hasMultiValue}
        unit={displayUnit}
        decimal={decimal}
        onChange={onChange}
        options={sliderOptions}
      />
      <ConfigSlider
        id="white-speed"
        value={value}
        onChange={onChange}
        min={minValue}
        max={maxValue}
        step={0.1}
        options={sliderOptions}
      />
    </div>
  );
};

export default WhiteInkSpeed;
