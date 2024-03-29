import React, { useContext, useState } from 'react';
import { Modal } from 'antd';

import useI18n from 'helpers/useI18n';
import { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';

import ConfigPanelContext from './ConfigPanelContext';
import styles from './WhiteInkSettingsModal.module.scss';
import WhiteInkMultipass from './WhiteInkMultipass';
import WhiteInkRepeat from './WhiteInkRepeat';
import WhiteInkSpeed from './WhiteInkSpeed';
import WhiteInkSaturation from './WhiteInkSaturation';

interface Props {
  onClose: () => void;
}

// TODO: add test
const WhiteInkSettingsModal = ({ onClose }: Props): JSX.Element => {
  const { dispatch, selectedLayers, state } = useContext(ConfigPanelContext);
  const t = useI18n().beambox.right_panel.laser_panel;
  const { wInk, wSpeed, wMultipass, wRepeat } = state;
  const [ink, setInk] = useState(wInk);
  const [speed, setSpeed] = useState(wSpeed);
  const [multipass, setMultipass] = useState(wMultipass);
  const [repeat, setRepeat] = useState(wRepeat);

  const handleSave = () => {
    const newState = { ...state };
    selectedLayers.forEach((layerName) => {
      const layer = getLayerByName(layerName);
      if (wInk.value !== ink.value || wInk.hasMultiValue !== ink.hasMultiValue) {
        writeDataLayer(layer, DataType.wInk, ink.value);
        newState.wInk = ink;
      }
      if (wSpeed.value !== speed.value || wSpeed.hasMultiValue !== speed.hasMultiValue) {
        writeDataLayer(layer, DataType.wSpeed, speed.value);
        newState.wSpeed = speed;
      }
      if (
        wMultipass.value !== multipass.value ||
        wMultipass.hasMultiValue !== multipass.hasMultiValue
      ) {
        writeDataLayer(layer, DataType.wMultipass, multipass.value);
        newState.wMultipass = multipass;
      }
      if (wRepeat.value !== repeat.value || wRepeat.hasMultiValue !== repeat.hasMultiValue) {
        writeDataLayer(layer, DataType.wRepeat, repeat.value);
        newState.wRepeat = repeat;
      }
    });
    dispatch({ type: 'update', payload: newState });
    onClose();
  };

  return (
    <Modal
      open
      centered
      width={290}
      title={t.white_ink_settings}
      okText={t.save}
      maskClosable={false}
      cancelText={t.cancel}
      onCancel={onClose}
      onOk={handleSave}
    >
      <div className={styles.container}>
        <WhiteInkSaturation
          value={ink.value}
          hasMultiValue={ink.hasMultiValue}
          onChange={(val) => setInk({ value: val, hasMultiValue: false })}
        />
        <WhiteInkSpeed
          value={speed.value}
          hasMultiValue={speed.hasMultiValue}
          onChange={(val) => setSpeed({ value: val, hasMultiValue: false })}
        />
        <WhiteInkMultipass
          value={multipass.value}
          hasMultiValue={multipass.hasMultiValue}
          onChange={(val) => setMultipass({ value: val, hasMultiValue: false })}
        />
        <WhiteInkRepeat
          value={repeat.value}
          hasMultiValue={repeat.hasMultiValue}
          onChange={(val) => setRepeat({ value: val, hasMultiValue: false })}
        />
      </div>
    </Modal>
  );
};

export default WhiteInkSettingsModal;
