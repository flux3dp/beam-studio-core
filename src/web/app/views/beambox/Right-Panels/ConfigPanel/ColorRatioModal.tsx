import React, { useContext, useMemo, useState } from 'react';
import { Col, ConfigProvider, Modal, Row } from 'antd';

import useI18n from 'helpers/useI18n';
import { DataType, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';
import { IConfig } from 'interfaces/ILayerConfig';
import { PrintingColors } from 'app/constants/color-constants';

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
    mRatio: state.mRatio,
    yRatio: state.yRatio,
    kRatio: state.kRatio,
    printingStrength: state.printingStrength,
  });
  const handleSave = () => {
    const newState = { ...state };
    const keys = fullColor ? ['cRatio', 'mRatio', 'yRatio', 'kRatio'] : ['printingStrength'];
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
  const colorLayer = useMemo<'c' | 'm' | 'y' | 'k' | undefined>(
    () =>
      state.color.hasMultiValue
        ? undefined
        : ({
            [PrintingColors.CYAN]: 'c',
            [PrintingColors.MAGENTA]: 'm',
            [PrintingColors.YELLOW]: 'y',
            [PrintingColors.BLACK]: 'k',
          }[state.color.value] as 'c' | 'm' | 'y' | 'k') || undefined,
    [state.color.hasMultiValue, state.color.value]
  );

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
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="m"
                  ratio={draftValue.mRatio.value}
                  setRatio={(val) => handleValueChange('mRatio', val)}
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="y"
                  ratio={draftValue.yRatio.value}
                  setRatio={(val) => handleValueChange('yRatio', val)}
                />
              </Col>
              <Col span={12}>
                <ColorRatioBlock
                  color="k"
                  ratio={draftValue.kRatio.value}
                  setRatio={(val) => handleValueChange('kRatio', val)}
                />
              </Col>
            </Row>
          </>
        ) : (
          <ColorRatioBlock
            ratio={draftValue.printingStrength.value}
            setRatio={(val) => handleValueChange('printingStrength', val)}
            color={colorLayer}
          />
        )}
      </ConfigProvider>
    </Modal>
  );
};

export default ColorRationModal;
