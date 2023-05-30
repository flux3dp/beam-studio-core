import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Col, Form, Modal, Row, Select, Switch } from 'antd';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import useI18n from 'helpers/useI18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './DocumentSettings.module.scss';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const eventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

const workareaOptions = [
  { label: 'beamo', value: 'fbm1' },
  { label: 'Beambox', value: 'fbb1b' },
  { label: 'Beambox Pro', value: 'fbb1p' },
  { label: 'HEXA', value: 'fhexa1' },
];

if ('localStorage' in window && window.localStorage.getItem('dev')) {
  workareaOptions.push({ label: 'Ador', value: 'fad1' });
}

interface Props {
  unmount: () => void;
}

const DocumentSettings = ({ unmount }: Props): JSX.Element => {
  const lang = useI18n();
  const langDocumentSettings = lang.beambox.document_panel;
  const [form] = Form.useForm();
  const [engraveDpi, setEngraveDpi] = useState(BeamboxPreference.read('engrave_dpi'));
  const [workarea, setWorkarea] = useState(BeamboxPreference.read('workarea') || 'fbb1b');
  const [rotaryMode, setRotaryMode] = useState<number>(BeamboxPreference.read('rotary_mode'));
  const [borderlessMode, setBorderlessMode] = useState(
    BeamboxPreference.read('borderless') === true
  );
  const [enableDiode, setEnableDiode] = useState(BeamboxPreference.read('enable-diode') === true);
  const [enableAutofocus, setEnableAutofocus] = useState(
    BeamboxPreference.read('enable-autofocus') === true
  );

  const handleEngraveDpiChange = (value: string) => setEngraveDpi(value);
  const handleWorkareaChange = (value: string) => setWorkarea(value);
  const handleRotaryModeChange = (value: number) => setRotaryMode(value);
  const handleBorderlessModeChange = (value: boolean) => setBorderlessMode(value);
  const handleDiodeModuleChange = (value: boolean) => setEnableDiode(value);
  const handleAutofocusModuleChange = (value: boolean) => setEnableAutofocus(value);

  const rotaryModels = useMemo(() => constant.getRotaryModels(workarea), [workarea]);
  const rotaryModalLabels = useMemo(() => ({
    0: lang.settings.off,
    1: rotaryModels.length > 2 ? 'Rotary v1' : lang.settings.on,
    2: 'Rotary v2'
  }), [lang.settings.on, lang.settings.off, rotaryModels.length]);

  useEffect(() => {
    if (!rotaryModels.includes(rotaryMode)) {
      form.setFieldValue('rotary_mode', rotaryModels[0]);
      handleRotaryModeChange(rotaryModels[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotaryModels]);

  const handleSave = () => {
    BeamboxPreference.write('engrave_dpi', engraveDpi);
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
    BeamboxPreference.write('rotary_mode', rotaryMode);
    svgCanvas.setRotaryMode(rotaryMode);
    svgCanvas.runExtensions('updateRotaryAxis');
    OpenBottomBoundaryDrawer.update();
    beamboxStore.emitUpdateWorkArea();
  };

  const doesSupportOpenBottom = constant.addonsSupportList.openBottom.includes(workarea);
  const doesSupportHybrid = constant.addonsSupportList.hybridLaser.includes(workarea);
  const doesSupportAutofocus = constant.addonsSupportList.autoFocus.includes(workarea);
  return (
    <Modal
      open
      centered
      title={langDocumentSettings.document_settings}
      onCancel={unmount}
      onOk={() => {
        handleSave();
        unmount();
      }}
      cancelText={langDocumentSettings.cancel}
      okText={langDocumentSettings.save}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <EngraveDpiSlider value={engraveDpi} onChange={handleEngraveDpiChange} />
        <Form.Item name="workarea" initialValue={workarea} label={langDocumentSettings.workarea}>
          <Select bordered onChange={handleWorkareaChange}>
            {workareaOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <strong>{langDocumentSettings.add_on}</strong>
        <Form.Item initialValue={rotaryMode} name="rotary_mode" label={langDocumentSettings.rotary_mode}>
          <Select bordered onChange={handleRotaryModeChange} value={rotaryMode}>
            {rotaryModels.map((model) => (
              <Select.Option key={model} value={model}>{rotaryModalLabels[model]}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item
              name="borderless_mode"
              className={classNames({ [styles.disabled]: !doesSupportOpenBottom })}
              label={langDocumentSettings.borderless_mode}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch
                checked={doesSupportOpenBottom && borderlessMode}
                disabled={!doesSupportOpenBottom}
                onChange={handleBorderlessModeChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="autofocus-module"
              className={classNames({ [styles.disabled]: !doesSupportAutofocus })}
              label={langDocumentSettings.enable_autofocus}
              labelCol={{ span: 12, offset: 0 }}
            >
              <Switch
                checked={doesSupportAutofocus && enableAutofocus}
                disabled={!doesSupportAutofocus}
                onChange={handleAutofocusModuleChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="diode_module"
              className={classNames({ [styles.disabled]: !doesSupportHybrid })}
              label={langDocumentSettings.enable_diode}
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
