import React, { useContext, useState } from 'react';
import { Badge, TabBar } from 'antd-mobile';
import { FontSizeOutlined } from '@ant-design/icons';
import { PicturesOutline, RedoOutline, UndoOutline } from 'antd-mobile-icons';

import browser from 'implementations/browser';
import dialogCaller from 'app/actions/dialog-caller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import svgEditor from 'app/actions/beambox/svg-editor';
import useI18n from 'helpers/useI18n';
import { CameraIcon, DmktIcon, LayersIcon, PenIcon, ShapesIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './CanvasTabBar.module.scss';

const events = eventEmitterFactory.createEventEmitter('canvas');

const CanvasTabBar = (): JSX.Element => {
  const isMobile = useIsMobile();
  const lang = useI18n();

  const {
    setDisplayLayer,
    isPreviewing,
    endPreviewMode,
    showCameraPreviewDeviceList
  } = useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = useState('none');
  if (!isMobile) return null;

  const tabs = [
    {
      key: 'camera',
      title: '相機',
      icon: <CameraIcon />
    },
    {
      key: 'image',
      title: '圖片',
      icon: <PicturesOutline />,
      badge: Badge.dot,
    },
    {
      key: 'shape',
      title: '形狀',
      icon: <ShapesIcon />,
    },
    {
      key: 'text',
      title: '文字',
      icon: <FontSizeOutlined />,
    },
    {
      key: 'layer',
      title: '圖層',
      icon: <LayersIcon />,
    },
    {
      key: 'pen',
      title: '鋼筆',
      icon: <PenIcon />,
    },
    {
      key: 'document',
      title: 't文件設定',
      icon: <PenIcon />,
    },
    {
      key: 'dmkt',
      title: 'DMKT',
      icon: <DmktIcon />,
    },
    {
      key: 'undo',
      title: '復原',
      icon: <UndoOutline />,
    },
    {
      key: 'redo',
      title: '重做',
      icon: <RedoOutline />
    },
  ];

  const handleTabClick = (key: string) => {
    setDisplayLayer(key === 'layer');
    const reset = () => {
      console.log('call reset');
      setActiveKey('none');
    };

    if (key === 'camera') {
      // showCameraPreviewDeviceList();
      console.log('TODO: show camera tab');
      setTimeout(reset, 300);
    } else if (key === 'image') {
      FnWrapper.importImage();
      setTimeout(reset, 300);
    } else if (key === 'text') {
      events.once('addText', () => reset());
      FnWrapper.insertText();
    } else if (key === 'pen') {
      events.once('addLine', () => reset());
      FnWrapper.insertPath();
    } else if (key === 'undo') {
      svgEditor.clickUndo();
      setTimeout(reset, 300);
    } else if (key === 'redo') {
      svgEditor.clickRedo();
      setTimeout(reset, 300);
    } else if (key === 'end-camera') {
      endPreviewMode();
      setTimeout(reset, 300);
    } else if (key === 'shape') {
      console.log('TODO: add shape panel');
      setTimeout(reset, 300);
    } else if (key === 'document') {
      dialogCaller.showDocumentSettings();
      setTimeout(reset, 300);
    } else if (key === 'dmkt') {
      browser.open(lang.topbar.menu.link.design_market);
      setTimeout(reset, 300);
    }
  };

  return (
    <div id="mobile-tab-bar" className={styles.container}>
      <div style={{ width: '150%' }}>
        <TabBar
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            handleTabClick(key);
          }}
        >
          {tabs.map((item) => (
            <TabBar.Item
              key={item.key}
              icon={item.icon}
              title={item.title}
              aria-disabled={!item.key.includes('camera') && isPreviewing}
            />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default CanvasTabBar;
