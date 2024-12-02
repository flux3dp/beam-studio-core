import React, { useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

import tabController from 'app/actions/tab-controller';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';

import styles from './Tabs.module.scss';

const Tabs = (): JSX.Element => {
  const t = useI18n().topbar;
  const { hasUnsavedChange } = useContext(CanvasContext);
  const currentId = useMemo(() => tabController.getCurrentId(), []);
  const [tabs, setTabs] = useState(tabController.getAllTabs());
  const [currentTabInfo, setCurrentTabInfo] = useState({ title: '', isCloud: false });
  useEffect(() => {
    const handler = () => setTabs(tabController.getAllTabs());
    tabController.onFocused(handler);
  }, []);
  useEffect(() => {
    const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
    const handler = (newTitle: string, isCloudFile: boolean) => {
      setCurrentTabInfo({ title: newTitle, isCloud: isCloudFile });
    };
    topBarEventEmitter.on('UPDATE_TITLE', handler);
    return () => {
      topBarEventEmitter.removeListener('UPDATE_TITLE', handler);
    };
  }, [currentId]);

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map((tab) => {
          const { id } = tab;
          let { title } = id === currentId ? currentTabInfo : tab;
          if (id === currentId) {
            title = `${title || t.untitled}${hasUnsavedChange ? '*' : ''}`;
          }
          return (
            <div
              key={id}
              className={classNames(styles.tab, { [styles.focused]: currentId === id })}
              onClick={() => tabController.focusTab(id)}
            >
              <div className={styles.name}>{title}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.add} onClick={tabController.addNewTab}>
        +
      </div>
    </div>
  );
};

export default Tabs;
