import classNames from 'classnames';
import React, { useState } from 'react';
import { Color } from 'antd/es/color-picker';
import { ColorPicker as AntdColorPicker, Button } from 'antd';

import useI18n from 'helpers/useI18n';
import { objectsColorPresets } from 'app/constants/color-constants';

import styles from './ColorPicker.module.scss';

interface Props {
  allowClear?: boolean;
  initColor: string;
  triggerType?: 'fill' | 'stroke';
  onChange: (color: string) => void;
}

const ColorPicker = ({
  allowClear,
  initColor,
  triggerType = 'fill',
  onChange,
}: Props): JSX.Element => {
  const [color, setColor] = useState<string>(initColor);
  const [open, setOpen] = useState<boolean>(false);
  const lang = useI18n().alert;

  const panelRender = (panel: React.ReactNode) => (
    <div>
      <div className={styles.preset}>
        {allowClear && (
          <div>
            <div
              className={classNames(styles['preset-block'], styles.clear, {
                [styles.checked]: color === 'none',
              })}
              onClick={() => setColor('none')}
            />
          </div>
        )}
        {objectsColorPresets.map((preset) => (
          <div
            key={preset}
            className={classNames(styles['preset-block'], styles.color, {
              [styles.checked]: preset === color,
            })}
            onClick={() => setColor(preset)}
          >
            <div className={styles.inner} style={{ backgroundColor: preset }} />
          </div>
        ))}
      </div>
      <div className={classNames(styles.panel, { [styles.clear]: color === 'none' })}>{panel}</div>
      <div className={styles.footer}>
        <Button
          type="primary"
          className={styles.btn}
          onClick={() => {
            setOpen(false);
            onChange(color);
          }}
        >
          {lang.ok}
        </Button>
        <Button
          type="default"
          className={styles.btn}
          onClick={() => {
            setOpen(false);
            setColor(initColor);
          }}
        >
          {lang.cancel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <AntdColorPicker
        placement="bottomLeft"
        disabledAlpha
        open={open}
        onOpenChange={(o: boolean) => setOpen(o)}
        size="small"
        value={color === 'none' ? '#000000' : color}
        onChangeComplete={(c: Color) => setColor(c.toHexString())}
        panelRender={panelRender}
      >
        <div className={classNames(styles.trigger, { [styles.open]: open })}>
          <div
            className={classNames(styles.color, { [styles.clear]: initColor === 'none' })}
            style={{ background: initColor }}
          >
            {triggerType === 'stroke' && (
              <div
                className={classNames(styles['stroke-inner'], {
                  [styles.clear]: initColor === 'none',
                })}
              />
            )}
          </div>
        </div>
      </AntdColorPicker>
    </div>
  );
};

export default ColorPicker;
