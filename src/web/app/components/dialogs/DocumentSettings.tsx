import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Form, Modal, Switch, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import changeWorkarea from 'app/svgedit/operations/changeWorkarea';
import diodeBoundaryDrawer from 'app/actions/canvas/diode-boundary-drawer';
import EngraveDpiSlider from 'app/widgets/EngraveDpiSlider';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import isDev from 'helpers/is-dev';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import OpenBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import presprayArea from 'app/actions/canvas/prespray-area';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import Select from 'app/widgets/AntdSelect';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/UnitInput';
import useI18n from 'helpers/useI18n';
import { getSupportInfo } from 'app/constants/add-on';
import { WorkAreaModel, getWorkarea } from 'app/constants/workarea-constants';

import styles from './DocumentSettings.module.scss';

const eventEmitter = eventEmitterFactory.createEventEmitter('dpi-info');

const workareaOptions = [
  { label: 'beamo', value: 'fbm1' },
  { label: 'Beambox', value: 'fbb1b' },
  { label: 'Beambox Pro', value: 'fbb1p' },
  { label: 'HEXA', value: 'fhexa1' },
  { label: 'Ador', value: 'ado1' },
];
if (isDev()) workareaOptions.push({ label: 'Beambox II', value: 'fbb2' });

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
  const supportInfo = useMemo(() => getSupportInfo(workarea), [workarea]);
  const [rotaryMode, setRotaryMode] = useState<number>(BeamboxPreference.read('rotary_mode') ?? 0);
  const [extendRotaryWorkarea, setExtendRotaryWorkarea] = useState<boolean>(
    !!BeamboxPreference.read('extend-rotary-workarea')
  );
  const [mirrorRotary, setMirrorRotary] = useState<boolean>(!!BeamboxPreference.read('rotary-mirror'));
  const [borderless, setBorderless] = useState(!!BeamboxPreference.read('borderless'));
  const [enableDiode, setEnableDiode] = useState(!!BeamboxPreference.read('enable-diode'));
  const [enableAutofocus, setEnableAutofocus] = useState(
    !!BeamboxPreference.read('enable-autofocus')
  );
  const [passThrough, setPassThrough] = useState(!!BeamboxPreference.read('pass-through'));

  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const workareaObj = useMemo(() => getWorkarea(workarea), [workarea]);
  const [passThroughHeight, setPassThroughHeight] = useState<number>(
    BeamboxPreference.read('pass-through-height') || workareaObj.displayHeight || workareaObj.height
  );
  useEffect(() => {
    if (rotaryMode > 0) {
      setBorderless(false);
      setPassThrough(false);
    }
  }, [rotaryMode]);
  useEffect(() => {
    if (borderless) setRotaryMode(0);
    else if (supportInfo.openBottom) setPassThrough(false);
  }, [supportInfo, borderless]);
  useEffect(() => {
    if (passThrough) setRotaryMode(0);
  }, [passThrough]);
  useEffect(() => {
    if (borderless) setPassThroughHeight((cur) => Math.max(cur, workareaObj.height));
  }, [borderless, workareaObj]);

  const handleEngraveDpiChange = (value: string) => setEngraveDpi(value);
  const handleWorkareaChange = (value: WorkAreaModel) => setWorkarea(value);
  const handleRotaryModeChange = (on: boolean) => setRotaryMode(on ? 1 : 0);
  const handleBorderlessModeChange = (value: boolean) => setBorderless(value);
  const handleDiodeModuleChange = (value: boolean) => setEnableDiode(value);
  const handleAutofocusModuleChange = (value: boolean) => setEnableAutofocus(value);
  const handlePassThrough = (value: boolean) => setPassThrough(value);

  const shouldPassThrough = supportInfo.passThrough && (supportInfo.openBottom ? borderless : true);

  const handleSave = () => {
    BeamboxPreference.write('engrave_dpi', engraveDpi);
    eventEmitter.emit('UPDATE_DPI', engraveDpi);
    // state for engrave dpi v2
    // BeamboxPreference.write('engrave-dpi-value', engraveDpiValue);
    BeamboxPreference.write('borderless', supportInfo.openBottom && borderless);
    BeamboxPreference.write('enable-diode', supportInfo.hybridLaser && enableDiode);
    BeamboxPreference.write('enable-autofocus', supportInfo.autoFocus && enableAutofocus);
    const workareaChanged = workarea !== origWorkarea;
    const rotaryChanged =
      rotaryMode !== BeamboxPreference.read('rotary_mode') ||
      extendRotaryWorkarea !== !!BeamboxPreference.read('extend-rotary-workarea');
    BeamboxPreference.write('rotary_mode', rotaryMode);
    if (workarea === 'ado1' && rotaryMode > 0) {
      BeamboxPreference.write('extend-rotary-workarea', extendRotaryWorkarea);
      BeamboxPreference.write('rotary-mirror', mirrorRotary);
    }

    const newPassThrough = shouldPassThrough && passThrough;
    const passThroughChanged = newPassThrough !== !!BeamboxPreference.read('pass-through');
    BeamboxPreference.write('pass-through', newPassThrough);
    const passThroughHeightChanged =
      passThroughHeight !== BeamboxPreference.read('pass-through-height');
    BeamboxPreference.write('pass-through-height', passThroughHeight);
    if (workareaChanged || rotaryChanged || passThroughChanged || passThroughHeightChanged) {
      changeWorkarea(workarea, { toggleModule: workareaChanged });
      rotaryAxis.toggleDisplay();
      presprayArea.togglePresprayArea();
    } else {
      // this is called in changeWorkarea
      OpenBottomBoundaryDrawer.update();
      if (supportInfo.hybridLaser && enableDiode) diodeBoundaryDrawer.show();
      else diodeBoundaryDrawer.hide();
    }
    const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
    canvasEvents.emit('document-settings-saved');
  };

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
        <div className={styles.modules}>
          {workareaObj.rotary.length > 1 && (
            <div className={classNames(styles.row, { [styles.full]: workarea === 'ado1' })}>
              <div className={styles.title}>
                <label htmlFor="rotary_mode">{langDocumentSettings.rotary_mode}</label>
              </div>
              <div className={styles.control}>
                <Switch
                  id="rotary_mode"
                  className={styles.switch}
                  checked={rotaryMode > 0}
                  disabled={workareaObj.rotary.length === 1}
                  onChange={handleRotaryModeChange}
                />
                {workarea === 'ado1' && rotaryMode > 0 && (
                  <>
                  <div className={styles.subCheckbox}>
                    <Checkbox
                      checked={extendRotaryWorkarea}
                      onChange={(e) => setExtendRotaryWorkarea(e.target.checked)}
                    >
                      {langDocumentSettings.extend_workarea}
                    </Checkbox>
                    <Checkbox
                      checked={mirrorRotary}
                      onChange={(e) => setMirrorRotary(e.target.checked)}
                    >
                      {langDocumentSettings.mirror}
                    </Checkbox>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
          {supportInfo.autoFocus && (
            <div className={styles.row}>
              <div className={styles.title}>
                <label htmlFor="autofocus-module">{langDocumentSettings.enable_autofocus}</label>
              </div>
              <div className={styles.control}>
                <Switch
                  id="autofocus-module"
                  className={styles.switch}
                  checked={supportInfo.autoFocus && enableAutofocus}
                  disabled={!supportInfo.autoFocus}
                  onChange={handleAutofocusModuleChange}
                />
              </div>
            </div>
          )}
          {supportInfo.openBottom && (
            <div className={styles.row}>
              <div className={styles.title}>
                <label htmlFor="borderless_mode">{langDocumentSettings.borderless_mode}</label>
              </div>
              <div className={styles.control}>
                <Switch
                  id="borderless_mode"
                  className={styles.switch}
                  checked={supportInfo.openBottom && borderless}
                  disabled={!supportInfo.openBottom}
                  onChange={handleBorderlessModeChange}
                />
              </div>
            </div>
          )}
          {supportInfo.hybridLaser && (
            <div className={styles.row}>
              <div className={styles.title}>
                <label htmlFor="diode_module">{langDocumentSettings.enable_diode}</label>
              </div>
              <div className={styles.control}>
                <Switch
                  id="diode_module"
                  className={styles.switch}
                  checked={supportInfo.hybridLaser && enableDiode}
                  disabled={!supportInfo.hybridLaser}
                  onChange={handleDiodeModuleChange}
                />
              </div>
            </div>
          )}
          {shouldPassThrough && (
            <div className={classNames(styles.row, styles.full)}>
              <div className={styles.title}>
                <label htmlFor="pass_through">{langDocumentSettings.pass_through}</label>
              </div>
              <div className={styles.control}>
                <Switch
                  id="pass_through"
                  className={styles.switch}
                  checked={supportInfo.passThrough && passThrough}
                  disabled={!supportInfo.passThrough}
                  onChange={handlePassThrough}
                />
                {passThrough && (
                  <>
                    <UnitInput
                      id="pass_through_height"
                      className={styles.input}
                      value={passThroughHeight}
                      min={workareaObj.displayHeight ?? workareaObj.height}
                      addonAfter={isInch ? 'in' : 'mm'}
                      isInch={isInch}
                      precision={isInch ? 0 : 2}
                      onChange={(val) => setPassThroughHeight(val)}
                    />
                    <Tooltip title={langDocumentSettings.pass_through_height_desc}>
                      <QuestionCircleOutlined className={styles.hint} />
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default DocumentSettings;
