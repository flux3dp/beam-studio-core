import classNames from 'classnames';
import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { IConfig } from 'interfaces/ILayerConfig';

import styles from './Block.module.scss';

interface Props {
  height: IConfig<number>,
  repeat: IConfig<number>,
  zStep: IConfig<number>,
  onToggle: () => void;
  onHeightChange: (val: number) => void;
  onZStepChange: (val: number) => void;
}

const AutoFocus = ({
  height,
  repeat,
  zStep,
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
        <input type="checkbox" checked={height.value > 0} readOnly />
      </div>
      {height.value > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.height}</span>
          <UnitInput
            id="height"
            className={{ [styles.input]: true }}
            min={0.01}
            max={20}
            unit="mm"
            defaultValue={height.value}
            getValue={onHeightChange}
            displayMultiValue={height.hasMultiValue}
          />
        </div>
      ) : null}
      {repeat.value > 1 && height.value > 0 ? (
        <div className={classNames(styles.panel, styles['without-drag'])}>
          <span className={styles.title}>{t.z_step}</span>
          <UnitInput
            id="z_step"
            className={{ [styles.input]: true }}
            min={0}
            max={20}
            unit="mm"
            defaultValue={zStep.value}
            getValue={onZStepChange}
            displayMultiValue={zStep.hasMultiValue}
          />
        </div>
      ) : null}
    </>
  );
};

export default AutoFocus;
