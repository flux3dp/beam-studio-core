import i18n from 'helpers/i18n';
import * as React from 'react';
import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import Modal from 'app/widgets/Modal';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import ValidationTextInput from 'app/widgets/Validation-Text-Input';

const LANG = i18n.lang.beambox.layer_color_config_panel;
let defaultSettings = [
    {color: '#FF0000', power: 15, speed: 50, repeat: 1},
    {color: '#FFFF00', power: 15, speed: 50, repeat: 1},
    {color: '#00FF00', power: 15, speed: 50, repeat: 1},
    {color: '#00FFFF', power: 15, speed: 50, repeat: 1},
    {color: '#0000FF', power: 15, speed: 50, repeat: 1},
    {color: '#FF00FF', power: 15, speed: 50, repeat: 1},
    {color: '#800000', power: 15, speed: 50, repeat: 1},
    {color: '#808000', power: 15, speed: 50, repeat: 1},
    {color: '#008000', power: 15, speed: 50, repeat: 1},
    {color: '#008080', power: 15, speed: 50, repeat: 1},
    {color: '#000080', power: 15, speed: 50, repeat: 1},
    {color: '#800080', power: 15, speed: 50, repeat: 1},
    {color: '#CCCCCC', power: 15, speed: 50, repeat: 1},
    {color: '#808080', power: 15, speed: 50, repeat: 1},
    {color: '#000000', power: 15, speed: 50, repeat: 1}
];

interface Props {
  onClose: () => void;
}

interface State {
  newColor?: string;
  isDisplayingModal: boolean;
}

class LayerColorConfigPanel extends React.Component<Props, State> {
  private layerColorConfig: any;

  private layerColorConfigDict: any;

  private newPower: number;

  private newSpeed: number;

  private newRepeat: number;

    constructor(props) {
        super(props);
        // TODO: make config interface
        let layerColorConfig = storage.get('layer-color-config') as unknown as {
            array: any,
            dict: any
        };
        if (layerColorConfig) {
            this.layerColorConfig = layerColorConfig.array;
            this.layerColorConfigDict = layerColorConfig.dict;
        } else {
            this.layerColorConfig = [...defaultSettings];
            let i = 0;
            this.layerColorConfigDict = this.layerColorConfig.reduce((acc, cur) => ({...acc, [cur.color]: i++}), {});
        }
        this.state = {
            isDisplayingModal: false
        }
    }

    _close() {
        this.props.onClose();
    }

    _renderMainContent() {
        let configItems = [];

        for (let i = 0; i < this.layerColorConfig.length; i++) {
            configItems.push(this._renderLayerColorConfigItem(this.layerColorConfig[i], i));
        }

        return (
            <div className='main-content'>
                {configItems}
                {this._renderAddConfigButton()}
            </div>
        );
    }

    _renderLayerColorConfigItem(item, index) {
        return (
            <div className='config-item' key={index}>
                <div className='color-block' style={{backgroundColor: item.color}}>
                </div>
                <div className='color-hex'>
                    <ValidationTextInput
                        defaultValue={item.color}
                        validation={(val) => this.validateColorInput(val, index)}
                        getValue={(val) => {this._handleColorInputValue(val, index)}}
                    />
                </div>
                <div className='text'>
                    {LANG.power}
                </div>
                <UnitInput
                    className={{power: true}}
                    min={1}
                    max={100}
                    unit="%"
                    defaultValue={item.power}
                    getValue={(val) => {this._handleInputValue(val, 'power', index)}}
                    decimal={1}
                />
                <div className='text'>
                    {LANG.speed}
                </div>
                <UnitInput
                    className={{speed: true}}
                    min={3}
                    max={300}
                    unit="mm/s"
                    defaultValue={item.speed}
                    getValue={(val) => {this._handleInputValue(val, 'speed', index)}}
                    decimal={1}
                />
                <div className='text'>
                    {LANG.repeat}
                </div>
                <UnitInput
                    className={{repeat: true}}
                    min={1}
                    max={10}
                    unit=""
                    defaultValue={item.repeat}
                    getValue={(val) => {this._handleInputValue(val, 'repeat', index)}}
                    decimal={0}
                />
                <div className='text remove' onClick={(e) => {this._handleRemoveConfig(index)}}>
                    <i className='fa fa-trash-o'/>
                </div>
            </div>
        );
    }

    _renderAddConfigButton() {
        return (
            <div className='config-item'>
                <div className='add-config' onClick={this._displayAddConfigPanel.bind(this)}>
                    <span className='plus'>
                        {'+'}
                    </span>
                    <span>
                        {LANG.add_config}
                    </span>
                </div>
            </div>
        )
    }

    validateColorInput(val, index) {
        val = val.replace(/ +/,'');
        let res;
        let matchHex6 = val.match(/(?<!.)#[0-9A-F]{6}\b/i);
        if (matchHex6) {
            res = matchHex6[0].toUpperCase();
        }

        if (!res) {
            let matchHex3 = val.match(/(?<!.)#[0-9A-F]{3}\b/i);
            if (matchHex3) {
                res = matchHex3[0].replace(/#([0-9A-F])([0-9A-F])([0-9A-F])/i, '#$1$1$2$2$3$3').toUpperCase();
            }
        }
        if (!res) {
            let matchRGB = val.match(/(?<!.)(rgb)?\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)(?!.)/i);
            if (matchRGB) {
                matchRGB = matchRGB[0].match(/[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}/)[0].split(',');
                let hex = (parseInt(matchRGB[0]) * 65536 + parseInt(matchRGB[1]) * 256 + parseInt(matchRGB[2])).toString(16);
                if (hex === 'NaN') {
                    hex = '0';
                }
                while (hex.length < 6) {
                    hex = '0' + hex;
                }
                res = `#${hex}`.toUpperCase();
            }
        }
        if (res && this.layerColorConfigDict[res] === undefined) {
            return res;
        } else if (res && this.layerColorConfigDict[res] !== index) {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: LANG.in_use
            });
        }

        return false;
    }

    _handleColorInputValue(val, index) {
        if (this.layerColorConfigDict[val] === undefined) {
            this.layerColorConfigDict[val] = index;
            delete this.layerColorConfigDict[this.layerColorConfig[index].color];
            this.layerColorConfig[index].color = val;
            this.setState(this.state);
        } else if (this.layerColorConfigDict[val] !== index) {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: LANG.in_use
            });
            this.setState(this.state);
        }
    }

    _handleInputValue(val, key, index) {
        this.layerColorConfig[index][key] = val;
    }

    _handleRemoveConfig(index) {
        Alert.popUp({
            buttonType: AlertConstants.YES_NO,
            message: LANG.sure_to_delete,
            onYes: () => {
                delete this.layerColorConfigDict[this.layerColorConfig[index].color];
                this.layerColorConfig.splice(index, 1);
                for (let i = index; i < this.layerColorConfig.length; i++) {
                    this.layerColorConfigDict[this.layerColorConfig[i].color] -= 1;
                }
                this.setState(this.state);
            }
        });
    }

    _displayAddConfigPanel() {
        this.newPower = 15;
        this.newSpeed = 50;
        this.newRepeat = 1;
        this.setState({
            newColor: '',
            isDisplayingModal: true
        });
    }

    _renderFooter() {
        return (
            <div className="footer">
                {this._renderButton('pull-left', () => this._onResetDefault(), LANG.default)}
                {this._renderButton('pull-right', () => this._onCancel(), LANG.cancel)}
                {this._renderButton('pull-right primary', () => this._onSave(), LANG.save)}
            </div>
        );
    }

    _onResetDefault() {
        Alert.popUp({
            buttonType: AlertConstants.YES_NO,
            message: LANG.sure_to_reset,
            onYes: () => {
                this.layerColorConfig = [...defaultSettings];
                let i = 0;
                this.layerColorConfigDict = this.layerColorConfig.reduce((acc, cur) => ({...acc, [cur.color]: i++}), {});
                this.setState(this.state);
            }
        });
    }

    _onSave() {
        storage.set('layer-color-config', {array: this.layerColorConfig, dict: this.layerColorConfigDict});
        this._close();
    }

    _onCancel() {
        this._close();
    }

    _renderButton(className: string, onClick: React.MouseEventHandler, label: string, disabled?: boolean) {
        className = `btn btn-default ${className}`;
        if (disabled) {
            className += ' disabled';
        }
        return (
            <button
                className={className}
                onClick={onClick}
                disabled={disabled}
            >{label}
            </button>
        )
    }

    _renderAddConfigModal() {
        if (this.state.isDisplayingModal){
            return (
                <Modal onClose={() => {}}>
                    <div className='add-config-panel'>
                        <div className='title'>
                            {LANG.add_config}
                        </div>
                        <div className='input-column'>
                            <div className='color-block' style={{backgroundColor: this.state.newColor}}>
                            </div>
                            <div className='name color'>
                                {`${LANG.color} :`}
                            </div>
                            <ValidationTextInput
                                defaultValue={this.state.newColor}
                                validation={(val) => this.validateColorInput(val, -1)}
                                getValue={(val) => {this.setState({newColor: val})}}
                            />
                        </div>
                        <div className='input-column'>
                            <div className='name'>
                                {`${LANG.power} :`}
                            </div>
                            <UnitInput
                                className={{power: true}}
                                min={1}
                                max={100}
                                unit="%"
                                defaultValue={this.newPower}
                                getValue={(val) => {this.newPower = val}}
                                decimal={1}
                            />
                        </div>
                        <div className='input-column'>
                            <div className='name'>
                                {`${LANG.speed} :`}
                            </div>
                            <UnitInput
                                className={{speed: true}}
                                min={3}
                                max={300}
                                unit="mm/s"
                                defaultValue={this.newSpeed}
                                getValue={(val) => {this.newSpeed = val}}
                                decimal={1}
                            />
                        </div>
                        <div className='input-column'>
                            <div className='name'>
                                {`${LANG.repeat} :`}
                            </div>
                            <UnitInput
                                className={{repeat: true}}
                                min={1}
                                max={10}
                                unit=""
                                defaultValue={this.newRepeat}
                                getValue={(val) => {this.newRepeat = val}}
                                decimal={0}
                            />
                        </div>
                        <div className='footer'>
                            {this._renderButton('pull-right', () => {this._handleAddConfig()}, LANG.add)}
                            {this._renderButton('pull-right', () => {this.setState({isDisplayingModal: false})}, LANG.cancel)}
                        </div>
                    </div>
                </Modal>
            )
        } else {
            return null;
        }
    }

    _handleAddConfig() {
        if (!this.state.newColor) {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: LANG.no_input,
            });
        } else if (this.layerColorConfigDict[this.state.newColor] !== undefined) {
            Alert.popUp({
                type: AlertConstants.SHOW_POPUP_ERROR,
                message: LANG.in_use,
            });
        } else {
            this.layerColorConfig.push({
                color: this.state.newColor,
                power: this.newPower,
                speed: this.newSpeed,
                repeat: this.newRepeat});
            this.layerColorConfigDict[this.state.newColor] = this.layerColorConfig.length - 1;
            this.setState({isDisplayingModal: false});
        }
    }

    render() {
        return (
            <Modal onClose={() => {}}>
                <div className='layer-color-config-panel'>
                    <div className='title'>
                        {LANG.layer_color_config}
                    </div>
                    {this._renderMainContent()}
                    {this._renderFooter()}
                    {this._renderAddConfigModal()}
                </div>
            </Modal>
        );
    }
};

export default LayerColorConfigPanel;

