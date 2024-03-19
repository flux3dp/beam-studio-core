import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Col, ConfigProvider, Form, Modal, Row, Select, Switch } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import changeWorkarea from 'app/svgedit/operations/changeWorkarea';
import constant from 'app/actions/beambox/constant';
import diodeBoundaryDrawer from 'app/actions/canvas/diode-boundary-drawer';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import useI18n from 'helpers/useI18n';
import { WorkAreaModel, getWorkarea } from 'app/constants/workarea-constants';

import styles from './DocumentSettings.module.scss';

const workareaOptions = [
  { label: 'beamo', value: 'fbm1' },
  { label: 'Beambox', value: 'fbb1b' },
  { label: 'Beambox Pro', value: 'fbb1p' },
  { label: 'Beambox Pro II', value: 'fbb2p' },
  { label: 'HEXA', value: 'fhexa1' },
  { label: 'Ador', value: 'ado1' },
];

// map for engrave dpi v2
// const dpiMap = {
//   low: 125,
//   medium: 250,
//   high: 500,
//   ultra: 1000,
// };

interface Props {
  unmount: () => void;
}

const DocumentSettings = ({ unmount }: Props): JSX.Element => {
  const lang = useI18n();
  const langDocumentSettings = lang.beambox.document_panel;
  const [form] = Form.useForm();
  const [engraveDpi, setEngraveDpi] = useState(BeamboxPreference.read('engrave_dpi'));
  // state for engrave dpi v2
  // const [engraveDpiValue, setEngraveDpiValue] = useState(
  //   BeamboxPreference.read('engrave-dpi-value') || dpiMap[engraveDpi] || 250
  // );
  const origWorkarea = useMemo(() => BeamboxPreference.read('workarea'), []);
  const [workarea, setWorkarea] = useState<WorkAreaModel>(origWorkarea || 'fbb1b');
  const [rotaryMode, setRotaryMode] = useState<number>(BeamboxPreference.read('rotary_mode'));
  const [extendRotaryWorkarea, setExtendRotaryWorkarea] = useState<boolean>(
    !!BeamboxPreference.read('extend-rotary-workarea')
  );
  const [borderlessMode, setBorderlessMode] = useState(
    BeamboxPreference.read('borderless') === true
  );
  const [enableDiode, setEnableDiode] = useState(BeamboxPreference.read('enable-diode') === true);
  const [enableAutofocus, setEnableAutofocus] = useState(
    BeamboxPreference.read('enable-autofocus') === true
  );

  const handleEngraveDpiChange = (value: string) => setEngraveDpi(value);
  const handleWorkareaChange = (value: WorkAreaModel) => setWorkarea(value);
  const handleRotaryModeChange = (on: boolean) => setRotaryMode(on ? 1 : 0);
  const handleBorderlessModeChange = (value: boolean) => setBorderlessMode(value);
  const handleDiodeModuleChange = (value: boolean) => setEnableDiode(value);
  const handleAutofocusModuleChange = (value: boolean) => setEnableAutofocus(value);

  const rotaryModels = useMemo(() => getWorkarea(workarea).rotary, [workarea]);

  useEffect(() => {
    if (!rotaryModels.includes(rotaryMode)) {
      form.setFieldValue('rotary_mode', 0);
      handleRotaryModeChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotaryModels]);

  const handleSave = () => {
    BeamboxPreference.write('engrave_dpi', engraveDpi);
    // state for engrave dpi v2
    // BeamboxPreference.write('engrave-dpi-value', engraveDpiValue);
    BeamboxPreference.write('borderless', borderlessMode);
    BeamboxPreference.write('enable-diode', enableDiode);
    BeamboxPreference.write('enable-autofocus', enableAutofocus);
    const rotaryChanged =
      rotaryMode !== BeamboxPreference.read('rotary_mode') ||
      extendRotaryWorkarea !== (!!BeamboxPreference.read('extend-rotary-workarea'));
    BeamboxPreference.write('rotary_mode', rotaryMode);
    BeamboxPreference.write('extend-rotary-workarea', extendRotaryWorkarea);
    if (workarea !== BeamboxPreference.read('workarea') || rotaryChanged) {
      changeWorkarea(workarea);
    } else {
      // this is called in changeWorkarea
      OpenBottomBoundaryDrawer.update();
      if (enableDiode) diodeBoundaryDrawer.show();
      else diodeBoundaryDrawer.hide();
    }
    rotaryAxis.toggleDisplay();
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
      onOk={async () => {
        if (
          origWorkarea !== workarea &&
          modelsWithModules.has(origWorkarea) &&
          !modelsWithModules.has(workarea) &&
          document.querySelectorAll(`g.layer[data-module="${LayerModule.PRINTER}"]`).length
        ) {
          const res = await new Promise((resolve) => {
            alertCaller.popUp({
              id: 'save-document-settings',
              message: langDocumentSettings.notification.changeFromPrintingWorkareaTitle,
              messageIcon: 'notice',
              buttonType: alertConstants.CONFIRM_CANCEL,
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          if (!res) return;
        }
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
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <strong>{langDocumentSettings.add_on}</strong>
        <ConfigProvider
          theme={{
            components: {
              Form: {
                itemMarginBottom: 0,
              },
            },
          }}
        >
          <Row>
            <Col span={12}>
              <Form.Item
                name="rotary_mode"
                className={classNames({ [styles.disabled]: rotaryModels.length === 1 })}
                label={langDocumentSettings.rotary_mode}
                labelCol={{ span: 12, offset: 0 }}
              >
                <Switch
                  checked={rotaryMode !== 0}
                  disabled={rotaryModels.length === 1}
                  onChange={handleRotaryModeChange}
                />
              </Form.Item>
              <div className={styles.subCheckbox}>
                {workarea === 'ado1' && rotaryMode !== 0 && (
                  <Checkbox
                    checked={extendRotaryWorkarea}
                    onChange={(e) => setExtendRotaryWorkarea(e.target.checked)}
                  >
                    {langDocumentSettings.extend_workarea}
                  </Checkbox>
                )}
              </div>
            </Col>
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
        </ConfigProvider>
      </Form>
    </Modal>
  );
};

export default DocumentSettings;
