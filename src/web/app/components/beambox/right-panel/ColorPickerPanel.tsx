import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Pickr from '@simonwep/pickr';
import { Button } from 'antd';

import colorConstants from 'app/constants/color-constants';
import useI18n from 'helpers/useI18n';
import { useIsMobile } from 'helpers/system-helper';

import styles from './ColorPickerPanel.module.scss';

interface Props {
  originalColor: string;
  top: number;
  left: number;
  onNewColor: (newColor: string) => void;
  onClose: () => void;
  isPrinting?: boolean;
  allowNone?: boolean;
}

const ColorPickerPanel = ({
  originalColor,
  top,
  left,
  onNewColor,
  onClose,
  isPrinting,
  allowNone = false,
}: Props): JSX.Element => {
  const lang = useI18n().beambox.photo_edit_panel;
  const isMobile = useIsMobile();
  const width = 200;
  const height = isMobile ? 300 : 270;
  const style = {
    top: top + height > window.innerHeight ? window.innerHeight - height : top,
    left: left > width ? left - width : left,
  }
  const pickrRef = useRef<Pickr>(null);
  const colorPresetContainerRef = useRef<HTMLDivElement>(null);
  const [currentColor, setCurrentColor] = useState(originalColor);
  const [isNone, setIsNone] = useState(originalColor === 'none');

  useEffect(() => {
    if (isPrinting) return;
    pickrRef.current = Pickr.create({
      el: '.pickr',
      appClass: styles.app,
      theme: 'monolith',
      inline: true,
      default: originalColor,
      swatches: [],
      components: {
        // Main components
        preview: false,
        opacity: false,
        hue: true,
        // Input / output Options
        interaction: {
          input: false,
          cancel: false,
          save: false,
        },
      },
    });
    pickrRef.current.on('change', (color) => {
      setCurrentColor(color.toHEXA().toString());
      setIsNone(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalColor]);

  const onApply = () => {
    if (allowNone && isNone) onNewColor('none');
    else onNewColor(currentColor);
    onClose();
  };

  const colors = useMemo(
    () => (isPrinting ? colorConstants.printingLayerColor : colorConstants.randomLayerColors),
    [isPrinting]
  );

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const currentTarget = e.currentTarget as Element;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const scrollBefore = currentTarget.scrollLeft;
      currentTarget.scrollLeft += e.deltaY;
      if (scrollBefore !== currentTarget.scrollLeft) {
        e.stopPropagation();
      }
    }
  };

  return (
    <div className={classNames(styles.container, { [styles['selecting-none']]: isNone })} style={style}>
      <div className={styles.background} onClick={onClose} />
      <div className={styles.presets} ref={colorPresetContainerRef} onWheelCapture={handleWheel}>
        {allowNone && (
          <div>
            <div
              className={classNames(styles.block, styles.none, {
                [styles.selected]: isNone,
              })}
              onClick={() => {
                if (isPrinting) setCurrentColor('none');
                else setIsNone(true);
              }}
            />
          </div>
        )}
        {colors.map((color) => (
          <div key={color}>
            <div
              className={classNames(styles.block, {
                [styles.selected]: !isNone && color === currentColor,
              })}
              style={{ backgroundColor: color }}
              onClick={() => {
                if (isPrinting) setCurrentColor(color);
                else pickrRef.current?.setColor(color);
              }}
            />
          </div>
        ))}
      </div>
      <div className="pickr" />
      <div className={styles.footer}>
        <Button onClick={onClose}>{lang.cancel}</Button>
        <Button onClick={onApply} type="primary">
          {lang.okay}
        </Button>
      </div>
    </div>
  );
};

export default ColorPickerPanel;
