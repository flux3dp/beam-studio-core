import * as React from 'react';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import i18n from 'helpers/i18n';
import {
  Col,
  Form, Modal, Row, Select, Switch,
} from 'antd';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
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
  { label: 'HEXA', value: 'fhexa1' },
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
      <Modal
        open
        centered
        title={LANG.document_settings}
        onCancel={unmount}
        onOk={() => {
          this.save();
          unmount();
        }}
        cancelText={LANG.cancel}
        okText={LANG.save}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <EngraveDpiSlider
            value={engraveDpi}
            onChange={this.handleEngraveDpiChange}
          />
          <Form.Item
            name="workarea"
            initialValue={workarea}
            label={LANG.workarea}
          >
            <Select
              bordered
              onChange={this.handleWorkareaChange}
            >
              {
                workareaOptions.map((option) => (
                  <Select.Option value={option.value}>
                    {option.label}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <strong>{LANG.add_on}</strong>
          <Row>
            <Col span={12}>
              <Form.Item
                name="rotary_mode"
                initialValue={rotaryMode}
                label={LANG.rotary_mode}
                labelCol={{ span: 12, offset: 0 }}
              >
                <Switch
                  defaultChecked={rotaryMode}
                  onChange={this.handleRotaryModeChange}
                />
              </Form.Item>
              <Form.Item
                name="borderless_mode"
                initialValue={doesSupportOpenBottom && borderlessMode}
                label={LANG.borderless_mode}
                labelCol={{ span: 12, offset: 0 }}
              >
                <Switch
                  defaultChecked={doesSupportOpenBottom && borderlessMode}
                  disabled={!doesSupportOpenBottom}
                  onChange={this.handleBorderlessModeChange}
                />
              </Form.Item>

            </Col>
            <Col span={12}>
              <Form.Item
                name="autofocus-module"
                initialValue={doesSupportAutofocus && enableAutofocus}
                label={LANG.enable_autofocus}
                labelCol={{ span: 12, offset: 0 }}
              >
                <Switch
                  defaultChecked={doesSupportAutofocus && enableAutofocus}
                  disabled={!doesSupportAutofocus}
                  onChange={this.handleAutofocusModuleChange}
                />
              </Form.Item>
              <Form.Item
                name="diode_module"
                initialValue={doesSupportHybrid && enableDiode}
                label={LANG.enable_diode}
                labelCol={{ span: 12, offset: 0 }}
              >
                <Switch
                  defaultChecked={doesSupportHybrid && enableDiode}
                  disabled={!doesSupportHybrid}
                  onChange={this.handleDiodeModuleChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
