import React from 'react';

import SelectControl from 'app/components/settings/SelectControl';
import { OptionValues } from 'app/constants/enums';

interface Props {
  multipassCompensationOptions: { value: OptionValues, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (key: string, newVal: any) => void;
}

function Experimental({ multipassCompensationOptions, updateBeamboxPreferenceChange }: Props): JSX.Element {
  return (
    <>
      <div className="subtitle">Experimental Features</div>
      <SelectControl
        label="Multipass Compensation"
        id="multipass-compensation"
        options={multipassCompensationOptions}
        onChange={(e) => updateBeamboxPreferenceChange('multipass-compensation', e.target.value)}
      />
    </>
  );
}

export default Experimental;
