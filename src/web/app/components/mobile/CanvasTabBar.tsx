import React, { useCallback, useContext, useState } from 'react';
import { Badge, TabBar } from 'antd-mobile';
import { FontSizeOutlined } from '@ant-design/icons';
import { PicturesOutline, RedoOutline, UndoOutline } from 'antd-mobile-icons';

import beamboxStore from 'app/stores/beambox-store';
import browser from 'implementations/browser';
import createNewText from 'app/svgedit/text/createNewText';
import dialogCaller from 'app/actions/dialog-caller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import svgEditor from 'app/actions/beambox/svg-editor';
import TabBarIcons from 'app/icons/tab-bar/TabBarIcons';
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
    changeToPreviewMode,
    showCameraPreviewDeviceList
  } = useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = useState('none');

  const resetActiveKey = useCallback(() => {
    setActiveKey('none');
  }, []);
  if (!isMobile) return null;

  const tabs = [
    {
      key: 'camera',
      title: lang.beambox.left_panel.label.preview,
      icon: <CameraIcon />
    },
    {
      key: 'image',
      title: lang.beambox.left_panel.label.photo,
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
      title: lang.beambox.left_panel.label.text,
      icon: <FontSizeOutlined />,
    },
    {
      key: 'layer',
      title: '圖層',
      icon: <LayersIcon />,
    },
    {
      key: 'pen',
      title: lang.beambox.left_panel.label.pen,
      icon: <PenIcon />,
    },
    {
      key: 'document',
      title: lang.topbar.menu.document_setting,
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

    if (key === 'camera') {
      changeToPreviewMode();
      if (!PreviewModeController.isPreviewMode()) showCameraPreviewDeviceList();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'image') {
      FnWrapper.importImage();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'text') {
      events.once('addText', resetActiveKey);
      createNewText(100, 100, 'Text', true);
    } else if (key === 'pen') {
      events.once('addPath', resetActiveKey);
      FnWrapper.insertPath();
    } else if (key === 'undo') {
      svgEditor.clickUndo();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'redo') {
      svgEditor.clickRedo();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'shape') {
      console.log('TODO: add shape panel');
      setTimeout(resetActiveKey, 300);
    } else if (key === 'document') {
      dialogCaller.showDocumentSettings();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'dmkt') {
      browser.open(lang.topbar.menu.link.design_market);
      setTimeout(resetActiveKey, 300);
    }
  };

  const previewTabItems = [
    {
      key: 'end-preview',
      title: lang.beambox.left_panel.label.end_preview,
      icon: <CameraIcon />,
    },
    {
      key: 'choose-preview-device',
      title: '選擇機型',
      icon: <TabBarIcons.Shoot />,
    },
    {
      key: 'image-trace',
      title: lang.beambox.left_panel.label.trace,
      icon: <TabBarIcons.Trace />,
      disabled: PreviewModeController.isDrawing || PreviewModeBackgroundDrawer.isClean(),
    },
    {
      key: 'clear-preview',
      title: lang.beambox.left_panel.label.clear_preview,
      icon: <TabBarIcons.Trash />,
      disabled: PreviewModeController.isDrawing || PreviewModeBackgroundDrawer.isClean(),
    },
  ];
  const handlePreviewTabClick = (key: string) => {
    if (key === 'end-preview') {
      endPreviewMode();
    } else if (key === 'choose-preview-device') {
      if (!PreviewModeController.isPreviewMode()) {
        showCameraPreviewDeviceList();
      }
    } else if (key === 'image-trace') {
      endPreviewMode();
      beamboxStore.emitShowCropper();
    } else if (key === 'clear-preview') {
      if (!PreviewModeBackgroundDrawer.isClean()) {
        PreviewModeBackgroundDrawer.resetCoordinates();
        PreviewModeBackgroundDrawer.clear();
      }
    }
  };

  return (
    <div id="mobile-tab-bar" className={styles.container}>
      <div style={{ width: '150%' }}>
        <TabBar
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            if (isPreviewing) handlePreviewTabClick(key);
            else handleTabClick(key);
          }}
        >
          {(isPreviewing ? previewTabItems : tabs).map((item) => (
            <TabBar.Item
              key={item.key}
              icon={item.icon}
              title={item.title}
              aria-disabled={item.disabled || false}
            />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default CanvasTabBar;
