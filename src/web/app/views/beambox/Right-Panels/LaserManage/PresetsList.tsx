import classNames from 'classnames';
import React, { memo, useContext, useEffect, useMemo, useRef } from 'react';
import { Col } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import { getModulePresets } from 'app/constants/right-panel-constants';

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
  // TODO: add layer module to prop or context
  const presets = useMemo(
    () => getModulePresets(BeamboxPreference.read('workarea') || BeamboxPreference.read('model')), []
  );
  const presetKeys = useMemo(() => Object.keys(presets), [presets]);

  useEffect(() => {
    if (!isCustomized) {
      const idx = presetKeys.findIndex((n) => n === name);
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
        {
          presetKeys.map((key, i) => {
            const inUse = presetsInUse[key];
            const displayName = t.dropdown[unit][presets[key].name];
            return (
              <div
                key={key}
                className={classNames(styles.item, {
                  [styles.selected]: !isCustomized && name === key,
                  [styles.noborder]: presetKeys.length >= 8 && i === presetKeys.length - 1,
                })}
                onClick={() => dispatch({ type: 'select', payload: { name: key, isCustomized: false } })}
              >
                <div className={styles.name}>{displayName}</div>
                {inUse ? <span className={styles.sub}>{t.inuse}</span> : null}
              </div>
            );
          })
        }
      </div>
    </Col>
  );
};

export default memo(PresetsList);
