import classNames from 'classnames';
import React, { memo, useContext, useEffect, useRef } from 'react';
import { Button, Col } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';

import alertCaller from 'app/actions/alert-caller';
import dialogCaller from 'app/actions/dialog-caller';
import useI18n from 'helpers/useI18n';
import { ILaserConfig } from 'interfaces/ILaserConfig';

import Context from './Context';
import styles from './ConfigList.module.scss';

const CustomConfigs = (): JSX.Element => {
  const { state, dispatch } = useContext(Context);
  const listRef = useRef<HTMLDivElement>(null);
  const draggingIndex = useRef(-1);
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const {
    selectedItem: { name, isCustomized },
    configs,
    dataChanges,
  } = state;

  useEffect(() => {
    if (isCustomized) {
      const idx = configs.findIndex((c) => c.name === name);
      if (idx >= 0 && listRef.current) {
        const list = listRef.current;
        const item = listRef.current.childNodes.item(idx) as HTMLDivElement;
        const itemPos = item.offsetTop - list.offsetTop - list.clientTop;
        if (itemPos + item.scrollHeight < list.scrollTop || itemPos > list.scrollTop + list.offsetHeight) {
          list.scrollTop = itemPos;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, isCustomized]);

  const handleAddClick = () => {
    dialogCaller.promptDialog({
      caption: t.new_config_name,
      defaultValue: '',
      onYes: (newName) => {
        if (!newName) return;
        const isPresetNameUsed = configs.some((c) => c.name === newName);
        if (isPresetNameUsed) alertCaller.popUpError({ message: t.existing_name });
        else dispatch({ type: 'add-config', payload: { name: newName } });
      },
    });
  };

  const handleDragStart = (config: ILaserConfig, idx: number) => {
    draggingIndex.current = idx;
    dispatch({ type: 'select', payload: { name: config.name, isCustomized: true } });
  };

  const handleDragOver = (idx: number) => {
    if (draggingIndex.current >= 0 && draggingIndex.current !== idx) {
      dispatch({ type: 'swap-config', payload: { orig: draggingIndex.current, dist: idx } });
      draggingIndex.current = idx;
    }
  };

  const handleDragEnd = () => {
    draggingIndex.current = -1;
  };

  return (
    <Col span={11}>
      <div className={styles.title}>
        <strong>
          {t.customized}
          <Button type="text" onClick={handleAddClick}>
            <PlusCircleFilled />
          </Button>
        </strong>
      </div>
      <div id="custom-config-list" className={styles.list} ref={listRef} onDragOver={(e) => e.preventDefault()}>
        {configs.map((config, i) => {
          const hasChange = !!dataChanges[config.name];
          return (
            <div
              draggable
              key={config.name}
              className={classNames(styles.item, {
                [styles.selected]: isCustomized && name === config.name,
                [styles.noborder]: configs.length >= 8 && i === configs.length - 1,
              })}
              onClick={() => dispatch({ type: 'select', payload: { name: config.name, isCustomized: true } })}
              onDragStart={() => handleDragStart(config, i)}
              onDragOver={() => handleDragOver(i)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.name}>{`${config.name + (hasChange ? ' *' : '')}`}</div>
              {config.isDefault ? <span className={styles.sub}>{t.default}</span> : null}
            </div>
          );
        })}
      </div>
    </Col>
  );
};

export default memo(CustomConfigs);
