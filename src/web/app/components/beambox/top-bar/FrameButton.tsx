import classNames from 'classnames';
import React, { useContext, useEffect } from 'react';

import shortcuts from 'helpers/shortcuts';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { promarkModels } from 'app/actions/beambox/constant';
import { showFramingModal } from 'app/components/dialogs/FramingModal';

import styles from './FrameButton.module.scss';

const FrameButton = (): JSX.Element => {
  const lang = useI18n();
  const { mode } = useContext(CanvasContext);
  useEffect(() => {
    const shortcutHandler = async () => {
      if (mode !== CanvasMode.Draw) return;
      const device = TopBarController.getSelectedDevice();
      showFramingModal(promarkModels.has(device?.model));
    };
    const unregister = shortcuts.on(['F1'], shortcutHandler);
    return () => unregister?.();
  }, [mode]);

  return (
    <div
      className={classNames(styles.button, { [styles.disabled]: mode !== CanvasMode.Draw })}
      onClick={() => showFramingModal()}
      title={lang.topbar.frame_task}
    >
      <TopBarIcons.Frame />
    </div>
  );
};

export default FrameButton;
