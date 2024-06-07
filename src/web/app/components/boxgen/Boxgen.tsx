import classNames from 'classnames';
import React, { useMemo } from 'react';
import { Button } from 'antd';

import constant from 'app/actions/beambox/constant';
import FloatingPanel from 'app/widgets/FloatingPanel';
import isWeb from 'helpers/is-web';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import { BoxgenProvider } from 'app/contexts/BoxgenContext';
import { useIsMobile } from 'helpers/system-helper';

import BoxCanvas from './BoxCanvas';
import BoxSelector from './BoxSelector';
import CanvasController from './CanvasController';
import Controller from './Controller';
import ExportButton from './ExportButton';
import styles from './Boxgen.module.scss';

const Boxgen = ({ onClose }: { onClose?: () => void }): JSX.Element => {
  const lang = useI18n().boxgen;
  const isMobile = useIsMobile();
  const web = useMemo(() => isWeb(), []);

  return (
    <BoxgenProvider onClose={onClose}>
      {isMobile ? (
        <FloatingPanel
          className={classNames(styles.boxgen, {
            [styles.windows]: window.os === 'Windows',
            [styles.desktop]: !web,
          })}
          anchors={[0, window.innerHeight - constant.titlebarHeight]}
          title={lang.title}
          fixedContent={
            <div>
              <BoxSelector />
              <div className={styles.canvas}>
                <CanvasController />
                <BoxCanvas />
              </div>
            </div>
          }
          onClose={onClose}
        >
          <Controller />
          <div className={styles.footer}>
            <ExportButton />
          </div>
        </FloatingPanel>
      ) : (
        <div
          className={classNames(styles.boxgen, {
            [styles.windows]: window.os === 'Windows',
            [styles.desktop]: !web,
          })}
        >
          <div className={styles.sider}>
            <Button
              className={styles.back}
              type="text"
              icon={<TopBarIcons.Undo />}
              onClick={onClose}
            >
              {lang.back}
            </Button>
            <div className={styles.head}>
              <div className={styles.title}>{lang.title}</div>
              <BoxSelector />
            </div>
            <Controller />
            <div className={styles.footer}>
              <ExportButton />
            </div>
          </div>
          <div className={styles.canvas}>
            <CanvasController />
            <BoxCanvas />
          </div>
        </div>
      )}
    </BoxgenProvider>
  );
};

export default Boxgen;
