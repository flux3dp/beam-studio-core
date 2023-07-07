import * as React from 'react';

import Controls from 'app/components/settings/Control';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import SelectControl from 'app/components/settings/SelectControl';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { OptionValues } from 'app/constants/enums';

interface Props {
  speed: {
    unit: string;
    decimal: number;
    defaultValue: number;
    getValue: (val) => void;
  };
  speedHL: {
    unit: string;
    decimal: number;
    defaultValue: number;
    getValue: (val) => void;
  };
  previewAutoGetHeightOptions: { value: OptionValues, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (key: string, newVal: any) => void;
}

function Camera({
  speed: {
    unit, decimal, defaultValue, getValue,
  },
  speedHL: {
    unit: unitHL,
    decimal: decimalHL,
    defaultValue: defaultValueHL,
    getValue: getValueHL,
  },
  previewAutoGetHeightOptions,
  updateBeamboxPreferenceChange,
}: Props): JSX.Element {
  const { lang } = i18n;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.camera}</div>
      <Controls label={lang.settings.preview_movement_speed}>
        <UnitInput
          id="preview-input"
          unit={unit}
          min={3}
          max={300}
          decimal={decimal}
          defaultValue={defaultValue}
          getValue={getValue}
          className={{ half: true }}
        />
      </Controls>
      <Controls label={lang.settings.preview_movement_speed_hl}>
        <UnitInput
          id="diode-preview-input"
          unit={unitHL}
          min={3}
          max={300}
          decimal={decimalHL}
          defaultValue={defaultValueHL}
          getValue={getValueHL}
          className={{ half: true }}
        />
      </Controls>
      {isDev() && (
        <SelectControl
          id="set-preview-auto-get-height"
          label={lang.settings.enable_custom_backlash}
          options={previewAutoGetHeightOptions}
          onChange={(e) => updateBeamboxPreferenceChange('preview-auto-get-height', e.target.value)}
        />
      )}
    </>
  );
}

export default Camera;
