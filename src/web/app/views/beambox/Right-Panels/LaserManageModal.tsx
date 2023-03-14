import * as React from 'react';
import classNames from 'classnames';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Dialog from 'app/actions/dialog-caller';
import i18n from 'helpers/i18n';
import isObjectEmpty from 'helpers/is-object-empty';
import {
  Button, Col, Modal, Row, Space,
} from 'antd';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getParametersSet } from 'app/constants/right-panel-constants';
import { ILaserConfig, ILaserData, ILaserDataChanges } from 'interfaces/ILaserConfig';
import {
  DeleteFilled, LeftOutlined, PlusCircleFilled, RightOutlined,
} from '@ant-design/icons';

const LANG = i18n.lang.beambox.right_panel.laser_panel;

interface Props {
  selectedItem: string;
  initDefaultConfig: () => void;
  onClose: () => void;
  onConfigSaved: () => void;
}

interface State {
  isSelectingCustomized: boolean;
  selectedItem: string;
  displaySpeed: number;
  displayPower: number;
  displayRepeat: number;
  displayZStep: number;
}

class LaserManageModal extends React.Component<Props, State> {
  private editingConfigs: ILaserConfig[];

  private editingDefaultLaserConfigsInUse: { [key: string]: boolean };

  private unit: string;

  private unsavedChanges: { [key: string]: ILaserDataChanges };

  private draggingConfig: ILaserConfig;

  private draggingIndex: number;

  private defaultLaserOptions: string[];

  private parametersSet: { [key: string]: { [name: string]: number } };

  constructor(props: Props) {
    super(props);
    this.editingConfigs = storage.get('customizedLaserConfigs') || [];
    this.editingDefaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse');
    this.unit = storage.get('default-units') || 'mm';
    const parametersSet = getParametersSet(BeamboxPreference.read('workarea') || BeamboxPreference.read('model'));
    this.parametersSet = parametersSet;
    this.defaultLaserOptions = Object.keys(parametersSet);
    const selectedConfig = this.editingConfigs.find(
      (e) => e.name === props.selectedItem,
    );
    this.unsavedChanges = {};
    this.state = {
      isSelectingCustomized: true,
      selectedItem: props.selectedItem,
      displaySpeed: selectedConfig ? selectedConfig.speed : 0,
      displayPower: selectedConfig ? selectedConfig.power : 0,
      displayRepeat: selectedConfig ? (selectedConfig.repeat || 1) : 1,
      displayZStep: selectedConfig ? (selectedConfig.zStep || 0) : 0,
    };
  }

  getDefaultParameters = (name: string): ILaserData => {
    if (!this.parametersSet[name]) {
      // eslint-disable-next-line no-console
      console.error(`Unable to get default preset key: ${name}`);
      return { speed: 20, power: 15, repeat: 1 };
    }
    const { speed, power } = this.parametersSet[name];
    const repeat = this.parametersSet[name].repeat || 1;
    const zStep = this.parametersSet[name].zStep || 0;
    return {
      speed, power, repeat, zStep,
    };
  };

  handleCustomizedConfigClick = (name: string): void => {
    const selectedConfig = this.editingConfigs.find((e) => e.name === name);
    const editingValue = { ...selectedConfig, ...this.unsavedChanges[name] };
    this.setState({
      isSelectingCustomized: true,
      selectedItem: name,
      displaySpeed: editingValue.speed,
      displayPower: editingValue.power,
      displayRepeat: editingValue.repeat || 1,
      displayZStep: editingValue.zStep || 0,
    });
  };

  handleDefaultConfigClick = (name: string): void => {
    const {
      speed, power, repeat, zStep,
    } = this.getDefaultParameters(name);
    this.setState({
      isSelectingCustomized: false,
      selectedItem: name,
      displaySpeed: speed,
      displayPower: power,
      displayRepeat: repeat || 1,
      displayZStep: zStep || 0,
    });
  };

  addSelectDefaultsToCustom = (): void => {
    const { isSelectingCustomized, selectedItem } = this.state;
    if (!isSelectingCustomized && selectedItem !== '') {
      if (this.editingDefaultLaserConfigsInUse[selectedItem]) {
        this.setState({
          selectedItem: LANG.dropdown[this.unit][selectedItem],
          isSelectingCustomized: true,
        });
        return;
      }
      const {
        speed, power, repeat, zStep,
      } = this.getDefaultParameters(selectedItem);
      this.editingDefaultLaserConfigsInUse[selectedItem] = true;
      this.editingConfigs.push({
        name: LANG.dropdown[this.unit][selectedItem],
        speed,
        power,
        repeat,
        zStep,
        isDefault: true,
        key: selectedItem,
      });
      this.setState({
        selectedItem: LANG.dropdown[this.unit][selectedItem],
        isSelectingCustomized: true,
      }, () => $('#custom-config-list').scrollTop(this.editingConfigs.length * 20));
    }
  };

  removeDefaultfromCustom = (): void => {
    const { selectedItem, isSelectingCustomized } = this.state;
    if (selectedItem !== '') {
      let index;
      if (isSelectingCustomized) {
        index = this.editingConfigs.findIndex(
          (config) => config.name === selectedItem,
        );
      } else {
        index = this.editingConfigs.findIndex(
          (config) => config.name === LANG.dropdown[this.unit][selectedItem],
        );
      }
      if (index > -1 && this.editingConfigs[index].isDefault) {
        const { key } = this.editingConfigs[index];
        this.editingDefaultLaserConfigsInUse[key] = false;
        this.editingConfigs.splice(index, 1);
        if (this.editingConfigs.length > 0) {
          const i = Math.min(index, this.editingConfigs.length - 1);
          const nextCustomizedConfig = this.editingConfigs[i];
          this.setState({
            selectedItem: nextCustomizedConfig ? nextCustomizedConfig.name : '',
            displayPower: nextCustomizedConfig ? nextCustomizedConfig.power : 0,
            displaySpeed: nextCustomizedConfig ? nextCustomizedConfig.speed : 0,
            displayRepeat: nextCustomizedConfig ? nextCustomizedConfig.repeat : 1,
            displayZStep: nextCustomizedConfig ? nextCustomizedConfig.zStep : 0,
          });
        } else {
          const i = this.defaultLaserOptions.findIndex((e) => e === key);
          this.setState({ isSelectingCustomized: false, selectedItem: key },
            () => $('#default-config-list').scrollTop((i) * 20));
        }
      }
    }
  };

  onConfigDragStart = (config: ILaserConfig, index: number): void => {
    this.draggingConfig = config;
    this.draggingIndex = index;
    const selectedConfig = this.editingConfigs[index];
    const { name } = config;
    this.setState({
      isSelectingCustomized: true,
      selectedItem: name,
      displaySpeed: selectedConfig.speed,
      displayPower: selectedConfig.power,
      displayRepeat: selectedConfig.repeat || 1,
      displayZStep: selectedConfig.zStep || 0,
    });
  };

  onConfigDragOver = (config: ILaserConfig, index: number): void => {
    if (this.draggingConfig) {
      if (config.name !== this.draggingConfig.name) {
        const temp = this.editingConfigs[index];
        this.editingConfigs[index] = this.editingConfigs[this.draggingIndex];
        this.editingConfigs[this.draggingIndex] = temp;
        this.draggingIndex = index;
        this.forceUpdate();
      }
    }
  };

  onConfigDragEnd = (): void => {
    this.draggingConfig = null;
  };

  renderCustomizedConfigs = (): JSX.Element[] => {
    const { isSelectingCustomized, selectedItem } = this.state;
    const customizedConfigs = this.editingConfigs.map((config, index) => {
      const hasUnsavedChanges = !!this.unsavedChanges[config.name];
      const entryClass = classNames({
        selected: (isSelectingCustomized && selectedItem === config.name),
        'config-entry': true,
        'no-border': this.editingConfigs.length >= 8 && index === this.editingConfigs.length - 1,
      });
      return (
        <div
          id={config.key}
          draggable
          className={entryClass}
          key={config.name}
          onClick={() => this.handleCustomizedConfigClick(config.name)}
          onDragStart={() => this.onConfigDragStart(config, index)}
          onDragOver={() => this.onConfigDragOver(config, index)}
          onDragEnd={this.onConfigDragEnd}
        >
          <div className="entry-name">{`${config.name + (hasUnsavedChanges ? ' *' : '')}`}</div>
          <span className="sub-text">{config.isDefault ? LANG.default : ''}</span>
        </div>
      );
    });
    return customizedConfigs;
  };

  renderDefaultConfigs = (): JSX.Element[] => {
    const { isSelectingCustomized, selectedItem } = this.state;
    const defaultConfigs = this.defaultLaserOptions.map((configName, index) => {
      const inUse = this.editingDefaultLaserConfigsInUse[configName];
      const itemClass = classNames({
        selected: (!isSelectingCustomized && selectedItem === configName),
        'config-entry': true,
        'no-border': this.defaultLaserOptions.length >= 8 && index === this.defaultLaserOptions.length - 1,
      });
      return (
        <div
          className={itemClass}
          key={configName}
          onClick={() => this.handleDefaultConfigClick(configName)}
        >
          <div className="entry-name">{LANG.dropdown[this.unit][configName]}</div>
          <span className="sub-text">{inUse ? LANG.inuse : ''}</span>
        </div>
      );
    });
    return defaultConfigs;
  };

  addConfig = (): void => {
    Dialog.promptDialog({
      caption: LANG.new_config_name,
      defaultValue: '',
      onYes: (newName) => {
        if (!newName) {
          return;
        }
        const isPresetNameUsed = this.editingConfigs.some(
          (preset) => preset.name === newName,
        );
        if (isPresetNameUsed) {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: LANG.existing_name,
          });
        } else {
          this.editingConfigs.push({
            name: newName,
            speed: 20,
            power: 15,
            repeat: 1,
            zStep: 0,
          });
          this.setState({
            isSelectingCustomized: true,
            selectedItem: newName,
            displaySpeed: 20,
            displayPower: 15,
            displayRepeat: 1,
            displayZStep: 0,
          }, () => $('#custom-config-list').scrollTop(this.editingConfigs.length * 20));
        }
      },
    });
  };

  handleUnsavedChange = (configName: string, key: string, newValue: number): void => {
    const selectedConfig = this.editingConfigs.find((e) => e.name === configName);
    if (selectedConfig[key] !== newValue) {
      if (!this.unsavedChanges[configName]) {
        const unsavedChange = {};
        unsavedChange[key] = newValue;
        this.unsavedChanges[configName] = unsavedChange;
      } else {
        this.unsavedChanges[configName][key] = newValue;
      }
    } else {
      if (this.unsavedChanges[configName]) {
        delete this.unsavedChanges[configName][key];
      }
      if (isObjectEmpty(this.unsavedChanges[configName])) {
        delete this.unsavedChanges[configName];
      }
    }

    if (key === 'power') {
      this.setState({ displayPower: newValue });
    } else if (key === 'repeat') {
      this.setState({ displayRepeat: newValue });
    } else if (key === 'speed') {
      this.setState({ displaySpeed: newValue });
    } else if (key === 'zStep') {
      this.setState({ displayZStep: newValue });
    }
  };

  handleReset = (): void => {
    const { initDefaultConfig } = this.props;
    Alert.popUp({
      buttonType: AlertConstants.YES_NO,
      message: LANG.sure_to_reset,
      onYes: () => {
        storage.removeAt('defaultLaserConfigsInUse');
        initDefaultConfig();
        this.editingConfigs = storage.get('customizedLaserConfigs') || [];
        this.editingDefaultLaserConfigsInUse = storage.get('defaultLaserConfigsInUse');
        this.forceUpdate();
      },
    });
  };

  handleDelete = (): void => {
    const { selectedItem } = this.state;
    const index = this.editingConfigs.findIndex(
      (e) => e.name === selectedItem,
    );
    if (index > -1) {
      if (this.editingConfigs[index].isDefault) {
        this.removeDefaultfromCustom();
        return;
      }
      this.editingConfigs.splice(index, 1);
      if (this.editingConfigs.length > 0) {
        const i = Math.min(index, this.editingConfigs.length - 1);
        const nextCustomizedConfig = this.editingConfigs[i];
        this.setState({
          selectedItem: nextCustomizedConfig ? nextCustomizedConfig.name : '',
          displayPower: nextCustomizedConfig ? nextCustomizedConfig.power : 0,
          displaySpeed: nextCustomizedConfig ? nextCustomizedConfig.speed : 0,
          displayRepeat: nextCustomizedConfig ? nextCustomizedConfig.repeat : 1,
          displayZStep: nextCustomizedConfig ? nextCustomizedConfig.zStep : 0,
        });
      } else {
        const firstDefaultConfig = this.defaultLaserOptions[0];
        this.handleDefaultConfigClick(firstDefaultConfig);
      }
    }
  };

  handleSaveAndExit = (): void => {
    const { onClose, onConfigSaved } = this.props;
    for (let i = 0; i < this.editingConfigs.length; i += 1) {
      let config = this.editingConfigs[i];
      if (this.unsavedChanges[config.name]) {
        config = { ...config, ...this.unsavedChanges[config.name] };
        this.editingConfigs[i] = config;
      }
    }
    this.unsavedChanges = {};
    storage.set('customizedLaserConfigs', this.editingConfigs);
    storage.set('defaultLaserConfigsInUse', this.editingDefaultLaserConfigsInUse);
    onConfigSaved();
    onClose();
  };

  renderFooter(): JSX.Element {
    const { onClose } = this.props;
    return (
      <Row justify="space-between">
        <Col span={12}>
          <Space align="start" style={{ width: '100%' }}>
            <Button
              key="laser_delete"
              type="primary"
              danger
              onClick={this.handleDelete}
            >
              <DeleteFilled />
              {LANG.delete}
            </Button>
            <Button
              key="laser_reset"
              type="dashed"
              danger
              onClick={this.handleReset}
            >
              {LANG.reset}
            </Button>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <Button
              key="laser_save_and_exit"
              type="primary"
              onClick={this.handleSaveAndExit}
            >
              {LANG.save_and_exit}
            </Button>
            <Button
              key="laser_cancel"
              onClick={onClose}
            >
              {LANG.cancel}
            </Button>
          </Space>
        </Col>
      </Row>
    );
  }

  render(): JSX.Element {
    const {
      isSelectingCustomized, selectedItem, displaySpeed, displayPower, displayRepeat, displayZStep,
    } = this.state;
    const { onClose } = this.props;
    const selectedConfig = this.editingConfigs.find((e) => e.name === selectedItem);
    const disableControl = Boolean(!isSelectingCustomized)
    || Boolean(!selectedConfig)
    || Boolean(selectedConfig.isDefault);
    const defaultConfigs = this.renderDefaultConfigs();
    const customizedConfigs = this.renderCustomizedConfigs();

    const speedUnit = { mm: 'mm/s', inches: 'in/s' }[this.unit];
    const unitSpeedDecimal = { mm: 1, inches: 3 }[this.unit];
    const zStepUnit = { mm: 'mm', inches: 'in' }[this.unit];
    const unitZStepDcimal = { mm: 2, inches: 4 }[this.unit];
    const unitZStepStep = { mm: 0.5, inches: 0.01 }[this.unit];

    const model = BeamboxPreference.read('workarea') || BeamboxPreference.read('model');
    const speedLimit = model === 'fhexa1' ? 900 : 300;

    return (
      <Modal
        open
        centered
        footer={this.renderFooter()}
        title={LANG.more}
        onCancel={onClose}
      >
        <div className="more-config-panel">
          <Row>
            <Col span={11}>
              <div style={{ lineHeight: '32px' }}>
                <strong>{LANG.default}</strong>
              </div>
              <div id="default-config-list" className="config-list">
                {defaultConfigs}
              </div>
            </Col>
            <Col span={2}>
              <Space align="center" style={{ width: '100%', height: '100%' }}>
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <Button size="small" onClick={this.addSelectDefaultsToCustom}><RightOutlined /></Button>
                  <Button size="small" onClick={this.removeDefaultfromCustom}><LeftOutlined /></Button>
                </div>
              </Space>
            </Col>
            <Col span={11}>
              <strong>
                {LANG.customized}
                <Button type="text" onClick={() => this.addConfig()}><PlusCircleFilled /></Button>
              </strong>
              <div id="custom-config-list" className="config-list">
                {customizedConfigs}
              </div>
            </Col>
          </Row>
          <div>
            <br />
            <strong>
              {isSelectingCustomized ? selectedItem : LANG.dropdown[this.unit][selectedItem]}
            </strong>
          </div>
          <div className={classNames('controls', { disable: disableControl })}>
            <div className="controls-column">
              <div className="control">
                <span className="label">{LANG.power.text}</span>
                <UnitInput
                  id="laser_power"
                  min={1}
                  max={100}
                  disabled={disableControl}
                  unit="%"
                  getValue={(val) => this.handleUnsavedChange(selectedItem, 'power', val)}
                  defaultValue={displayPower}
                  decimal={1}
                  step={1}
                />
              </div>
              <div className="control">
                <span className="label">{LANG.laser_speed.text}</span>
                <UnitInput
                  id="laser_speed"
                  min={3}
                  max={speedLimit}
                  disabled={disableControl}
                  unit={speedUnit}
                  getValue={(val) => this.handleUnsavedChange(selectedItem, 'speed', val)}
                  defaultValue={displaySpeed}
                  decimal={unitSpeedDecimal}
                  step={1}
                />
              </div>
            </div>
            <div className="controls-column">
              <div className="control">
                <span className="label">{LANG.repeat}</span>
                <UnitInput
                  id="laser_repeat"
                  min={1}
                  max={100}
                  disabled={disableControl}
                  unit={LANG.times}
                  getValue={(val) => this.handleUnsavedChange(selectedItem, 'repeat', val)}
                  defaultValue={displayRepeat}
                  decimal={0}
                  step={1}
                />
              </div>
              <div className="control">
                <span className="label">{LANG.z_step}</span>
                <UnitInput
                  id="laser_zStep"
                  min={0}
                  max={20}
                  disabled={disableControl}
                  unit={zStepUnit}
                  getValue={(val) => this.handleUnsavedChange(selectedItem, 'zStep', val)}
                  defaultValue={displayZStep}
                  decimal={unitZStepDcimal}
                  step={unitZStepStep}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default LaserManageModal;
