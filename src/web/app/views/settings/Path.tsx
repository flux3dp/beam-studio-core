import * as React from 'react';

import BeamboxConstant, { WorkAreaModel } from 'app/actions/beambox/constant';
import Controls from 'app/views/settings/Control';
import i18n from 'helpers/i18n';
import SelectControl from 'app/views/settings/SelectControl';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { StorageKey } from 'interfaces/IStorage';

interface Props {
  selectedModel: WorkAreaModel;
  defaultUnit: string;
  vectorSpeedConstraintOptions: { value: any, label: string, selected: boolean }[];
  precutSwitchOptions: { value: any, label: string, selected: boolean }[];
  loopCompensation: number;
  bladeRadius: number;
  precutX: number;
  precutY: number;
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
  updateConfigChange: (id: StorageKey, newVal: any) => void;
}

class Path extends React.Component<Props> {
  render() {
    const {
      selectedModel,
      defaultUnit,
      vectorSpeedConstraintOptions,
      precutSwitchOptions,
      loopCompensation,
      bladeRadius,
      precutX,
      precutY,
      updateBeamboxPreferenceChange,
      updateConfigChange,
    } = this.props;
    const lang = i18n.lang;

    return (
      <>
        <div className="subtitle">{lang.settings.groups.path}</div>
        <SelectControl
          id="set-vector-speed-contraint"
          label={lang.settings.vector_speed_constraint}
          url={lang.settings.help_center_urls.vector_speed_constraint}
          options={vectorSpeedConstraintOptions}
          onChange={(e) => updateBeamboxPreferenceChange('vector_speed_contraint', e.target.value)}
        />
        <Controls
          id="set-loop-compensation"
          label={lang.settings.loop_compensation}
          url={lang.settings.help_center_urls.loop_compensation}
        >
          <UnitInput
            id="loop-input"
            unit={defaultUnit === 'inches' ? 'in' : 'mm'}
            min={0}
            max={20}
            defaultValue={Number(loopCompensation || '0') / 10}
            getValue={(val) => updateConfigChange('loop_compensation', Number(val) * 10)}
            forceUsePropsUnit
            className={{ half: true }}
          />
        </Controls>
        { i18n.getActiveLang() === 'zh-cn'
          ? (
            <div>
              <Controls label={lang.settings.blade_radius}>
                <UnitInput
                  id="radius-input"
                  unit={defaultUnit === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={30}
                  step={0.01}
                  defaultValue={bladeRadius || 0}
                  getValue={(val) => updateBeamboxPreferenceChange('blade_radius', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                />
              </Controls>
              <SelectControl
                id="set-blade-precut"
                label={lang.settings.blade_precut_switch}
                options={precutSwitchOptions}
                onChange={(e) => updateBeamboxPreferenceChange('blade_precut', e.target.value)}
              />
              <Controls label={lang.settings.blade_precut_position}>
                <span className="font2" style={{ marginRight: '10px' }}>X</span>
                <UnitInput
                  id="precut-x-input"
                  unit={defaultUnit === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={BeamboxConstant.dimension.getWidth(selectedModel) / 10}
                  defaultValue={precutX || 0}
                  getValue={(val) => updateBeamboxPreferenceChange('precut_x', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                />
                <span className="font2" style={{ marginRight: '10px' }}>Y</span>
                <UnitInput
                  id="precut-y-input"
                  unit={defaultUnit === 'inches' ? 'in' : 'mm'}
                  min={0}
                  max={BeamboxConstant.dimension.getHeight(selectedModel) / 10}
                  defaultValue={precutY || 0}
                  getValue={(val) => updateBeamboxPreferenceChange('precut_y', val)}
                  forceUsePropsUnit
                  className={{ half: true }}
                />
              </Controls>
            </div>
          )
          : null}
      </>
    );
  }
}

export default Path;
