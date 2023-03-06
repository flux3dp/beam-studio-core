import classNames from 'classnames';
import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';

import styles from './AutoFocus.module.scss';

interface Props {
  height: number;
  hasMultiHeight: boolean;
  repeat: number;
  zStep: number;
  hasMultiZStep: boolean;
  onToggle: () => void;
  onHeightChange: (val: number) => void;
  onZStepChange: (val: number) => void;
}

const AutoFocus = ({
  height,
  hasMultiHeight,
  repeat,
  zStep,
  hasMultiZStep,
  onToggle,
  onHeightChange,
  onZStepChange,
}: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  return (
    <>
      <div className={classNames(styles.panel, styles.checkbox)} onClick={onToggle}>
        <span className={styles.title}>{t.focus_adjustment}</span>
        <input type="checkbox" checked={height > 0} readOnly />
      </div>
      {height > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.height}</span>
          <UnitInput
            id="height"
            className={{ [styles.input]: true }}
            min={0.01}
            max={20}
            unit="mm"
            defaultValue={height}
            getValue={onHeightChange}
            displayMultiValue={hasMultiHeight}
          />
        </div>
      ) : null}
      {repeat > 1 && height > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.z_step}</span>
          <UnitInput
            id="z_step"
            className={{ [styles.input]: true }}
            min={0}
            max={20}
            unit="mm"
            defaultValue={zStep}
            getValue={onZStepChange}
            displayMultiValue={hasMultiZStep}
          />
        </div>
      ) : null}
    </>
  );
};

export default AutoFocus;
