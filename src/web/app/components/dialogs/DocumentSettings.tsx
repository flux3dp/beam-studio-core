import * as React from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import DropDownControl from 'app/widgets/Dropdown-Control';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import SwitchControl from 'app/widgets/Switch-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.document_panel;
const eventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

const workareaOptions = [
  { label: 'beamo', value: 'fbm1' },
  { label: 'Beambox', value: 'fbb1b' },
  { label: 'Beambox Pro', value: 'fbb1p' },
  { label: 'Ultra 60', value: 'fbb2b' },
];

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

export default class DocumentSettings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
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

  private handleEngraveDpiChange = (value) => {
    this.setState({
      engraveDpi: value,
    });
  };

  private handleWorkareaChange = (value) => {
    this.setState({
      workarea: value,
    });
  };

  private handleRotaryModeChange = (value) => {
    this.setState({
      rotaryMode: value,
    });
    svgCanvas.setRotaryMode(value);
    svgCanvas.runExtensions('updateRotaryAxis');
  };

  private handleBorderlessModeChange = (value) => {
    this.setState({
      borderlessMode: value,
    });
  };

  private handleDiodeModuleChange = (value) => {
    this.setState({
      enableDiode: value,
    });
  };

  private handleAutofocusModuleChange = (value) => {
    this.setState({
      enableAutofocus: value,
    });
  };

  save(): void {
    const {
      engraveDpi, rotaryMode, borderlessMode, enableDiode, enableAutofocus, workarea,
    } = this.state;
    BeamboxPreference.write('engrave_dpi', engraveDpi);
    BeamboxPreference.write('rotary_mode', rotaryMode);
    BeamboxPreference.write('borderless', borderlessMode);
    BeamboxPreference.write('enable-diode', enableDiode);
    BeamboxPreference.write('enable-autofocus', enableAutofocus);
    if (workarea !== BeamboxPreference.read('workarea')) {
      BeamboxPreference.write('workarea', workarea);
      svgCanvas.setResolution(constant.dimension.getWidth(BeamboxPreference.read('workarea')), constant.dimension.getHeight(BeamboxPreference.read('workarea')));
      svgEditor.resetView();
      eventEmitter.emit('workarea-change');
    }
    OpenBottomBoundaryDrawer.update();
    beamboxStore.emitUpdateLaserPanel();
  }

  render(): JSX.Element {
    const { unmount } = this.props;
    const {
      workarea, engraveDpi, rotaryMode, borderlessMode, enableAutofocus, enableDiode,
    } = this.state;
    const doesSupportOpenBottom = constant.addonsSupportList.openBottom.includes(workarea);
    const doesSupportHybrid = constant.addonsSupportList.hybridLaser.includes(workarea);
    const doesSupportAutofocus = constant.addonsSupportList.autoFocus.includes(workarea);
    return (
      <Modal onClose={unmount}>
        <div className="document-panel">
          <section className="main-content">
            <div className="title">{LANG.document_settings}</div>
            <EngraveDpiSlider
              value={engraveDpi}
              onChange={this.handleEngraveDpiChange}
            />
            <DropDownControl
              id="workarea_dropdown"
              label={LANG.workarea}
              options={workareaOptions}
              value={workarea}
              onChange={this.handleWorkareaChange}
            />
            <div className="sub-title">{LANG.add_on}</div>
            <SwitchControl
              id="rotary_mode"
              name="rotary_mode"
              onText={LANG.enable}
              offText={LANG.disable}
              label={LANG.rotary_mode}
              default={rotaryMode}
              onChange={this.handleRotaryModeChange}
            />
            <SwitchControl
              id="borderless_mode"
              name="borderless_mode"
              onText={LANG.enable}
              offText={LANG.disable}
              label={LANG.borderless_mode}
              default={doesSupportOpenBottom && borderlessMode}
              isDisabled={!doesSupportOpenBottom}
              onChange={this.handleBorderlessModeChange}
            />
            <SwitchControl
              id="autofocus-module"
              name="autofocus-module"
              onText={LANG.enable}
              offText={LANG.disable}
              label={LANG.enable_autofocus}
              default={doesSupportAutofocus && enableAutofocus}
              isDisabled={!doesSupportAutofocus}
              onChange={this.handleAutofocusModuleChange}
            />
            <SwitchControl
              id="diode_module"
              name="diode_module"
              onText={LANG.enable}
              offText={LANG.disable}
              label={LANG.enable_diode}
              default={doesSupportHybrid && enableDiode}
              isDisabled={!doesSupportHybrid}
              onChange={this.handleDiodeModuleChange}
            />
          </section>
          <section className="footer">
            <button
              className="btn btn-default pull-right"
              type="button"
              onClick={unmount}
            >
              {LANG.cancel}
            </button>
            <button
              className="btn btn-default primary pull-right"
              type="button"
              onClick={() => {
                this.save();
                unmount();
              }}
            >
              {LANG.save}
            </button>
          </section>
        </div>
      </Modal>
    );
  }
}
