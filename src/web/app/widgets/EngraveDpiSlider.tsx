import React from 'react';

import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.document_panel;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function EngraveDpiSlider({ value, onChange }: Props): JSX.Element {
  const dpiMap = [
    'low',
    'medium',
    'high',
    'ultra',
  ];

  const dpiValueMap = {
    low: 100,
    medium: 250,
    high: 500,
    ultra: 1000,
  };

  const onSliderValueChange = (e) => {
    onChange(dpiMap[e.target.value]);
  };

  return (
    <div className="controls">
      <div className="control">
        <span className="label pull-left">{LANG.engrave_dpi}</span>
        <input
          className="slider"
          type="range"
          min={0}
          max={3}
          value={dpiMap.indexOf(value)}
          onChange={onSliderValueChange}
        />
        <div className="value">{`${LANG[value]} (${dpiValueMap[value]} DPI)`}</div>
      </div>
    </div>
  );
}

export default EngraveDpiSlider;
