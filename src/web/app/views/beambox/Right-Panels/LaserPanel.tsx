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
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import LaserManageModal from 'app/views/beambox/Right-Panels/Laser-Manage-Modal';
import storage from 'implementations/storage';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getParametersSet, getAllKeys } from 'app/constants/right-panel-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import {
  CUSTOM_PRESET_CONSTANT,
  DataType,
  getLayerConfig,
  getLayersConfig,
  writeData,
} from 'helpers/layer/layer-config-helper';
import { ILaserConfig } from 'interfaces/ILaserConfig';

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
let defaultLaserOptions = [];
const allKeys = getAllKeys();
const hiddenOptions = [
  { value: PARAMETERS_CONSTANT, key: LANG.dropdown.parameters, label: LANG.dropdown.parameters },
  { value: LANG.custom_preset, key: LANG.custom_preset, label: LANG.custom_preset },
  { value: LANG.various_preset, key: LANG.various_preset, label: LANG.various_preset },
];

const updateDefaultParameterOptions = (): void => {
  const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
  defaultLaserOptions = Object.keys(parametersSet);
};

const timeEstimationButtonEventEmitter = eventEmitterFactory.createEventEmitter('time-estimation-button');

interface Props {
  selectedLayers: string[];
}

interface State {
  speed: number;
  power: number;
  repeat: number;
  height: number;
  zStep: number;
  isDiode: boolean;
  type: number;
  configName?: string;
  didDocumentSettingsChanged: boolean;
  selectedItem?: string;
  hasMultiSpeed?: boolean;
  hasMultiPower?: boolean;
  hasMultiRepeat?: boolean;
  hasMultiHeight?: boolean;
  hasMultiZStep?: boolean;
  hasMultiDiode?: boolean;
  hasMultiConfigName?: boolean;
  modal?: string;
}

class LaserPanel extends React.PureComponent<Props, State> {
  private unit: string;

  constructor(props: Props) {
    super(props);
    this.unit = storage.get('default-units') || 'mm';
    this.initDefaultConfig();
    this.state = {
      speed: 3,
      power: 1,
      repeat: 1,
      height: -3,
      zStep: 0,
      isDiode: false,
      type: 1,
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
        hasMultiSpeed: config.speed.hasMultiValue,
        hasMultiPower: config.power.hasMultiValue,
        hasMultiRepeat: config.repeat.hasMultiValue,
        hasMultiHeight: config.height.hasMultiValue,
        hasMultiZStep: config.zStep.hasMultiValue,
        hasMultiDiode: config.diode.hasMultiValue,
        hasMultiConfigName: config.configName.hasMultiValue,
        ...currentLayerConfig,
        isDiode: Boolean(currentLayerConfig
          && currentLayerConfig.diode
          && currentLayerConfig.diode > 0),
      };
    }
    if (selectedLayers.length === 1) {
      const config = getLayerConfig(selectedLayers[0]);
      return {
        ...config,
        isDiode: Boolean(config && config.diode && config.diode > 0),
        hasMultiSpeed: false,
        hasMultiPower: false,
        hasMultiRepeat: false,
        hasMultiHeight: false,
        hasMultiZStep: false,
        hasMultiDiode: false,
        hasMultiConfigName: false,
      };
    }
    return null;
  }

  initDefaultConfig = (): void => {
    const { unit } = this;
    updateDefaultParameterOptions();
    if (!storage.get('defaultLaserConfigsInUse') || !storage.get('customizedLaserConfigs')) {
      const defaultConfigs = defaultLaserOptions.map((e) => {
        const { speed, power, repeat } = this.getDefaultParameters(e);
        return {
          name: LANG.dropdown[unit][e],
          speed,
          power,
          repeat,
          isDefault: true,
          key: e,
        };
      });
      let customizedLaserConfigs = storage.get('customizedLaserConfigs') || [];
      customizedLaserConfigs = customizedLaserConfigs.filter((config) => !config.isDefault);
      customizedLaserConfigs = defaultConfigs.concat(customizedLaserConfigs);
      const defaultLaserConfigsInUse = {};
      defaultLaserOptions.forEach((e) => {
        defaultLaserConfigsInUse[e] = true;
      });
      storage.set('customizedLaserConfigs', customizedLaserConfigs);
      storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
    } else {
      const customized = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
      const defaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse') || {};
      for (let i = 0; i < customized.length; i += 1) {
        if (customized[i].isDefault) {
          if (defaultLaserOptions.includes(customized[i].key)) {
            const { speed, power, repeat } = this.getDefaultParameters(customized[i].key);
            customized[i].name = LANG.dropdown[unit][customized[i].key];
            customized[i].speed = speed;
            customized[i].power = power;
            customized[i].repeat = repeat || 1;
          } else if (!allKeys.has(customized[i].key)) {
            delete defaultLaserConfigsInUse[customized[i].key];
            customized.splice(i, 1);
            i -= 1;
          }
        }
      }
      const newPreset = defaultLaserOptions.filter(
        (option) => defaultLaserConfigsInUse[option] === undefined,
      );
      newPreset.forEach((preset) => {
        if (defaultLaserOptions.includes(preset)) {
          const { speed, power, repeat } = this.getDefaultParameters(preset);
          customized.push({
            name: LANG.dropdown[unit][preset],
            speed,
            power,
            repeat,
            isDefault: true,
            key: preset,
          });
          defaultLaserConfigsInUse[preset] = true;
        } else {
          delete defaultLaserConfigsInUse[preset];
        }
      });
      storage.set('customizedLaserConfigs', customized);
      storage.set('defaultLaserConfigsInUse', defaultLaserConfigsInUse);
    }
  };

  updateData = (): void => {
    this.initDefaultConfig();
    this.handleParametersChange();
    const layerData = FnWrapper.getCurrentLayerData();
    const { speed, repeat } = this.state;
    if ((speed !== layerData.speed) || (repeat !== layerData.repeat)) {
      timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    }
    this.setState({
      speed: layerData.speed,
      power: layerData.power,
      repeat: layerData.repeat,
      height: layerData.height,
      zStep: layerData.zStep,
      isDiode: parseInt(layerData.isDiode, 10) > 0,
      didDocumentSettingsChanged: true,
      type: Number(layerData.type),
    });
  };

  handleParametersChange = (): void => {
    const customizedLaserConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
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
          if (defaultLaserOptions.includes(config.key)) {
            const { speed, power, repeat } = this.getDefaultParameters(config.key);
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

      if (BeamboxPreference.read('workarea') !== 'fhexa1' && Number(layer.getAttribute('data-speed')) > 300) {
        layer.setAttribute('data-speed', '300');
      }
    }
  };

  handleSpeedChange = (val: number): void => {
    this.setState({ speed: val, configName: CUSTOM_PRESET_CONSTANT });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.speed, val);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleStrengthChange = (val: number): void => {
    this.setState({ power: val, configName: CUSTOM_PRESET_CONSTANT });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.strength, val);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleRepeatChange = (val: number): void => {
    this.setState({ repeat: val, configName: CUSTOM_PRESET_CONSTANT });
    timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.repeat, val);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  toggleEnableHeight = (): void => {
    const { height } = this.state;
    const val = -height;
    this.setState({ height: val });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, val));
  };

  handleHeightChange = (val: number): void => {
    this.setState({ height: val });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.height, val));
  };

  handleZStepChange = (val: number): void => {
    this.setState({ zStep: val, configName: CUSTOM_PRESET_CONSTANT });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => {
      writeData(layerName, DataType.zstep, val);
      writeData(layerName, DataType.configName, CUSTOM_PRESET_CONSTANT);
    });
  };

  handleLayerTypeChange = (val: number): void => {
    this.setState({ type: val });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.type, val));
  };

  toggleDiode = (): void => {
    const { isDiode } = this.state;
    const val = !isDiode;
    this.setState({ isDiode: val });
    const { selectedLayers } = this.props;
    selectedLayers.forEach((layerName) => writeData(layerName, DataType.diode, val ? 1 : 0));
  };

  handleSaveConfig = (name: string): void => {
    const {
      speed, power, repeat, zStep,
    } = this.state;
    const { selectedLayers } = this.props;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
    if (!customizedConfigs || customizedConfigs.length < 1) {
      storage.set('customizedLaserConfigs', [{ name, speed, power, repeat, zStep }]);
      selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
      this.setState({ configName: name, selectedItem: name });
    } else {
      const index = customizedConfigs.findIndex((e) => e.name === name);
      if (index < 0) {
        storage.set('customizedLaserConfigs', customizedConfigs.concat([{ name, speed, power, repeat, zStep }]));
        selectedLayers.forEach((layerName) => writeData(layerName, DataType.configName, name));
        this.setState({ configName: name, selectedItem: name });
      } else {
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: LANG.existing_name,
        });
      }
    }
  };

  handleCancelModal = (): void => {
    this.setState({ modal: '' });
  };

  handleParameterTypeChanged = (value: string): void => {
    if (value === PARAMETERS_CONSTANT) {
      this.forceUpdate();
      return;
    }
    if (value === 'save') {
      Dialog.promptDialog({
        caption: LANG.dropdown.save,
        onYes: (name) => {
          const newName = name.trim();
          if (!newName) {
            return;
          }
          this.handleSaveConfig(newName);
        },
        onCancel: () => {
          this.handleCancelModal();
        },
      });
    } else {
      const customizedConfigs = (storage.get('customizedLaserConfigs') as ILaserConfig[]).find((e) => e.name === value);
      if (customizedConfigs) {
        const {
          speed: dataSpeed,
          power,
          repeat,
          zStep,
          isDefault,
          key,
        } = customizedConfigs;
        const maxSpeed = BeamboxPreference.read('workarea') === 'fhexa1' ? 900 : 300;
        const speed = Math.max(3, Math.min(dataSpeed, maxSpeed));

        timeEstimationButtonEventEmitter.emit('SET_ESTIMATED_TIME', null);
        this.setState({
          speed,
          power,
          repeat: repeat || 1,
          zStep: zStep || 0,
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

        if (TutorialConstants.SET_PRESET_WOOD_ENGRAVING
          === TutorialController.getNextStepRequirement()) {
          if (isDefault && ['wood_engraving'].includes(key)) {
            TutorialController.handleNextStep();
          } else {
            Alert.popUp({
              message: i18n.lang.tutorial.newUser.please_select_wood_engraving,
            });
          }
        } else if (TutorialConstants.SET_PRESET_WOOD_CUTTING
          === TutorialController.getNextStepRequirement()) {
          if (
            isDefault
            && ['wood_3mm_cutting', 'wood_5mm_cutting', 'wood_8mm_cutting', 'wood_10mm_cutting'].includes(key)
          ) TutorialController.handleNextStep();
          else Alert.popUp({ message: i18n.lang.tutorial.newUser.please_select_wood_cutting });
        }
      } else {
        console.error('No such value', value);
      }
    }
  };

  getDefaultParameters = (paraName: string): { speed: number, power: number, repeat: number } => {
    const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
    if (!parametersSet[paraName]) {
      console.error(`Unable to get default preset key: ${paraName}`);
      return { speed: 20, power: 15, repeat: 1 };
    }
    const { speed, power } = parametersSet[paraName];
    const repeat = parametersSet[paraName].repeat || 1;
    return { speed, power, repeat };
  };

  renderMoreModal = (): JSX.Element => {
    const { selectedItem } = this.state;
    return (
      <LaserManageModal
        selectedItem={selectedItem}
        initDefaultConfig={this.initDefaultConfig}
        onClose={this.handleCancelModal}
        onConfigSaved={this.handleParametersChange}
      />
    );
  };

  renderModal = (): JSX.Element => {
    const { modal } = this.state;
    switch (modal) {
      case 'more':
        return this.renderMoreModal();
      default:
        return null;
    }
  };

  getDefaultLaserOptions = (): string => {
    const {
      configName, hasMultiSpeed, hasMultiPower, hasMultiRepeat,
      hasMultiZStep, hasMultiDiode, hasMultiConfigName,
    } = this.state;
    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[] || [];
    if (hasMultiSpeed
      || hasMultiPower
      || hasMultiRepeat
      || hasMultiZStep
      || hasMultiDiode
      || hasMultiConfigName) {
      // multi select
      return LANG.various_preset;
    }
    if (configName === CUSTOM_PRESET_CONSTANT
      || customizedConfigs.findIndex((config) => config.name === configName) < 0) {
      return LANG.custom_preset;
    }
    if (configName) {
      return configName;
    }
    return PARAMETERS_CONSTANT;
  };

  updateDiodeBoundary(): void {
    const { isDiode } = this.state;
    if (
      BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
    ) {
      DiodeBoundaryDrawer.show(isDiode);
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
              if (!newName) {
                return;
              }
              this.handleSaveConfig(newName);
            },
            onCancel: () => {
              this.handleCancelModal();
            },
          });
        }}
      >
        <img src="img/icon-plus.svg" />
      </div>
    );
  }

  renderAddOnBlock = (): JSX.Element => {
    const { repeat, height, hasMultiHeight, zStep, hasMultiZStep, isDiode } = this.state;

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
              hasMultiHeight={hasMultiHeight}
              repeat={repeat}
              zStep={zStep}
              hasMultiZStep={hasMultiZStep}
              onToggle={this.toggleEnableHeight}
              onHeightChange={this.handleHeightChange}
              onZStepChange={this.handleZStepChange}
            />
          )}
          <Diode value={isDiode} onToggle={this.toggleDiode} />
        </div>
      </div>
    );
  };

  render(): JSX.Element {
    const { selectedLayers } = this.props;
    const { power, hasMultiPower, speed, hasMultiSpeed, repeat, hasMultiRepeat, type } = this.state;
    let displayName = '';
    if (selectedLayers.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      displayName = selectedLayers[0];
    } else {
      displayName = LANG.multi_layer;
    }

    const modalDialog = this.renderModal();

    const customizedConfigs = storage.get('customizedLaserConfigs') as ILaserConfig[];
    let dropdownOptions: { value: string, key: string, label: string }[];
    if (customizedConfigs || customizedConfigs.length > 0) {
      const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
      dropdownOptions = customizedConfigs.filter((p) => !(p.isDefault && !parametersSet[p.key]))
        .map((e) => ({
          value: e.name,
          key: e.name,
          label: e.name,
        }));
    } else {
      dropdownOptions = defaultLaserOptions.map((item) => ({
        value: item,
        key: item,
        label: (LANG.dropdown[this.unit][item] ? LANG.dropdown[this.unit][item] : item),
      }));
    }

    return (
      <div id="laser-panel">
        <div className="layername">
          {sprintf(LANG.preset_setting, displayName)}
        </div>
        <div className="layerparams">
          <ConfigOperations onMoreClick={() => this.setState({ modal: 'more' })} />
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
          <LayerType value={type} onChange={this.handleLayerTypeChange} />
          <PowerBlock power={power} hasMultipleValue={hasMultiPower} onChange={this.handleStrengthChange} />
          <SpeedBlock
            layerNames={selectedLayers}
            speed={speed}
            hasMultipleValue={hasMultiSpeed}
            onChange={this.handleSpeedChange}
          />
          <RepeatBlock val={repeat} hasMultipleValue={hasMultiRepeat} onChange={this.handleRepeatChange} />
          {modalDialog}
        </div>
        {this.renderAddOnBlock()}
      </div>
    );
  }
}

export default LaserPanel;
