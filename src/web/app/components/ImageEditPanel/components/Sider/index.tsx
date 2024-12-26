/* eslint-disable @typescript-eslint/no-shadow */
import React, { memo } from 'react';

import { Button, Flex, TabPaneProps, Tabs } from 'antd';
import useI18n from 'helpers/useI18n';

import ImageEditPanelIcons from 'app/icons/image-edit-panel/ImageEditPanelIcons';
import BackButton from 'app/widgets/FullWindowPanel/BackButton';
import Footer from 'app/widgets/FullWindowPanel/Footer';
import Header from 'app/widgets/FullWindowPanel/Header';
import FullWindowPanelSider from 'app/widgets/FullWindowPanel/Sider';

import Eraser from './Eraser';
import MagicWand from './MagicWand';

import styles from './index.module.scss';

interface Props {
  onClose: () => void;
  handleComplete: () => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tolerance: number;
  setTolerance: (tolerance: number) => void;
  mode: 'eraser' | 'magicWand';
  setMode: (mode: 'eraser' | 'magicWand') => void;
  setOperation: (operation: 'eraser' | 'magicWand' | 'drag' | null) => void;
}

interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: React.ReactNode;
}

function Sider({
  onClose,
  handleComplete,
  brushSize,
  setBrushSize,
  tolerance,
  setTolerance,
  mode,
  setMode,
  setOperation,
}: Props): JSX.Element {
  const lang = useI18n();
  const t = lang.beambox.photo_edit_panel;

  const tabItems: Array<Tab> = [
    {
      key: 'eraser',
      label: 'Eraser',
      children: <Eraser brushSize={brushSize} setBrushSize={setBrushSize} />,
      icon: <ImageEditPanelIcons.Eraser />,
    },
    {
      key: 'magicWand',
      label: 'Magic Wand',
      children: <MagicWand tolerance={tolerance} setTolerance={setTolerance} />,
      icon: <ImageEditPanelIcons.MagicWand />,
    },
  ];

  return (
    <FullWindowPanelSider className={styles.sider}>
      <Flex style={{ height: '100%' }} vertical justify="space-between">
        <div>
          <BackButton onClose={onClose}>{lang.buttons.back_to_beam_studio}</BackButton>
          <Header icon={<ImageEditPanelIcons.EditImage />} title="Edit Image" />
          <Tabs
            centered
            size="large"
            activeKey={mode}
            items={tabItems}
            onChange={(mode: 'eraser' | 'magicWand') => {
              setOperation(null);
              setMode(mode);
            }}
          />
        </div>
        <Footer>
          <Button key="ok" type="primary" onClick={handleComplete}>
            {t.okay}
          </Button>
        </Footer>
      </Flex>
    </FullWindowPanelSider>
  );
}

const MemorizedSider = memo(Sider);

export default MemorizedSider;
