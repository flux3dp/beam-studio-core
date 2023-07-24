import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useReducer } from 'react';
import { Select } from 'antd';
import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import DropdownControl from 'app/widgets/Dropdown-Control';
import dialogCaller from 'app/actions/dialog-caller';
import diodeBoundaryDrawer from 'app/actions/canvas/diode-boundary-drawer';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import LaserManageModal from 'app/views/beambox/Right-Panels/LaserManage/LaserManageModal';
import LayerModule from 'app/constants/layer-modules';
import presprayArea from 'app/actions/beambox/prespray-area';
import storage from 'implementations/storage';
import tutorialConstants from 'app/constants/tutorial-constants';
import tutorialController from 'app/views/tutorials/tutorialController';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';
import {
  CUSTOM_PRESET_CONSTANT,
  DataType,
  getLayerConfig,
  getLayersConfig,
  postPresetChange,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { getParametersSet } from 'app/constants/right-panel-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { updateDefaultPresetData } from 'helpers/presets/preset-helper';
import { useIsMobile } from 'helpers/system-helper';

import AddOnBlock from './AddOnBlock';
import Backlash from './Backlash';
import ConfigOperations from './ConfigOperations';
import ConfigPanelContext, { getDefaultState, reducer } from './ConfigPanelContext';
import InkBlock from './InkBlock';
import ModuleBlock from './ModuleBlock';
import MultipassBlock from './MultipassBlock';
import PowerBlock from './PowerBlock';
import RepeatBlock from './RepeatBlock';
import SaveConfigButton from './SaveConfigButton';
import SpeedBlock from './SpeedBlock';

const PARAMETERS_CONSTANT = 'parameters';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });
const timeEstimationButtonEventEmitter = eventEmitterFactory.createEventEmitter('time-estimation-button');

interface Props {
  selectedLayers: string[];
}

// TODO: add test
const ConfigPanel = ({ selectedLayers }: Props): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const lang = useI18n().beambox.right_panel.laser_panel;
  const hiddenOptions = useMemo(() => [
    { value: PARAMETERS_CONSTANT, key: lang.dropdown.parameters, label: lang.dropdown.parameters },
    { value: lang.custom_preset, key: lang.custom_preset, label: lang.custom_preset },
    { value: lang.various_preset, key: lang.various_preset, label: lang.various_preset },
  ], [lang.dropdown.parameters, lang.custom_preset, lang.various_preset]);

  useMemo(() => updateDefaultPresetData(), []);
  const [state, dispatch] = useReducer(reducer, null, () => getDefaultState());

  const updateDiodeBoundary = useCallback(() => {
    const allowDiode = constant.addonsSupportList.hybridLaser.includes(beamboxPreference.read('workarea'));
    if (beamboxPreference.read('enable-diode') && allowDiode) diodeBoundaryDrawer.show(state.diode.value === 1);
    else diodeBoundaryDrawer.hide();
  }, [state.diode.value]);

  useEffect(() => {
    updateDiodeBoundary();
  }, [updateDiodeBoundary]);

  const updateData = useCallback(() => {
    updateDefaultPresetData();
    postPresetChange();
    presprayArea.togglePresprayArea();
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    const layerData = getLayerConfig(currentLayerName);
    const { speed, repeat } = state;
    if ((speed.value !== layerData.speed.value) || (repeat.value !== layerData.repeat.value)) {
      timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    }
    dispatch({ type: 'update', payload: layerData });
  }, [state, dispatch]);

  useEffect(() => {
    beamboxStore.onUpdateWorkArea(updateData);
    beamboxStore.onUpdateWorkArea(updateDiodeBoundary);
    return () => {
      beamboxStore.removeUpdateWorkAreaListener(updateData);
      beamboxStore.removeUpdateWorkAreaListener(updateDiodeBoundary);
    };
  }, [updateData, updateDiodeBoundary]);

  useEffect(() => {
    if (selectedLayers.length > 1) {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayerName = drawing.getCurrentLayerName();
      const config = getLayersConfig(selectedLayers);
      const currentLayerConfig = getLayerConfig(currentLayerName);
      const payload = {
        speed: { value: currentLayerConfig.speed.value, hasMultiValue: config.speed.hasMultiValue },
        power: { value: currentLayerConfig.power.value, hasMultiValue: config.power.hasMultiValue },
        ink: { value: currentLayerConfig.ink.value, hasMultiValue: config.ink.hasMultiValue },
        repeat: { value: currentLayerConfig.repeat.value, hasMultiValue: config.repeat.hasMultiValue },
        height: { value: currentLayerConfig.height.value, hasMultiValue: config.height.hasMultiValue },
        zStep: { value: currentLayerConfig.zStep.value, hasMultiValue: config.zStep.hasMultiValue },
        diode: { value: currentLayerConfig.diode.value, hasMultiValue: config.diode.hasMultiValue },
        configName: { value: currentLayerConfig.configName.value, hasMultiValue: config.configName.hasMultiValue },
        module: { value: currentLayerConfig.module.value, hasMultiValue: config.module.hasMultiValue },
        backlash: { value: currentLayerConfig.backlash.value, hasMultiValue: config.backlash.hasMultiValue },
      };
      dispatch({ type: 'update', payload });
    }
    if (selectedLayers.length === 1) {
      const config = getLayerConfig(selectedLayers[0]);
      dispatch({ type: 'update', payload: config });
    }
  }, [selectedLayers]);

  const isMobile = useIsMobile();

  const dropdownValue = useMemo(() => {
    const { configName: name, speed, power, ink, repeat, zStep, diode } = state;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
    // multi select
    if (speed.hasMultiValue || power.hasMultiValue || ink.hasMultiValue || repeat.hasMultiValue || repeat.hasMultiValue
      || diode.hasMultiValue || zStep.hasMultiValue || name.hasMultiValue) {
      return lang.various_preset;
    }
    if (name.value === CUSTOM_PRESET_CONSTANT || customizedConfigs.findIndex((c) => c.name === name.value) < 0) {
      return lang.custom_preset;
    }
    if (name.value) return name.value;
    return PARAMETERS_CONSTANT;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleSelectPresets = (value: string) => {
    if (value === PARAMETERS_CONSTANT) {
      forceUpdate();
      return;
    }
    const customizedConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]).find((e) => e.name === value);
    if (!customizedConfigs) {
      console.error('No such value', value);
      return;
    }
    const { speed: dataSpeed, power, repeat, zStep, isDefault, key } = customizedConfigs;
    const maxSpeed = constant.dimension.getMaxSpeed(beamboxPreference.read('workarea'));
    const speed = Math.max(3, Math.min(dataSpeed, maxSpeed));
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    dispatch({
      type: 'change',
      payload: { speed, power, repeat: repeat || 1, zStep: zStep || 0, configName: value, selectedItem: value },
    });
    selectedLayers.forEach((layerName: string) => {
      writeData(layerName, DataType.speed, speed);
      writeData(layerName, DataType.strength, power);
      writeData(layerName, DataType.repeat, repeat || 1);
      writeData(layerName, DataType.zstep, zStep || 0);
      writeData(layerName, DataType.configName, value);
    });

    const { SET_PRESET_WOOD_ENGRAVING, SET_PRESET_WOOD_CUTTING } = tutorialConstants;
    if (SET_PRESET_WOOD_ENGRAVING === tutorialController.getNextStepRequirement()) {
      if (isDefault && key === 'wood_engraving') tutorialController.handleNextStep();
      else alertCaller.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_engraving });
    } else if (SET_PRESET_WOOD_CUTTING === tutorialController.getNextStepRequirement()) {
      if (isDefault && /^wood_[\d]+mm_cutting$/.test(key)) tutorialController.handleNextStep();
      else alertCaller.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_cutting });
    }
  };

  const { selectedItem } = state;
  const handleOpenManageModal = () => {
    dialogCaller.addDialogComponent('laser-manage-modal', (
      <LaserManageModal
        selectedItem={selectedItem}
        onClose={() => {
          dialogCaller.popDialogById('laser-manage-modal');
          forceUpdate();
        }}
        onSave={postPresetChange}
      />
    ));
  };

  const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
  const parametersSet = getParametersSet(beamboxPreference.read('workarea') || beamboxPreference.read('model'));
  const isCustomBacklashEnabled = beamboxPreference.read('enable-custom-backlash');
  const unit = useMemo(() => storage.get('default-units') as string || 'mm', []);
  const dropdownOptions = customizedConfigs
    ? customizedConfigs
      .filter((p) => !(p.isDefault && !parametersSet[p.key]))
      .map((e) => ({ value: e.name, key: e.name, label: e.name }))
    : Object
      .keys(parametersSet)
      .map((key) => ({ value: key, key, label: (lang.dropdown[unit][key] || key) }));

  const displayName = selectedLayers.length === 1 ? selectedLayers[0] : lang.multi_layer;

  const { module } = state;
  const isDevMode = isDev();
  return (
    <ConfigPanelContext.Provider
      value={{
        state,
        dispatch,
        selectedLayers,
      }}
    >
      {isMobile
        ? (
          <div id="laser-panel">
            <Select
              id="laser-config-dropdown"
              value={dropdownValue}
              onChange={handleSelectPresets}
              options={[...dropdownOptions, ...hiddenOptions]}
              size="large"
              style={{ width: '100%' }}
            />
            {module.value === LayerModule.LASER && <PowerBlock />}
            {module.value === LayerModule.PRINTER && <InkBlock />}
            <SpeedBlock />
            <RepeatBlock />
          </div>
        )
        : (
          <div id="laser-panel">
            <div className={classNames('layername', 'hidden-mobile')}>
              {sprintf(lang.preset_setting, displayName)}
            </div>
            {isDevMode && <ModuleBlock />}
            <div className="layerparams">
              <ConfigOperations onMoreClick={handleOpenManageModal} />
              <div className="preset-dropdown-containter">
                <DropdownControl
                  id="laser-config-dropdown"
                  value={dropdownValue}
                  onChange={handleSelectPresets}
                  options={dropdownOptions}
                  hiddenOptions={hiddenOptions}
                />
                <SaveConfigButton />
              </div>
              {module.value === LayerModule.LASER && <PowerBlock />}
              {module.value === LayerModule.PRINTER && <InkBlock />}
              <SpeedBlock />
              {(isDevMode && isCustomBacklashEnabled) && <Backlash />}
              {module.value === LayerModule.PRINTER && <MultipassBlock />}
              <RepeatBlock />
            </div>
            <AddOnBlock />
          </div>
        )}
    </ConfigPanelContext.Provider>
  );
};

export default memo(ConfigPanel);
