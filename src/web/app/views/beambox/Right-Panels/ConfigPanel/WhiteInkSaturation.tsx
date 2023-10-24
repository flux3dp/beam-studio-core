import React from 'react';

import useI18n from 'helpers/useI18n';

import ConfigSlider from './ConfigSlider';
import ConfigValueDisplay from './ConfigValueDisplay';

import styles from './WhiteInkSettingsModal.module.scss';

interface Props {
  value: number;
  hasMultiValue?: boolean
  onChange: (val: number) => void;
}

// TODO: add test
const WhiteInkSaturation = ({ value, hasMultiValue, onChange }: Props): JSX.Element => {
  const MIN_VALUE = 1;
  const MAX_VALUE = 9;
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  return (
    <div className={styles.panel}>
      <span className={styles.title}>{t.ink_saturation}</span>
      <ConfigValueDisplay
        inputId='white-ink-input'
        type='modal'
        max={MAX_VALUE}
        min={MIN_VALUE}
        value={value}
        hasMultiValue={hasMultiValue}
        onChange={onChange}
      />
      <ConfigSlider
        id='white-ink-slider'
        max={MAX_VALUE}
        min={MIN_VALUE}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default WhiteInkSaturation;
