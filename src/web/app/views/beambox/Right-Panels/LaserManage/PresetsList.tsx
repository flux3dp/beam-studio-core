import classNames from 'classnames';
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react';
import { Col } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { getParametersSet } from 'app/constants/right-panel-constants';

import Context from './Context';
import styles from './ConfigList.module.scss';

const PresetsList = (): JSX.Element => {
  const { state, dispatch } = useContext(Context);
  const listRef = useRef<HTMLDivElement>(null);
  const lang = useI18n();
  const t = lang.beambox.right_panel.laser_panel;
  const {
    selectedItem: { name, isCustomized },
    presetsInUse,
  } = state;

  const unit = useMemo(() => storage.get('default-units') || 'mm', []);
  const presetNames = useMemo(
    () => Object.keys(getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'))), []
  );

  useEffect(() => {
    if (!isCustomized) {
      const idx = presetNames.findIndex((n) => n === name);
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

  return (
    <Col span={11}>
      <div className={styles.title}>
        <strong>{t.default}</strong>
      </div>
      <div className={styles.list} ref={listRef}>
        {presetNames.map((preset, i) => {
          const inUse = presetsInUse[preset];
          return (
            <div
              key={preset}
              className={classNames(styles.item, {
                [styles.selected]: !isCustomized && name === preset,
                [styles.noborder]: presetNames.length >= 8 && i === presetNames.length - 1,
              })}
              onClick={() => dispatch({ type: 'select', payload: { name: preset, isCustomized: false } })}
            >
              <div className={styles.name}>{t.dropdown[unit][preset]}</div>
              {inUse ? <span className={styles.sub}>{t.inuse}</span> : null}
            </div>
          );
        })}
      </div>
    </Col>
  );
};

export default memo(PresetsList);
