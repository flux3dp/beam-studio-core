import classNames from 'classnames';
import React from 'react';

import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';

import styles from './RepeatBlock.module.scss';

interface Props {
  val: number;
  hasMultipleValue: boolean;
  onChange: (val: number) => void;
}

const RepeatBlock = ({ val, hasMultipleValue, onChange }: Props): JSX.Element => {
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
        defaultValue={val}
        getValue={onChange}
        decimal={0}
        displayMultiValue={hasMultipleValue}
      />
    </div>
  );
};

export default RepeatBlock;
