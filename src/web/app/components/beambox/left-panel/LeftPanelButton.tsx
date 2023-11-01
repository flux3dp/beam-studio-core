import classNames from 'classnames';
import React from 'react';

import styles from './LeftPanelButton.module.scss';

interface Props {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function LeftPanelButton({
  id,
  title,
  icon,
  onClick,
  active = false,
  disabled = false,
}: Props): JSX.Element {
  return (
    <div
      id={id}
      className={classNames(styles.container, { [styles.active]: active, disabled })}
      title={title}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
    </div>
  );
}

export default LeftPanelButton;
