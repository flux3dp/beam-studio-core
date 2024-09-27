import classNames from 'classnames';
import React, { useContext } from 'react';

import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { showFramingModal } from 'app/components/dialogs/FramingModal';

import styles from './FrameButton.module.scss';

const FrameButton = (): JSX.Element => {
  const lang = useI18n();
  const { mode } = useContext(CanvasContext);

  return (
    <div
      className={classNames(styles.button, { [styles.disabled]: mode !== CanvasMode.Draw })}
      onClick={showFramingModal}
      title={lang.topbar.frame_task}
    >
      <TopBarIcons.Frame />
    </div>
  );
};

export default FrameButton;
