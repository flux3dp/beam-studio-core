import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';

import useI18n from 'helpers/useI18n';
import { TopBarHintsContext } from 'app/contexts/TopBarHintsContext';

import styles from './TopBarHints.module.scss';

interface Props {
  white?: boolean;
}

const TopBarHints = ({ white = false }: Props): JSX.Element => {
  const t = useI18n().topbar.hint;
  const { hintType } = useContext(TopBarHintsContext);
  const content = useMemo<React.ReactNode>(() => {
    if (hintType === 'POLYGON') {
      return <div>{t.polygon}</div>;
    }
    return null;
  }, [t, hintType]);

  return <div className={classNames(styles.container, { [styles.white]: white })}>{content}</div>;
};

export default TopBarHints;
