import * as React from 'react';
import classNames from 'classnames';
import Pickr from '@simonwep/pickr';

import i18n from 'helpers/i18n';
import { getLayerElementByName } from 'helpers/layer-helper';
import { useEffect } from 'react';

const LANG = i18n.lang.beambox.photo_edit_panel;

interface Props {
  layerName: string;
  top: number;
  left: number;
  onColorChanged: (newColor: string) => void;
  onClose: () => void;
}

const ColorPickerPanel = ({
  layerName, top, left, onColorChanged, onClose,
}: Props): JSX.Element => {
  const layer = getLayerElementByName(layerName);
  const width = 200;
  let pickr;

  useEffect(() => {
    const origColor = layer.getAttribute('data-color') || '#333333';
    pickr = Pickr.create({
      el: '.pickr',
      theme: 'monolith',
      inline: true,
      default: origColor,
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
  }, []);

  const onApply = () => {
    onColorChanged(pickr.getColor().toHEXA().toString());
    onClose();
  };

  const renderFooterButton = (label, onClick, className) => (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );

  const renderfooter = () => (
    <div className="footer">
      {renderFooterButton(LANG.cancel, onClose, classNames('btn', 'btn-default', 'pull-right'))}
      {renderFooterButton(LANG.okay, () => onApply(), classNames('btn', 'btn-default', 'pull-right', 'primary'))}
    </div>
  );

  return (
    <div className="color-picker-panel" style={{ top, left: left - width }}>
      <div className="modal-background" onClick={onClose} />
      <div className="pickr" />
      {renderfooter()}
    </div>
  );
};

export default ColorPickerPanel;
