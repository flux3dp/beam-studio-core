import * as React from 'react';
import Pickr from '@simonwep/pickr';
import { Button } from 'antd';

import i18n from 'helpers/i18n';
import { useEffect } from 'react';

const LANG = i18n.lang.beambox.photo_edit_panel;

interface Props {
  originalColor: string;
  top: number;
  left: number;
  onNewColor: (newColor: string) => void;
  onClose: () => void;
}
let pickr;
const ColorPickerPanel = ({
  originalColor, top, left, onNewColor, onClose,
}: Props): JSX.Element => {
  const width = 200;

  useEffect(() => {
    pickr = Pickr.create({
      el: '.pickr',
      theme: 'monolith',
      inline: true,
      default: originalColor,
      swatches: [
      ],
      components: {
        // Main components
        preview: true,
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
  }, [originalColor]);

  const onApply = () => {
    onNewColor(pickr.getColor().toHEXA().toString());
    onClose();
  };

  return (
    <div className="color-picker-panel" style={{ top, left: left - width }}>
      <div className="modal-background" onClick={onClose} />
      <div className="pickr" />
      <div className="footer">
        <Button onClick={onClose}>
          {LANG.cancel}
        </Button>
        <Button onClick={onApply} type="primary">
          {LANG.okay}
        </Button>
      </div>
    </div>
  );
};

export default ColorPickerPanel;
