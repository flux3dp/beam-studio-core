import classNames from 'classnames';
import React, { useState } from 'react';
import { Col, Form, Modal, Row, Select, Switch } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './DocumentSettings.module.scss';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const LANG = i18n.lang.beambox.document_panel;
const eventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

const workareaOptions = [
  { label: 'beamo', value: 'fbm1' },
  { label: 'Beambox', value: 'fbb1b' },
  { label: 'Beambox Pro', value: 'fbb1p' },
  { label: 'HEXA', value: 'fhexa1' },
  // { label: 'Ador', value: 'ador' },
];

interface Props {
  unmount: () => void;
}

const DocumentSettings = ({ unmount }: Props): JSX.Element => {
  const [engraveDpi, setEngraveDpi] = useState(BeamboxPreference.read('engrave_dpi'));
  const [workarea, setWorkarea] = useState(BeamboxPreference.read('workarea') || 'fbb1b');
  const [rotaryMode, setRotaryMode] = useState(BeamboxPreference.read('rotary_mode'));
  const [borderlessMode, setBorderlessMode] = useState(
    BeamboxPreference.read('borderless') === true
  );
  const [enableDiode, setEnableDiode] = useState(BeamboxPreference.read('enable-diode') === true);
  const [enableAutofocus, setEnableAutofocus] = useState(
    BeamboxPreference.read('enable-autofocus') === true
  );

  const handleEngraveDpiChange = (value: string) => setEngraveDpi(value);
  const handleWorkareaChange = (value: string) => setWorkarea(value);
  const handleRotaryModeChange = (value) => {
    setRotaryMode(value);
    svgCanvas.setRotaryMode(value);
    svgCanvas.runExtensions('updateRotaryAxis');
  };
  const handleBorderlessModeChange = (value: boolean) => setBorderlessMode(value);
  const handleDiodeModuleChange = (value: boolean) => setEnableDiode(value);
  const handleAutofocusModuleChange = (value: boolean) => setEnableAutofocus(value);

  const handleSave = () => {
    BeamboxPreference.write('engrave_dpi', engraveDpi);
    BeamboxPreference.write('rotary_mode', rotaryMode);
    BeamboxPreference.write('borderless', borderlessMode);
    BeamboxPreference.write('enable-diode', enableDiode);
    BeamboxPreference.write('enable-autofocus', enableAutofocus);
    if (workarea !== BeamboxPreference.read('workarea')) {
      BeamboxPreference.write('workarea', workarea);
      svgCanvas.setResolution(
        constant.dimension.getWidth(BeamboxPreference.read('workarea')),
        constant.dimension.getHeight(BeamboxPreference.read('workarea'))
      );
      svgEditor.resetView();
      eventEmitter.emit('workarea-change');
    }
    OpenBottomBoundaryDrawer.update();
    beamboxStore.emitUpdateLaserPanel();
  };

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
        handleSave();
        unmount();
      }}
      cancelText={LANG.cancel}
      okText={LANG.save}
    >
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <EngraveDpiSlider value={engraveDpi} onChange={handleEngraveDpiChange} />
        <Form.Item name="workarea" initialValue={workarea} label={LANG.workarea}>
          <Select bordered onChange={handleWorkareaChange}>
            {workareaOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <strong>{LANG.add_on}</strong>
        <Row>
          <Col span={12}>
            <Form.Item
              name="rotary_mode"
              label={LANG.rotary_mode}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch checked={rotaryMode} onChange={handleRotaryModeChange} />
            </Form.Item>
            <Form.Item
              name="borderless_mode"
              className={classNames({ [styles.disabled]: !doesSupportOpenBottom })}
              label={LANG.borderless_mode}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch
                checked={doesSupportOpenBottom && borderlessMode}
                disabled={!doesSupportOpenBottom}
                onChange={handleBorderlessModeChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="autofocus-module"
              className={classNames({ [styles.disabled]: !doesSupportAutofocus })}
              label={LANG.enable_autofocus}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch
                checked={doesSupportAutofocus && enableAutofocus}
                disabled={!doesSupportAutofocus}
                onChange={handleAutofocusModuleChange}
              />
            </Form.Item>
            <Form.Item
              name="diode_module"
              className={classNames({ [styles.disabled]: !doesSupportHybrid })}
              label={LANG.enable_diode}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch
                checked={doesSupportHybrid && enableDiode}
                disabled={!doesSupportHybrid}
                onChange={handleDiodeModuleChange}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DocumentSettings;
