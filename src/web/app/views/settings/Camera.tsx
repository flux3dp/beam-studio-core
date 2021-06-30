import * as React from 'react';

import Controls from 'app/views/settings/Control';
import i18n from 'helpers/i18n';
import UnitInput from 'app/widgets/Unit-Input-v2';

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
}: Props): JSX.Element {
  const lang = i18n.lang;
  return (
    <>
      <div className="subtitle">{lang.settings.groups.camera}</div>
      <Controls label={lang.settings.preview_movement_speed}>
        <UnitInput
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
          unit={unitHL}
          min={3}
          max={300}
          decimal={decimalHL}
          defaultValue={defaultValueHL}
          getValue={getValueHL}
          className={{ half: true }}
        />
      </Controls>
    </>
  );
}

export default Camera;
