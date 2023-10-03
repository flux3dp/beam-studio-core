import React from 'react';

import i18n from 'helpers/i18n';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import { useIsMobile } from 'helpers/system-helper';
import { VerticalAlign } from 'app/actions/beambox/textPathEdit';

interface Props {
  value: VerticalAlign;
  onValueChange: (val: VerticalAlign) => void;
}

export default function VerticalAlignBlock({ value, onValueChange }: Props): JSX.Element {
  const LANG = i18n.lang.beambox.right_panel.object_panel;
  const label = LANG.option_panel.vertical_align;
  const isMobile = useIsMobile();
  if (isMobile) {
    const options = [
      { value: VerticalAlign.BOTTOM, label: LANG.bottom_align },
      { value: VerticalAlign.MIDDLE, label: LANG.middle_align },
      { value: VerticalAlign.TOP, label: LANG.top_align },
    ];
    return (
      <ObjectPanelItem.Select
        id="vertical_align"
        selected={options.find((option) => option.value === value)}
        options={options}
        onChange={onValueChange}
        label={label}
      />
    );
  }
  const options = [
    <option key={VerticalAlign.BOTTOM} value={VerticalAlign.BOTTOM}>{LANG.bottom_align}</option>,
    <option key={VerticalAlign.MIDDLE} value={VerticalAlign.MIDDLE}>{LANG.middle_align}</option>,
    <option key={VerticalAlign.TOP} value={VerticalAlign.TOP}>{LANG.top_align}</option>,
  ];
  return (
    <div className="option-block">
      <div className="label">{label}</div>
      <div className="select-container">
        <select
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
        >
          {options}
        </select>
      </div>
    </div>
  );
}
