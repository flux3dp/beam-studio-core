import * as React from 'react';

import BeamboxConstant, { WorkAreaModel } from 'app/actions/beambox/constant';
import Controls from 'app/components/settings/Control';
import i18n from 'helpers/i18n';
import SelectControl from 'app/components/settings/SelectControl';
import UnitInput from 'app/widgets/Unit-Input-v2';

interface Props {
  defaultUnit: string;
  selectedModel: WorkAreaModel;
  diodeOffsetX: number;
  diodeOffsetY: number;
  borderlessModeOptions: { value: any, label: string, selected: boolean }[];
  autofocusModuleOptions: { value: any, label: string, selected: boolean }[];
  diodeModuleOptions: { value: any, label: string, selected: boolean }[];
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
}

class Module extends React.Component<Props> {
  render() {
    const {
      defaultUnit,
      selectedModel,
      diodeOffsetX,
      diodeOffsetY,
      borderlessModeOptions,
      autofocusModuleOptions,
      diodeModuleOptions,
      updateBeamboxPreferenceChange,
    } = this.props;
    const lang = i18n.lang;

    return (
      <>
        <div className="subtitle">{lang.settings.groups.modules}</div>
        <SelectControl
          label={lang.settings.default_borderless_mode}
          url={lang.settings.help_center_urls.default_borderless_mode}
          id="default-open-bottom"
          options={borderlessModeOptions}
          onChange={(e) => updateBeamboxPreferenceChange('default-borderless', e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_enable_autofocus_module}
          url={lang.settings.help_center_urls.default_enable_autofocus_module}
          id="default-autofocus"
          options={autofocusModuleOptions}
          onChange={(e) => updateBeamboxPreferenceChange('default-autofocus', e.target.value)}
        />
        <SelectControl
          label={lang.settings.default_enable_diode_module}
          url={lang.settings.help_center_urls.default_enable_diode_module}
          id="default-diode"
          options={diodeModuleOptions}
          onChange={(e) => updateBeamboxPreferenceChange('default-diode', e.target.value)}
        />
        <Controls label={lang.settings.diode_offset}>
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
          <UnitInput
            id="diode-offset-x-input"
            unit={defaultUnit === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
            defaultValue={diodeOffsetX || 0}
            getValue={(val) => updateBeamboxPreferenceChange('diode_offset_x', val)}
            forceUsePropsUnit
            className={{ half: true }}
          />
          <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
          <UnitInput 
            id="diode-offset-y-input"
            unit={defaultUnit === 'inches' ? 'in' : 'mm'}
            min={0}
            max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
            defaultValue={diodeOffsetY || 0}
            getValue={(val) => updateBeamboxPreferenceChange('diode_offset_y', val)}
            forceUsePropsUnit
            className={{ half: true }}
          />
        </Controls>
      </>
    );
  }
}

export default Module;
