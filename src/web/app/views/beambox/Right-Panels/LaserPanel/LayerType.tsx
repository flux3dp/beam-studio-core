import classNames from 'classnames';
import React from 'react';

import useI18n from 'helpers/useI18n';

import styles from './Block.module.scss';

// TODO: Current use a checkbox for demo, need to change to dropdown in the future

interface Props {
  value: number;
  onChange: (val: number) => void;
}

const LayerType = ({ value, onChange }: Props): JSX.Element => {
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const handleClick = () => onChange(value === 1 ? 2 : 1);

  return (
    <div className={classNames(styles.panel, styles.checkbox)} onClick={handleClick}>
      <span className={styles.title}>Printing</span>
      <input type="checkbox" checked={value === 2} readOnly />
    </div>
  );
};

export default LayerType;
