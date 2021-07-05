import * as React from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import Constant from 'app/actions/beambox/constant';
import DropDownControl from 'app/widgets/Dropdown-Control';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import SwitchControl from 'app/widgets/Switch-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.document_panel;

const workareaOptions = [
    {label: 'beamo', value: 'fbm1'},
    {label: 'Beambox', value: 'fbb1b'},
    {label: 'Beambox Pro', value: 'fbb1p'},
]

if (window['FLUX'].dev) {
    workareaOptions.push({ label: 'Beambox2', value: 'fbb2b' });
}

interface Props {
  unmount: () => void;
}

interface State {
  engraveDpi: string;
  workarea: string;
  rotaryMode: boolean;
  borderlessMode: boolean;
  enableDiode: boolean;
  enableAutofocus: boolean;
}

export default class DocumentPanel extends React.PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            engraveDpi: BeamboxPreference.read('engrave_dpi'),
            workarea: BeamboxPreference.read('workarea') || 'fbb1b',
            rotaryMode: BeamboxPreference.read('rotary_mode'),
            borderlessMode: BeamboxPreference.read('borderless') === true,
            enableDiode: BeamboxPreference.read('enable-diode') === true,
            enableAutofocus: BeamboxPreference.read('enable-autofocus') === true,
        };
    }

    _handleEngraveDpiChange(value) {
        this.setState({
            engraveDpi: value
        });
    }

    _handleWorkareaChange(value) {
        this.setState({
            workarea: value
        });
    }

    _handleRotaryModeChange(value) {
        this.setState({
            rotaryMode: value
        });
        svgCanvas.setRotaryMode(value);
        svgCanvas.runExtensions('updateRotaryAxis');
    }

    _handleBorderlessModeChange(value) {
        this.setState({
            borderlessMode: value
        });
    }

    _handleDiodeModuleChange(value) {
        this.setState({
            enableDiode: value
        });
    }

    _handleAutofocusModuleChange(value) {
        this.setState({
            enableAutofocus: value
        });
    }

    save() {
        BeamboxPreference.write('engrave_dpi', this.state.engraveDpi);
        BeamboxPreference.write('rotary_mode', this.state.rotaryMode);
        BeamboxPreference.write('borderless', this.state.borderlessMode);
        BeamboxPreference.write('enable-diode', this.state.enableDiode);
        BeamboxPreference.write('enable-autofocus', this.state.enableAutofocus);
        if (this.state.workarea !== BeamboxPreference.read('workarea')) {
            BeamboxPreference.write('workarea', this.state.workarea);
            svgCanvas.setResolution(Constant.dimension.getWidth(BeamboxPreference.read('workarea')), Constant.dimension.getHeight(BeamboxPreference.read('workarea')));
            svgEditor.resetView();
            PreviewModeBackgroundDrawer.updateCanvasSize();
        }
        OpenBottomBoundaryDrawer.update();
        beamboxStore.emitUpdateLaserPanel();
    }

    render() {
        const doesSupportOpenBottom = Constant.addonsSupportList.openBottom.includes(this.state.workarea);
        const doesSupportHybrid = Constant.addonsSupportList.hybridLaser.includes(this.state.workarea);
        const doesSupportAutofocus = Constant.addonsSupportList.autoFocus.includes(this.state.workarea);
        return (
            <Modal onClose={() => this.props.unmount()}>
                <div className='document-panel'>
                    <section className='main-content'>
                        <div className='title'>{LANG.document_settings}</div>
                        <EngraveDpiSlider
                            value={this.state.engraveDpi}
                            onChange={val => this._handleEngraveDpiChange(val)}
                        />
                        <DropDownControl
                            id="workarea_dropdown"
                            label={LANG.workarea}
                            options={workareaOptions}
                            value={this.state.workarea}
                            onChange={(val) => this._handleWorkareaChange(val)} />
                        <div className='sub-title'>{LANG.add_on}</div>
                        <SwitchControl
                            id="rotary_mode"
                            name="rotary_mode"
                            onText={LANG.enable}
                            offText={LANG.disable}
                            label={LANG.rotary_mode}
                            default={this.state.rotaryMode}
                            onChange={(val) => this._handleRotaryModeChange(val)} />
                        <SwitchControl
                            id="borderless_mode"
                            name="borderless_mode"
                            onText={LANG.enable}
                            offText={LANG.disable}
                            label={LANG.borderless_mode}
                            default={doesSupportOpenBottom && this.state.borderlessMode}
                            isDisabled={!doesSupportOpenBottom}
                            onChange={(val) => this._handleBorderlessModeChange(val)} />
                        <SwitchControl
                            id="autofocus-module"
                            name="autofocus-module"
                            onText={LANG.enable}
                            offText={LANG.disable}
                            label={LANG.enable_autofocus}
                            default={doesSupportAutofocus && this.state.enableAutofocus}
                            isDisabled={!doesSupportAutofocus}
                            onChange={(val) => this._handleAutofocusModuleChange(val)}
                        />
                        <SwitchControl
                            id="diode_module"
                            name="diode_module"
                            onText={LANG.enable}
                            offText={LANG.disable}
                            label={LANG.enable_diode}
                            default={doesSupportHybrid && this.state.enableDiode}
                            isDisabled={!doesSupportHybrid}
                            onChange={(val) => this._handleDiodeModuleChange(val)}
                        />
                    </section>
                    <section className='footer'>
                        <button
                            className='btn btn-default pull-right'
                            onClick={() => this.props.unmount()}
                        >{LANG.cancel}
                        </button>
                        <button
                            className='btn btn-default primary pull-right'
                            onClick={() => {
                                this.save();
                                this.props.unmount();
                            }}
                        >{LANG.save}
                        </button>
                    </section>
                </div>
            </Modal>
        );
    }
};
