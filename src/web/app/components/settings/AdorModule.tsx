import React, { useCallback, useMemo } from 'react';

import Controls from 'app/components/settings/Control';
import constant, { WorkAreaModel } from 'app/actions/beambox/constant';
import LayerModule from 'app/constants/layer-module/layer-modules';
import moduleOffsets from 'app/constants/layer-module/module-offsets';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useI18n from 'helpers/useI18n';

interface Props {
  defaultUnit: string;
  selectedModel: WorkAreaModel;
  updateBeamboxPreferenceChange: (item_key: string, newVal: any) => void;
  currentModuleOffsets: { [m: number]: [number, number] };
}

const AdorModule = ({
  defaultUnit,
  selectedModel,
  updateBeamboxPreferenceChange,
  currentModuleOffsets,
}: Props): JSX.Element => {
  const lang = useI18n();
  const getModuleOffset = useCallback(
    (module: LayerModule) => currentModuleOffsets[module] || moduleOffsets[module],
    [currentModuleOffsets]
  );

  const editValue = useCallback((module: LayerModule, axis: 'x' | 'y', value: number) => {
    const index = axis === 'x' ? 0 : 1;
    const moduleOffset = [...getModuleOffset(module)];
    console.log(module, currentModuleOffsets, moduleOffsets, moduleOffset);
    moduleOffset[index] = value;
    updateBeamboxPreferenceChange('module-offsets', { ...currentModuleOffsets, [module]: moduleOffset });
  }, [currentModuleOffsets, getModuleOffset, updateBeamboxPreferenceChange]);
  const workareaWidth = useMemo(() => constant.dimension.getWidth(selectedModel) / 10, [selectedModel]);
  const workareaHeight = useMemo(() => constant.dimension.getHeight(selectedModel) / 10, [selectedModel]);
  return (
    <>
      <div className="subtitle">{lang.settings.groups.ador_modules}</div>
      <Controls label="t10w laser offset">
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
        <UnitInput
          id="10w-laser-x-offset"
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={-workareaWidth}
          max={workareaWidth}
          defaultValue={getModuleOffset(LayerModule.LASER_10W_DIODE)[0]}
          getValue={(val) => editValue(LayerModule.LASER_10W_DIODE, 'x', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
        <UnitInput
          id="10w-laser-y-offset"
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={-workareaHeight}
          max={workareaHeight}
          defaultValue={getModuleOffset(LayerModule.LASER_10W_DIODE)[1]}
          getValue={(val) => editValue(LayerModule.LASER_10W_DIODE, 'y', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
      </Controls>
      <Controls label="tprinter offset">
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>X</span>
        <UnitInput
          id="printer-x-offset"
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={-workareaWidth}
          max={workareaWidth}
          defaultValue={getModuleOffset(LayerModule.PRINTER)[0]}
          getValue={(val) => editValue(LayerModule.PRINTER, 'x', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
        <span className="font2" style={{ marginRight: '10px', lineHeight: '32px' }}>Y</span>
        <UnitInput
          id="printer-y-offset"
          unit={defaultUnit === 'inches' ? 'in' : 'mm'}
          min={-workareaHeight}
          max={workareaHeight}
          defaultValue={getModuleOffset(LayerModule.PRINTER)[1]}
          getValue={(val) => editValue(LayerModule.PRINTER, 'y', val)}
          forceUsePropsUnit
          className={{ half: true }}
        />
      </Controls>
    </>
  );
};

export default AdorModule;
