import classNames from 'classnames';
import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';
import { IConfig } from 'interfaces/ILayerConfig';

import styles from './Block.module.scss';

interface Props {
  repeat: IConfig<number>,
  onChange: (val: number) => void;
}

const RepeatBlock = ({ repeat, onChange }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  return (
    <div className={classNames(styles.panel, styles['without-drag'])}>
      <span className={styles.title}>{t.repeat}</span>
      <UnitInput
        id="repeat"
        className={{ [styles.input]: true }}
        min={0}
        max={100}
        unit={t.times}
        defaultValue={repeat.value}
        getValue={onChange}
        decimal={0}
        displayMultiValue={repeat.hasMultiValue}
      />
    </div>
  );
};

export default RepeatBlock;
