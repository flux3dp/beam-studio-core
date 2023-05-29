import * as React from 'react';

import Controls from 'app/components/settings/Control';
import i18n from 'helpers/i18n';
import SelectControl from 'app/components/settings/SelectControl';
import UnitInput from 'app/widgets/Unit-Input-v2';

interface Props {
  fastGradientOptions: { value: any, label: string, selected: boolean }[];
  reverseEngravingOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
  paddingAccel: {
    defaultValue: number;
    getValue: (val) => void;
  };
  paddingAccelDiode: {
    defaultValue: number;
    getValue: (val) => void;
  };
}

function Engraving({
  fastGradientOptions,
  reverseEngravingOptions,
  updateBeamboxPreferenceChange,
  paddingAccel,
  paddingAccelDiode,
}: Props): JSX.Element {
  const { lang } = i18n;
  const isDev = localStorage.getItem('dev');
  return (
    <>
      <div className="subtitle">{lang.settings.groups.engraving}</div>
      <SelectControl
        id="set-fast-gradient"
        label={lang.settings.fast_gradient}
        url={lang.settings.help_center_urls.fast_gradient}
        options={fastGradientOptions}
        onChange={(e) => updateBeamboxPreferenceChange('fast_gradient', e.target.value)}
      />
      <SelectControl
        id="set-reverse-engraving"
        label={lang.settings.engraving_direction}
        options={reverseEngravingOptions}
        onChange={(e) => updateBeamboxPreferenceChange('reverse-engraving', e.target.value)}
      />
      {isDev && (
        <>
          <Controls label="Padding Accel">
            <UnitInput
              id="hardware-acceleration"
              unit="mm/s^2"
              min={500}
              max={12000}
              decimal={0}
              defaultValue={paddingAccel.defaultValue}
              getValue={paddingAccel.getValue}
              className={{ half: true }}
            />
          </Controls>
          <Controls label="Padding Accel HL">
            <UnitInput
              id="hardware-acceleration"
              unit="mm/s^2"
              min={500}
              max={12000}
              decimal={0}
              defaultValue={paddingAccelDiode.defaultValue}
              getValue={paddingAccelDiode.getValue}
              className={{ half: true }}
            />
          </Controls>
        </>
      )}
    </>
  );
}

export default Engraving;
