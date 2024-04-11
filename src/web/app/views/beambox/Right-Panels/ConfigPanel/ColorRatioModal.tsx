import React, { useContext, useState } from 'react';
import { Col, ConfigProvider, Modal, Row } from 'antd';

import useI18n from 'helpers/useI18n';
import { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';
import { IConfig } from 'interfaces/ILayerConfig';

import ConfigPanelContext from './ConfigPanelContext';
import ColorRatioBlock from './ColorRatioBlock';

interface Props {
  fullColor?: boolean;
  onClose: () => void;
}

// TODO: add test
const ColorRationModal = ({ fullColor, onClose }: Props): JSX.Element => {
  const t = useI18n().beambox.right_panel.laser_panel;
  const { dispatch, selectedLayers, state } = useContext(ConfigPanelContext);
  const [draftValue, setDraftValue] = useState<{ [key: string]: IConfig<number> }>({
    cRatio: state.cRatio,
    cSmooth: state.cSmooth,
    mRatio: state.mRatio,
    mSmooth: state.mSmooth,
    yRatio: state.yRatio,
    ySmooth: state.ySmooth,
    kRatio: state.kRatio,
    kSmooth: state.kSmooth,
    printingStrength: state.printingStrength,
    smooth: state.smooth,
  });
  const handleSave = () => {
    const newState = { ...state };
    const keys = fullColor
      ? ['cRatio', 'cSmooth', 'mRatio', 'mSmooth', 'yRatio', 'ySmooth', 'kRatio', 'kSmooth']
      : ['printingStrength', 'smooth'];
    selectedLayers.forEach((layerName) => {
      const layer = getLayerByName(layerName);
      keys.forEach((key) => {
        if (
          state[key].value !== draftValue[key].value ||
          state[key].hasMultiValue !== draftValue[key].hasMultiValue
        ) {
          writeDataLayer(layer, DataType[key], draftValue[key].value);
          newState[key] = draftValue[key];
        }
      });
    });
    dispatch({ type: 'update', payload: newState });
    onClose();
  };
  const handleValueChange = (key: string, value: number) => {
    setDraftValue((cur) => ({ ...cur, [key]: { value, hasMultiValue: false } }));
  };

  return (
    <Modal
      centered
      open
      maskClosable={false}
      width={fullColor ? 600 : 300}
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
        {fullColor ? (
          <>
            <Row gutter={[10, 0]}>
              <Col span={12}>
                <ColorRatioBlock
                  color="c"
                  ratio={draftValue.cRatio.value}
                  setRatio={(val) => handleValueChange('cRatio', val)}
                  smooth={draftValue.cSmooth.value}
                  setSmooth={(val) => handleValueChange('cSmooth', val)}
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="m"
                  ratio={draftValue.mRatio.value}
                  setRatio={(val) => handleValueChange('mRatio', val)}
                  smooth={draftValue.mSmooth.value}
                  setSmooth={(val) => handleValueChange('mSmooth', val)}
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="y"
                  ratio={draftValue.yRatio.value}
                  setRatio={(val) => handleValueChange('yRatio', val)}
                  smooth={draftValue.ySmooth.value}
                  setSmooth={(val) => handleValueChange('ySmooth', val)}
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="k"
                  ratio={draftValue.kRatio.value}
                  setRatio={(val) => handleValueChange('kRatio', val)}
                  smooth={draftValue.kSmooth.value}
                  setSmooth={(val) => handleValueChange('kSmooth', val)}
                />
              </Col>
            </Row>
          </>
        ) : (
          <ColorRatioBlock
            ratio={draftValue.printingStrength.value}
            setRatio={(val) => handleValueChange('printingStrength', val)}
            smooth={draftValue.smooth.value}
            setSmooth={(val) => handleValueChange('smooth', val)}
          />
        )}
      </ConfigProvider>
    </Modal>
  );
};

export default ColorRationModal;
