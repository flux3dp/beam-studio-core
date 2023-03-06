import classNames from 'classnames';
import React from 'react';

import useI18n from 'helpers/useI18n';

import styles from './Block.module.scss';

interface Props {
  value: boolean;
  onToggle: () => void;
}

const Diode = ({ value, onToggle }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;

  return (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={onToggle}>
      <span className={styles.title}>{t.diode}</span>
      <input type="checkbox" checked={value} readOnly />
    </div>
  );
};

export default Diode;
