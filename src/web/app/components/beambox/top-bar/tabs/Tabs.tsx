import React, { useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { CloseOutlined } from '@ant-design/icons';

import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import tabConstants from 'app/constants/tab-constants';
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
          const { id, isCloud } = tab;
          let { title } = id === currentId ? currentTabInfo : tab;
          if (id === currentId) {
            title = `${title || t.untitled}${hasUnsavedChange ? '*' : ''}`;
          }
          return (
            <div
              key={id}
              title={title}
              className={classNames(styles.tab, { [styles.focused]: currentId === id })}
              onClick={() => tabController.focusTab(id)}
            >
              {isCloud && <TopBarIcons.CloudFile className={styles.cloud} />}
              <span className={styles.name}>{title}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  tabController.closeTab(id);
                }}
                className={styles.close}
              >
                <CloseOutlined />
              </span>
            </div>
          );
        })}
      </div>
      {tabConstants.maxTab && tabs.length < tabConstants.maxTab && (
        <div className={styles.add} onClick={tabController.addNewTab}>
          +
        </div>
      )}
    </div>
  );
};

export default Tabs;
