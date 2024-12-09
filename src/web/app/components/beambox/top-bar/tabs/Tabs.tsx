/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { CloseOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import CanvasMode from 'app/constants/canvasMode';
import Tab from 'interfaces/Tab';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import tabConstants from 'app/constants/tabConstants';
import tabController from 'app/actions/tabController';
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
    tabController.onTabsUpdated(handler);
    return () => {
      tabController.offFocused(handler);
      tabController.offTabsUpdated(handler);
    };
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

  const handleDragEnd = ({ destination, source }: DropResult) => {
    const { index: srcIdx } = source;
    const { index: dstIdx } = destination;
    if (srcIdx === dstIdx) return;
    setTabs((cur) => {
      const newTabs = Array.from(cur);
      const [removed] = newTabs.splice(srcIdx, 1);
      newTabs.splice(dstIdx, 0, removed);
      return newTabs;
    });
    tabController.moveTab(srcIdx, dstIdx);
  };

  const renderIcon = useCallback(({ isLoading, mode, isCloud }: Tab) => {
    if (isLoading) return <LoadingOutlined className={classNames(styles.icon, styles.loading)} />;
    if (mode === CanvasMode.Preview) return <TopBarIcons.Camera className={styles.icon} />;
    if (isCloud) return <TopBarIcons.CloudFile className={styles.icon} />;
    return null;
  }, []);

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tabs" direction="horizontal">
          {(droppableProvided) => (
            <div
              className={styles.tabs}
              {...droppableProvided.droppableProps}
              ref={(node) => droppableProvided.innerRef(node)}
            >
              {tabs.map((tab, idx) => {
                const { id } = tab;
                let { title } = id === currentId ? currentTabInfo : tab;
                if (id === currentId) {
                  title = `${title || t.untitled}${hasUnsavedChange ? '*' : ''}`;
                }
                return (
                  <Draggable key={id} draggableId={id.toFixed(0)} index={idx}>
                    {(draggalbeProvided) => (
                      <div
                        {...draggalbeProvided.draggableProps}
                        {...draggalbeProvided.dragHandleProps}
                        ref={draggalbeProvided.innerRef}
                        title={title}
                        className={classNames(styles.tab, { [styles.focused]: currentId === id })}
                        onClick={() => tabController.focusTab(id)}
                      >
                        {renderIcon(tab)}
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
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {(!tabConstants.maxTab || tabs.length < tabConstants.maxTab) && (
        <div className={styles.add} onClick={tabController.addNewTab}>
          <PlusOutlined />
        </div>
      )}
    </div>
  );
};

export default Tabs;
