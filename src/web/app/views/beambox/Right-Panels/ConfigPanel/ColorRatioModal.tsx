import React, { useContext, useState } from 'react';
import { ConfigProvider, Modal } from 'antd';

import useI18n from 'helpers/useI18n';
import { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';

import ConfigPanelContext from './ConfigPanelContext';
import ColorRatioBlock from './ColorRatioBlock';

interface Props {
  onClose: () => void;
}

// TODO: add test
const ColorRationModal = ({ onClose }: Props): JSX.Element => {
  const t = useI18n().beambox.right_panel.laser_panel;
  const { dispatch, selectedLayers, state } = useContext(ConfigPanelContext);
  const { cRatio, mRatio, yRatio, kRatio } = state;
  const [c, setC] = useState(cRatio);
  const [m, setM] = useState(mRatio);
  const [y, setY] = useState(yRatio);
  const [k, setK] = useState(kRatio);
  const handleSave = () => {
    const newState = { ...state };
    selectedLayers.forEach((layerName) => {
      const layer = getLayerByName(layerName);
      if (cRatio.value !== c.value || cRatio.hasMultiValue !== c.hasMultiValue) {
        writeDataLayer(layer, DataType.cRatio, c.value);
        newState.cRatio = c;
      }
      if (mRatio.value !== m.value || mRatio.hasMultiValue !== m.hasMultiValue) {
        writeDataLayer(layer, DataType.mRatio, m.value);
        newState.mRatio = m;
      }
      if (yRatio.value !== y.value || yRatio.hasMultiValue !== y.hasMultiValue) {
        writeDataLayer(layer, DataType.yRatio, y.value);
        newState.yRatio = y;
      }
      if (kRatio.value !== k.value || kRatio.hasMultiValue !== k.hasMultiValue) {
        writeDataLayer(layer, DataType.kRatio, k.value);
        newState.kRatio = k;
      }
    });
    dispatch({ type: 'update', payload: newState });
    onClose();
  };
  return (
    <Modal
      centered
      open
      maskClosable={false}
      width={290}
      onOk={handleSave}
      onCancel={onClose}
      cancelText={t.cancel}
      okText={t.save}
      title={t.color_adjustment}
    >
      <ConfigProvider
        theme={{
          token: {
            colorPrimaryBorder: '#cecece',
            colorPrimaryBorderHover: '#494949',
            colorPrimary: '#494949',
          },
          components: {
            InputNumber: {
              activeShadow: 'none',
              activeBorderColor: '#cecece',
              hoverBorderColor: '#cecece',
              controlWidth: 40,
            },
            Slider: {
              handleColor: '#cecece',
              handleActiveColor: '#494949',
              dotActiveBorderColor: '#494949',
              trackBg: 'transparent',
              trackBgDisabled: 'transparent',
              trackHoverBg: 'transparent',
              railSize: 6,
            },
          },
        }}
      >
        <ColorRatioBlock
          value={c.value}
          setValue={(val) => setC({ value: val, hasMultiValue: false })}
          color="c"
        />
        <ColorRatioBlock
          value={m.value}
          setValue={(val) => setM({ value: val, hasMultiValue: false })}
          color="m"
        />
        <ColorRatioBlock
          value={y.value}
          setValue={(val) => setY({ value: val, hasMultiValue: false })}
          color="y"
        />
        <ColorRatioBlock
          value={k.value}
          setValue={(val) => setK({ value: val, hasMultiValue: false })}
          color="k"
        />
      </ConfigProvider>
    </Modal>
  );
};

export default ColorRationModal;
