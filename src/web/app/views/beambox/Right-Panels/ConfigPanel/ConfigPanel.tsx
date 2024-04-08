import classNames from 'classnames';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { ConfigProvider, Modal, Select } from 'antd';
import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import ColorBlock from 'app/components/beambox/right-panel/ColorBlock';
import DropdownControl from 'app/widgets/Dropdown-Control';
import dialogCaller from 'app/actions/dialog-caller';
import diodeBoundaryDrawer from 'app/actions/canvas/diode-boundary-drawer';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import isDev from 'helpers/is-dev';
import LaserManageModal from 'app/views/beambox/Right-Panels/LaserManage/LaserManageModal';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import LayerPanelIcons from 'app/icons/layer-panel/LayerPanelIcons';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import presprayArea from 'app/actions/canvas/prespray-area';
import storage from 'implementations/storage';
import tutorialConstants from 'app/constants/tutorial-constants';
import tutorialController from 'app/views/tutorials/tutorialController';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';
import useWorkarea from 'helpers/hooks/useWorkarea';
import {
  CUSTOM_PRESET_CONSTANT,
  DataType,
  defaultConfig,
  getData,
  getLayerConfig,
  getLayersConfig,
  postPresetChange,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { getLayerElementByName, moveToOtherLayer } from 'helpers/layer/layer-helper';
import { getModulePresets } from 'app/constants/right-panel-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea } from 'app/constants/workarea-constants';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { LayerPanelContext } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { updateDefaultPresetData } from 'helpers/presets/preset-helper';

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
import styles from './ConfigPanel.module.scss';
import UVBlock from './UVBlock';
import WhiteInkCheckbox from './WhiteInkCheckbox';

const PARAMETERS_CONSTANT = 'parameters';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});
const timeEstimationButtonEventEmitter =
  eventEmitterFactory.createEventEmitter('time-estimation-button');

interface Props {
  UIType?: 'default' | 'panel-item' | 'modal';
}

// TODO: add test
const ConfigPanel = ({ UIType = 'default' }: Props): JSX.Element => {
  const { selectedLayers: initLayers } = useContext(LayerPanelContext);
  const [selectedLayers, setSelectedLayers] = useState(initLayers);
  useEffect(() => {
    if (UIType === 'modal') {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayerName = drawing.getCurrentLayerName();
      setSelectedLayers([currentLayerName]);
    } else setSelectedLayers(initLayers);
  }, [initLayers, UIType]);
  const forceUpdate = useForceUpdate();
  const lang = useI18n().beambox.right_panel.laser_panel;
  const hiddenOptions = useMemo(
    () => [
      {
        value: PARAMETERS_CONSTANT,
        key: lang.dropdown.parameters,
        label: lang.dropdown.parameters,
      },
      { value: lang.custom_preset, key: lang.custom_preset, label: lang.custom_preset },
      { value: lang.various_preset, key: lang.various_preset, label: lang.various_preset },
    ],
    [lang.dropdown.parameters, lang.custom_preset, lang.various_preset]
  );

  useMemo(() => updateDefaultPresetData(), []);
  const [state, dispatch] = useReducer(reducer, null, () => getDefaultState());

  const updateDiodeBoundary = useCallback(() => {
    const allowDiode = constant.addonsSupportList.hybridLaser.includes(
      beamboxPreference.read('workarea')
    );
    if (beamboxPreference.read('enable-diode') && allowDiode)
      diodeBoundaryDrawer.show(state.diode.value === 1);
    else diodeBoundaryDrawer.hide();
  }, [state.diode.value]);

  useEffect(() => {
    updateDiodeBoundary();
  }, [updateDiodeBoundary]);

  const workarea = useWorkarea();
  useEffect(() => {
    updateDefaultPresetData();
    postPresetChange();
    presprayArea.togglePresprayArea();
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    const layerData = getLayerConfig(currentLayerName);
    const { speed, repeat } = state;
    if (speed.value !== layerData.speed.value || repeat.value !== layerData.repeat.value) {
      timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    }
    dispatch({ type: 'update', payload: layerData });
    updateDiodeBoundary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workarea]);

  const initState = useCallback((layers: string[] = LayerPanelController.getSelectedLayers()) => {
    if (layers.length > 1) {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayerName = drawing.getCurrentLayerName();
      const config = getLayersConfig(layers, currentLayerName);
      dispatch({ type: 'update', payload: config });
    } else if (layers.length === 1) {
      const config = getLayerConfig(layers[0]);
      dispatch({ type: 'update', payload: config });
    }
  }, []);

  useEffect(() => initState(selectedLayers), [initState, selectedLayers]);

  const model = beamboxPreference.read('workarea') || beamboxPreference.read('model');
  const parametersSet = getModulePresets(model, state.module.value);
  const customizedConfigs = (storage.get('customizedLaserConfigs') || []) as ILaserConfig[];
  const moduleCustomConfigs = customizedConfigs.filter((c) => !c.isDefault || parametersSet[c.key]);

  const dropdownValue = useMemo(() => {
    const { configName: name, speed, power, ink, repeat, zStep, diode, multipass } = state;
    // multi select
    if (
      speed.hasMultiValue ||
      power.hasMultiValue ||
      ink.hasMultiValue ||
      repeat.hasMultiValue ||
      diode.hasMultiValue ||
      zStep.hasMultiValue ||
      name.hasMultiValue ||
      multipass.hasMultiValue
    ) {
      return lang.various_preset;
    }
    const config = moduleCustomConfigs?.find((c) => c.name === name.value);
    if (name.value === CUSTOM_PRESET_CONSTANT || !config) {
      return lang.custom_preset;
    }
    if (name.value) return config.key ?? config.name;
    return PARAMETERS_CONSTANT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleSelectPresets = (value: string) => {
    if (value === PARAMETERS_CONSTANT) {
      forceUpdate();
      return;
    }
    const selectedConfig = (storage.get('customizedLaserConfigs') as ILaserConfig[]).find((e) => {
      if (e.isDefault) return e.key === value;
      return e.name === value;
    });
    if (!selectedConfig) {
      console.error('No such value', value);
      return;
    }
    const {
      speed: dataSpeed,
      power = defaultConfig.strength,
      repeat = defaultConfig.repeat,
      zStep = defaultConfig.zstep,
      isDefault,
      key,
      name,
      ink = defaultConfig.ink,
      multipass = defaultConfig.multipass,
    } = selectedConfig;
    const { maxSpeed, minSpeed } = getWorkarea(beamboxPreference.read('workarea'));
    const speed = Math.max(minSpeed, Math.min(dataSpeed, maxSpeed));
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    dispatch({
      type: 'change',
      payload: {
        speed,
        power,
        repeat,
        zStep,
        configName: name,
        selectedItem: name,
        ink,
        multipass,
      },
    });
    if (UIType !== 'modal') {
      const batchCmd = new history.BatchCommand('Change layer preset');
      selectedLayers.forEach((layerName: string) => {
        writeData(layerName, DataType.speed, speed, { applyPrinting: true, batchCmd });
        writeData(layerName, DataType.strength, power, { batchCmd });
        writeData(layerName, DataType.repeat, repeat, { batchCmd });
        writeData(layerName, DataType.zstep, zStep, { batchCmd });
        writeData(layerName, DataType.configName, name, { batchCmd });
        writeData(layerName, DataType.ink, ink, { batchCmd });
        writeData(layerName, DataType.multipass, multipass, { batchCmd });
      });
      batchCmd.onAfter = initState;
      svgCanvas.addCommandToHistory(batchCmd);
    }

    const { SET_PRESET_WOOD_ENGRAVING, SET_PRESET_WOOD_CUTTING } = tutorialConstants;
    if (SET_PRESET_WOOD_ENGRAVING === tutorialController.getNextStepRequirement()) {
      if (isDefault && key.startsWith('wood_engraving')) tutorialController.handleNextStep();
      else alertCaller.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_engraving });
    } else if (SET_PRESET_WOOD_CUTTING === tutorialController.getNextStepRequirement()) {
      if (isDefault && /^wood_[\d]+mm_cutting/.test(key)) tutorialController.handleNextStep();
      else alertCaller.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_cutting });
    }
  };

  const { selectedItem } = state;
  const handleOpenManageModal = () => {
    dialogCaller.addDialogComponent(
      'laser-manage-modal',
      <LaserManageModal
        selectedItem={selectedItem}
        onClose={() => {
          dialogCaller.popDialogById('laser-manage-modal');
          forceUpdate();
        }}
        onSave={postPresetChange}
      />
    );
  };

  const isCustomBacklashEnabled = beamboxPreference.read('enable-custom-backlash');
  const unit = useMemo(() => (storage.get('default-units') as string) || 'mm', []);
  const dropdownOptions = moduleCustomConfigs
    ? moduleCustomConfigs.map((e) => ({
        value: e.key || e.name,
        key: e.key || e.name,
        label: e.name,
      }))
    : Object.keys(parametersSet).map((key) => {
        const val = parametersSet[key];
        const label = lang.dropdown[unit][val.name] || key;
        return { value: key, key, label };
      });

  const displayName = selectedLayers.length === 1 ? selectedLayers[0] : lang.multi_layer;
  const { module, fullcolor } = state;
  const isDevMode = isDev();
  const commonContent = (
    <>
      {isDevMode && module.value === LayerModule.PRINTER && UIType === 'default' && <UVBlock />}
      {module.value !== LayerModule.PRINTER && <PowerBlock type={UIType} />}
      {module.value === LayerModule.PRINTER && <InkBlock type={UIType} />}
      <SpeedBlock type={UIType} />
      {module.value === LayerModule.PRINTER && <MultipassBlock type={UIType} />}
      {isDevMode &&
        module.value === LayerModule.PRINTER &&
        fullcolor.value &&
        UIType === 'default' && <WhiteInkCheckbox />}
      {isDevMode && isCustomBacklashEnabled && <Backlash type={UIType} />}
      <RepeatBlock type={UIType} />
      {isDevMode &&
        module.value === LayerModule.PRINTER &&
        fullcolor.value &&
        UIType === 'panel-item' && <WhiteInkCheckbox type={UIType} />}
    </>
  );

  const getContent = () => {
    if (UIType === 'default') {
      return (
        <div id="laser-panel">
          <div className={classNames('layername', 'hidden-mobile')}>
            {sprintf(lang.preset_setting, displayName)}
          </div>
          <ModuleBlock />
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
              {module.value !== LayerModule.PRINTER && <SaveConfigButton />}
            </div>
            {commonContent}
          </div>
          <AddOnBlock />
        </div>
      );
    }
    if (UIType === 'panel-item') {
      return (
        <>
          {modelsWithModules.has(model) && (
            <div className={styles['item-group']}>
              <ModuleBlock />
              {isDevMode && module.value === LayerModule.PRINTER && <UVBlock />}
              <ObjectPanelItem.Divider />
            </div>
          )}
          <div className={styles['item-group']}>
            <ObjectPanelItem.Select
              id="laser-config-dropdown"
              selected={
                dropdownOptions.find((option) => option.value === dropdownValue) || {
                  value: dropdownValue,
                  label: dropdownValue,
                }
              }
              onChange={handleSelectPresets}
              options={[
                ...dropdownOptions,
                ...hiddenOptions.filter((option) => option.value === dropdownValue),
              ]}
              label={lang.presets}
            />
            {commonContent}
          </div>
        </>
      );
    }
    const drawing = svgCanvas.getCurrentDrawing();
    const layerCount = drawing.getNumLayers();
    const onClose = () => {
      dialogCaller.popDialogById('config-panel');
      ObjectPanelController.updateActiveKey(null);
    };
    const onSave = (): void => {
      const destLayer = selectedLayers[0];
      const saveDataAndClose = () => {
        const batchCmd = new history.BatchCommand('Change layer parameter');
        selectedLayers.forEach((layerName: string) => {
          writeData(layerName, DataType.speed, state.speed.value, {
            applyPrinting: true,
            batchCmd,
          });
          writeData(layerName, DataType.strength, state.power.value, { batchCmd });
          writeData(layerName, DataType.repeat, state.repeat.value, { batchCmd });
          writeData(layerName, DataType.zstep, state.zStep.value, { batchCmd });
          writeData(layerName, DataType.configName, state.configName.value, { batchCmd });
          writeData(layerName, DataType.ink, state.ink.value, { batchCmd });
          writeData(layerName, DataType.multipass, state.multipass.value, { batchCmd });
        });
        batchCmd.onAfter = initState;
        svgCanvas.addCommandToHistory(batchCmd);
        onClose();
      };
      if (destLayer !== initLayers[0]) {
        moveToOtherLayer(destLayer, saveDataAndClose);
      } else {
        saveDataAndClose();
      }
    };
    const layerOptions = [];
    for (let i = layerCount - 1; i >= 0; i -= 1) {
      const layerName = drawing.getLayerName(i);
      const layer = getLayerElementByName(layerName);
      const layerModule = getData<LayerModule>(layer, DataType.module);
      const isFullColor = layer.getAttribute('data-fullcolor') === '1';
      layerOptions.push(
        <Select.Option key={layerName} value={layerName} label={layerName}>
          <div className={styles.option}>
            <ColorBlock
              size="mini"
              color={isFullColor ? 'fullcolor' : drawing.getLayerColor(layerName)}
            />
            {layerModule === LayerModule.PRINTER ? (
              <LayerPanelIcons.Print />
            ) : (
              <LayerPanelIcons.Laser />
            )}
            <span>{layerName}</span>
          </div>
        </Select.Option>
      );
    }
    return (
      <ConfigProvider
        theme={{
          components: { Button: { borderRadius: 100, controlHeight: 30 } },
        }}
      >
        <Modal
          className={styles.modal}
          title={lang.preset_setting.slice(0, -4)}
          onCancel={onClose}
          onOk={onSave}
          cancelText={i18n.lang.beambox.tool_panels.cancel}
          okText={i18n.lang.beambox.tool_panels.confirm}
          centered
          open
        >
          {selectedLayers.length > 0 && (
            <div className={styles['change-layer']}>
              <span className={styles.title}>
                {i18n.lang.beambox.right_panel.layer_panel.current_layer}:
              </span>
              <Select className={styles.select} defaultValue={selectedLayers[0]} disabled>
                {layerOptions}
              </Select>
            </div>
          )}
          {layerCount > 1 && (
            <div className={styles['change-layer']}>
              <span className={styles.title}>
                {i18n.lang.beambox.right_panel.layer_panel.move_elems_to}
              </span>
              <Select
                className={styles.select}
                popupMatchSelectWidth={false}
                value={selectedLayers[0]}
                onChange={(layerName) => setSelectedLayers([layerName])}
              >
                {layerOptions}
              </Select>
            </div>
          )}
          <ConfigProvider
            theme={{ components: { Select: { borderRadius: 100, controlHeight: 30 } } }}
          >
            <Select
              id="laser-config-dropdown"
              className={styles.select}
              value={dropdownValue}
              onChange={handleSelectPresets}
              options={[
                ...dropdownOptions,
                ...hiddenOptions.filter((option) => option.value === dropdownValue),
              ]}
            />
          </ConfigProvider>
          {commonContent}
        </Modal>
      </ConfigProvider>
    );
  };

  return (
    <ConfigPanelContext.Provider
      value={{
        simpleMode: !beamboxPreference.read('print-advanced-mode'),
        state,
        dispatch,
        selectedLayers,
        initState,
      }}
    >
      {getContent()}
    </ConfigPanelContext.Provider>
  );
};

export default memo(ConfigPanel);
