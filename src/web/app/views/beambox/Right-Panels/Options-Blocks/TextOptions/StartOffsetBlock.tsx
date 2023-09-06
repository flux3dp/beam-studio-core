import React from 'react';

import i18n from 'helpers/i18n';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { useIsMobile } from 'helpers/system-helper';

interface Props {
  value: number;
  onValueChange: (val: number) => void;
}

export default function StartOffsetBlock({ value, onValueChange }: Props): JSX.Element {
  const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;
  const isMobile = useIsMobile();
  return isMobile ? (
    <ObjectPanelItem.Number
      id="start_offset"
      label={LANG.start_offset}
      value={value}
      updateValue={onValueChange}
      unit=""
      decimal={0}
    />
  ) : (
    <div className="option-block">
      <div className="label">{LANG.start_offset}</div>
      <UnitInput
        min={0}
        max={100}
        unit=""
        decimal={0}
        className={{ 'option-input': true }}
        defaultValue={value}
        getValue={onValueChange}
      />
    </div>
  );
}
