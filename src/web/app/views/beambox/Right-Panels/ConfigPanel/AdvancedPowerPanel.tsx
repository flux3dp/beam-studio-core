import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ConfigProvider, Modal, InputNumber, Slider } from 'antd';

import history from 'app/svgedit/history/history';
import undoManager from 'app/svgedit/history/undoManager';
import useI18n from 'helpers/useI18n';
import { ConfigModalBlock } from 'app/constants/antd-config';
import { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';
import { IConfig } from 'interfaces/ILayerConfig';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './AdvancedPowerPanel.module.scss';

interface Props {
  onClose: () => void;
}

// TODO: add test
const AdvancedPowerPanel = ({ onClose }: Props): JSX.Element => {
  const t = useI18n().beambox.right_panel.laser_panel;
  const { dispatch, initState, selectedLayers, state } = useContext(ConfigPanelContext);
  const [draftValue, setDraftValue] = useState<{ minPower: IConfig<number> }>({
    minPower: state.minPower,
  });
  const [displayValue, setDisplayValue] = useState(draftValue);
  useEffect(() => setDisplayValue(draftValue), [draftValue]);

  const power = state.power.value;
  const handleSave = () => {
    const newState = { ...state };
    const batchCmd = new history.BatchCommand('Change power advanced setting');
    selectedLayers.forEach((layerName) => {
      const layer = getLayerByName(layerName);
      if (
        state.minPower.value !== draftValue.minPower.value ||
        state.minPower.hasMultiValue !== draftValue.minPower.hasMultiValue
      ) {
        writeDataLayer(layer, DataType.strength, draftValue.minPower.value, { batchCmd });
      }
    });
    batchCmd.onAfter = initState;
    undoManager.addCommandToHistory(batchCmd);
    dispatch({ type: 'update', payload: newState });
    onClose();
  };
  const handleValueChange = useCallback((key: string, value: number, display = false) => {
    if (display) setDisplayValue((cur) => ({ ...cur, [key]: { value, hasMultiValue: false } }));
    else setDraftValue((cur) => ({ ...cur, [key]: { value, hasMultiValue: false } }));
  }, []);
  return (
    <Modal
      centered
      open
      maskClosable={false}
      width={320}
      onOk={handleSave}
      onCancel={onClose}
      cancelText={t.cancel}
      okText={t.save}
      title={t.pwm_advanced_setting}
    >
      <ConfigProvider theme={ConfigModalBlock}>
        <div className={styles.desc}>{t.pwm_advanced_desc}</div>
        <div className={styles.block}>
          <div className={styles.header}>
            <span className={styles.input}>
              <InputNumber
                size="small"
                value={draftValue.minPower.value}
                controls={false}
                min={0}
                max={power}
                onChange={(val) => handleValueChange('minPower', val)}
              />
              <span className={styles.unit}>%</span>
            </span>
            <span className={styles.input}>
              <InputNumber
                disabled
                size="small"
                value={power}
                controls={false}
                min={0}
                max={power}
              />
              <span className={styles.unit}>%</span>
            </span>
          </div>
          <Slider
            min={0}
            max={power}
            step={1}
            range
            value={[displayValue.minPower.value, power]}
            onAfterChange={(values) => handleValueChange('minPower', values[0])}
            onChange={(values) => handleValueChange('minPower', values[0], true)}
            tooltip={{
              formatter: (v: number) => `${v}%`,
            }}
          />
        </div>
      </ConfigProvider>
    </Modal>
  );
};

export default AdvancedPowerPanel;
