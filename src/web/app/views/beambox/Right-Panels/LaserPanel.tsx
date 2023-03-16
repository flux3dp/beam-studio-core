/* eslint-disable no-console */
/* eslint-disable no-continue */
import React from 'react';
import classNames from 'classnames';
import { sprintf } from 'sprintf-js';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import BeamboxStore from 'app/stores/beambox-store';
import Constant from 'app/actions/beambox/constant';
import Dialog from 'app/actions/dialog-caller';
import DiodeBoundaryDrawer from 'app/actions/beambox/diode-boundary-drawer';
import DropdownControl from 'app/widgets/Dropdown-Control';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import LaserManageModal from 'app/views/beambox/Right-Panels/LaserManage/LaserManageModal';
import storage from 'implementations/storage';
import TutorialConstants from 'app/constants/tutorial-constants';
import layerConfigHelper, {
  CUSTOM_PRESET_CONSTANT,
  DataType,
  getLayerConfig,
  getLayersConfig,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { getParametersSet } from 'app/constants/right-panel-constants';
import { updateDefaultPresetData } from 'helpers/presets/preset-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';
import { ILayerConfig } from 'interfaces/ILayerConfig';

import AutoFocus from './LaserPanel/AutoFocus';
import ConfigOperations from './LaserPanel/ConfigOperations';
import Diode from './LaserPanel/Diode';
import LayerType from './LaserPanel/LayerType';
import PowerBlock from './LaserPanel/PowerBlock';
import RepeatBlock from './LaserPanel/RepeatBlock';
import SpeedBlock from './LaserPanel/SpeedBlock';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.laser_panel;
const PARAMETERS_CONSTANT = 'parameters';
const hiddenOptions = [
  { value: PARAMETERS_CONSTANT, key: LANG.dropdown.parameters, label: LANG.dropdown.parameters },
  { value: LANG.custom_preset, key: LANG.custom_preset, label: LANG.custom_preset },
  { value: LANG.various_preset, key: LANG.various_preset, label: LANG.various_preset },
];

const timeEstimationButtonEventEmitter = eventEmitterFactory.createEventEmitter('time-estimation-button');

interface Props {
  selectedLayers: string[];
}

interface State extends ILayerConfig {
  didDocumentSettingsChanged: boolean;
  selectedItem?: string;
}

class LaserPanel extends React.PureComponent<Props, State> {
  private unit: string;

  constructor(props: Props) {
    super(props);
    this.unit = storage.get('default-units') || 'mm';
    updateDefaultPresetData();
    this.state = {
      speed: { value: 3 },
      power: { value: 1 },
      repeat: { value: 1 },
      height: { value: -3 },
      zStep: { value: 0 },
      diode: { value: 0 },
      type: { value: 1 },
      configName: { value: '' },
      didDocumentSettingsChanged: false,
    };
  }

  componentDidMount(): void {
    BeamboxStore.removeAllUpdateLaserPanelListeners();
    BeamboxStore.onUpdateLaserPanel(this.updateData);
    this.updateDiodeBoundary();
  }

  componentDidUpdate(): void {
    const { didDocumentSettingsChanged } = this.state;
    if (didDocumentSettingsChanged) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ didDocumentSettingsChanged: false });
    } else {
      this.updateDiodeBoundary();
    }
  }

  componentWillUnmount(): void {
    BeamboxStore.removeUpdateLaserPanelListener(this.updateData);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static getDerivedStateFromProps(props: Props) {
    const { selectedLayers } = props;
    if (selectedLayers.length > 1) {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayerName = drawing.getCurrentLayerName();
      const config = getLayersConfig(selectedLayers);
      const currentLayerConfig = getLayerConfig(currentLayerName);
      return {
        speed: { value: currentLayerConfig.speed.value, hasMultiValue: config.speed.hasMultiValue },
        power: { value: currentLayerConfig.power.value, hasMultiValue: config.power.hasMultiValue },
        repeat: { value: currentLayerConfig.repeat.value, hasMultiValue: config.repeat.hasMultiValue },
        height: { value: currentLayerConfig.height.value, hasMultiValue: config.height.hasMultiValue },
        zStep: { value: currentLayerConfig.zStep.value, hasMultiValue: config.zStep.hasMultiValue },
        diode: { value: currentLayerConfig.diode.value, hasMultiValue: config.diode.hasMultiValue },
        configName: { value: currentLayerConfig.configName.value, hasMultiValue: config.configName.hasMultiValue },
        type: { value: currentLayerConfig.type.value, hasMultiValue: config.type.hasMultiValue },
      };
    }
    if (selectedLayers.length === 1) {
      const config = getLayerConfig(selectedLayers[0]);
      return { ...config };
    }
    return null;
  }

  updateData = (): void => {
    updateDefaultPresetData();
    this.handleParametersChange();
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayerName = drawing.getCurrentLayerName();
    const layerData = layerConfigHelper.getLayerConfig(currentLayerName);
    const { speed, repeat } = this.state;
    if ((speed.value !== layerData.speed.value) || (repeat.value !== layerData.repeat.value)) {
      timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    }
    this.setState({
      ...layerData,
      didDocumentSettingsChanged: true,
    });
  };

  handleParametersChange = (): void => {
    const customizedLaserConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
    const workarea = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
    const parametersSet = getParametersSet(workarea);
    const drawing = svgCanvas.getCurrentDrawing();
    const layerCount = drawing.getNumLayers();
    for (let i = 0; i < layerCount; i += 1) {
      const layerName = drawing.getLayerName(i);
      const layer = drawing.getLayerByName(layerName);
      if (!layer) continue;

      const configName = layer.getAttribute('data-configName');
      const configIndex = customizedLaserConfigs.findIndex((config) => config.name === configName);
      if (configIndex >= 0) {
        const config = customizedLaserConfigs[configIndex];
        if (config.isDefault) {
          if (parametersSet[config.key]) {
            const { speed, power, repeat } = parametersSet[config.key];
            layer.setAttribute('data-speed', speed);
            layer.setAttribute('data-strength', power);
            layer.setAttribute('data-repeat', repeat);
          } else {
            layer.removeAttribute('data-configName');
          }
        } else {
          const { speed, power, repeat, zStep } = config;
          layer.setAttribute('data-speed', speed);
          layer.setAttribute('data-strength', power);
          layer.setAttribute('data-repeat', repeat);
          if (zStep) {
            layer.setAttribute('data-zstep', repeat);
          }
        }
      }
      if (workarea !== 'fhexa1' && Number(layer.getAttribute('data-speed')) > 300) {
        layer.setAttribute('data-speed', '300');
      }
    }
  };

  handleSpeedChange = (value: number): void => {
    this.setState({ speed: { value }, configName: { value: CUSTOM_PRESET_CONSTANT } });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.speed, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleStrengthChange = (value: number): void => {
    this.setState({ power: { value }, configName: { value: CUSTOM_PRESET_CONSTANT } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.strength, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleRepeatChange = (value: number): void => {
    this.setState({ repeat: { value }, configName: { value: CUSTOM_PRESET_CONSTANT } });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.repeat, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  toggleEnableHeight = (): void => {
    const { height } = this.state;
    const value = -height.value;
    this.setState({ height: { value } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, value));
  };

  handleHeightChange = (value: number): void => {
    this.setState({ height: { value } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, value));
  };

  handleZStepChange = (value: number): void => {
    this.setState({ zStep: { value }, configName: { value: CUSTOM_PRESET_CONSTANT } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.zstep, value);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleLayerTypeChange = (value: number): void => {
    this.setState({ type: { value } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.type, value));
  };

  toggleDiode = (): void => {
    const { diode } = this.state;
    const value = diode.value === 1 ? 0 : 1;
    this.setState({ diode: { value } });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.diode, value ? 1 : 0));
  };

  handleSaveConfig = (name: string): void => {
    const { speed, power, repeat, zStep } = this.state;
    const { selectedLayers } = this.props;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
    if (!customizedConfigs || customizedConfigs.length < 1) {
      storage.set('customizedLaserConfigs', [{
        name, speed: speed.value, power: power.value, repeat: repeat.value, zStep: zStep.value,
      }]);
      selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
      this.setState({ configName: { value: name }, selectedItem: name });
    } else {
      const index = customizedConfigs.findIndex((e) => e.name === name);
      if (index < 0) {
        storage.set('customizedLaserConfigs', customizedConfigs.concat([{
          name, speed: speed.value, power: power.value, repeat: repeat.value, zStep: zStep.value,
        }]));
        selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
        this.setState({ configName: { value: name }, selectedItem: name });
      } else {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: LANG.existing_name,
        });
      }
    }
  };

  handleParameterTypeChanged = (value: string): void => {
    if (value === PARAMETERS_CONSTANT) {
      this.forceUpdate();
      return;
    }

    const customizedConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]).find((e) => e.name === value);
    if (customizedConfigs) {
      const { speed: dataSpeed, power, repeat, zStep, isDefault, key } = customizedConfigs;
      const maxSpeed = BeamboxPreference.read('workarea') === 'fhexa1' ? 900 : 300;
      const speed = Math.max(3, Math.min(dataSpeed, maxSpeed));

      timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
      this.setState({
        speed: { value: speed },
        power: { value: power },
        repeat: { value: repeat || 1 },
        zStep: { value: zStep || 0 },
        selectedItem: value,
      });
      const { selectedLayers } = this.props;
      selectedLayers.forEach((layerName: string) => {
        writeData(layerName, DataType.speed, speed);
        writeData(layerName, DataType.strength, power);
        writeData(layerName, DataType.repeat, repeat || 1);
        writeData(layerName, DataType.zstep, zStep || 0);
        writeData(layerName, DataType.configName, value);
      });

      const { SET_PRESET_WOOD_ENGRAVING, SET_PRESET_WOOD_CUTTING } = TutorialConstants;
      if (SET_PRESET_WOOD_ENGRAVING === TutorialController.getNextStepRequirement()) {
        if (isDefault && key === 'wood_engraving') TutorialController.handleNextStep();
        else Alert.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_engraving });
      } else if (SET_PRESET_WOOD_CUTTING === TutorialController.getNextStepRequirement()) {
        if (isDefault && /^wood_[\d]+mm_cutting$/.test(key)) TutorialController.handleNextStep();
        else Alert.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_cutting });
      }
    } else {
      console.error('No such value', value);
    }
  };

  handleOpenManageModal = (): void => {
    const { selectedItem } = this.state;
    Dialog.addDialogComponent('laser-manage-modal', (
      <LaserManageModal
        selectedItem={selectedItem}
        onClose={() => {
          Dialog.popDialogById('laser-manage-modal');
          this.forceUpdate();
        }}
        onSave={this.handleParametersChange}
      />
    ));
  };

  getDefaultLaserOptions = (): string => {
    const { configName, speed, power, repeat, zStep, diode } = this.state;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
    if (speed.hasMultiValue || power.hasMultiValue || repeat.hasMultiValue || repeat.hasMultiValue
      || diode.hasMultiValue || zStep.hasMultiValue || configName.hasMultiValue) {
      // multi select
      return LANG.various_preset;
    }
    if (configName.value === CUSTOM_PRESET_CONSTANT
      || customizedConfigs.findIndex((config) => config.name === configName.value) < 0) {
      return LANG.custom_preset;
    }
    if (configName.value) return configName.value;
    return PARAMETERS_CONSTANT;
  };

  updateDiodeBoundary(): void {
    const { diode } = this.state;
    if (
      BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
    ) {
      DiodeBoundaryDrawer.show(diode.value === 1);
    } else {
      DiodeBoundaryDrawer.hide();
    }
  }

  renderAddPresetButton(): JSX.Element {
    const { selectedLayers } = this.props;
    const isDiabled = selectedLayers.length !== 1;
    return (
      <div
        className={classNames('add-preset-btn', { disabled: isDiabled })}
        onClick={() => {
          if (isDiabled) return;
          Dialog.promptDialog({
            caption: LANG.dropdown.save,
            onYes: (name) => {
              const newName = name.trim();
              if (newName) this.handleSaveConfig(newName);
            }
          });
        }}
      >
        <img src="img/icon-plus.svg" />
      </div>
    );
  }

  renderAddOnBlock = (): JSX.Element => {
    const { repeat, height, zStep, diode } = this.state;
    const isAutoFocusEnabled = BeamboxPreference.read('enable-autofocus')
      && Constant.addonsSupportList.autoFocus.includes(BeamboxPreference.read('workarea'));
    const isDiodeEnabled = BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'));
    if (!isAutoFocusEnabled && !isDiodeEnabled) {
      return null;
    }

    return (
      <div className="addon-block">
        <div className="label">{LANG.add_on}</div>
        <div className="addon-setting">
          {isAutoFocusEnabled && (
            <AutoFocus
              height={height}
              repeat={repeat}
              zStep={zStep}
              onToggle={this.toggleEnableHeight}
              onHeightChange={this.handleHeightChange}
              onZStepChange={this.handleZStepChange}
            />
          )}
          <Diode value={diode.value === 1} onToggle={this.toggleDiode} />
        </div>
      </div>
    );
  };

  render(): JSX.Element {
    const { selectedLayers } = this.props;
    const { power, speed, repeat, type } = this.state;
    let displayName = '';
    if (selectedLayers.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      displayName = selectedLayers[0];
    } else {
      displayName = LANG.multi_layer;
    }

    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
    let dropdownOptions: { value: string, key: string, label: string }[];
    if (customizedConfigs) {
      const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
      dropdownOptions = customizedConfigs.filter((p) => !(p.isDefault && !parametersSet[p.key]))
        .map((e) => ({
          value: e.name,
          key: e.name,
          label: e.name,
        }));
    } else {
      const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
      dropdownOptions = Object.keys(parametersSet).map((key) => ({
        value: key,
        key,
        label: (LANG.dropdown[this.unit][key] ? LANG.dropdown[this.unit][key] : key),
      }));
    }

    return (
      <div id="laser-panel">
        <div className="layername">
          {sprintf(LANG.preset_setting, displayName)}
        </div>
        <div className="layerparams">
          <ConfigOperations onMoreClick={this.handleOpenManageModal} />
          <div className="preset-dropdown-containter">
            <DropdownControl
              id="laser-config-dropdown"
              value={this.getDefaultLaserOptions()}
              onChange={this.handleParameterTypeChanged}
              options={dropdownOptions}
              hiddenOptions={hiddenOptions}
            />
            {this.renderAddPresetButton()}
          </div>
          <LayerType value={type.value} onChange={this.handleLayerTypeChange} />
          <PowerBlock power={power} onChange={this.handleStrengthChange} />
          <SpeedBlock
            layerNames={selectedLayers}
            speed={speed}
            onChange={this.handleSpeedChange}
          />
          <RepeatBlock repeat={repeat} onChange={this.handleRepeatChange} />
        </div>
        {this.renderAddOnBlock()}
      </div>
    );
  }
}

export default LaserPanel;
