import Icon from '@ant-design/icons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Badge, TabBar } from 'antd-mobile';

import beamboxStore from 'app/stores/beambox-store';
import browser from 'implementations/browser';
import createNewText from 'app/svgedit/text/createNewText';
import dialogCaller from 'app/actions/dialog-caller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import ShapePanel from 'app/views/beambox/ShapePanel/ShapePanel';
import svgEditor from 'app/actions/beambox/svg-editor';
import TabBarIcons from 'app/icons/tab-bar/TabBarIcons';
import useI18n from 'helpers/useI18n';
import { CameraIcon, DmktIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { useIsMobile } from 'helpers/system-helper';

import styles from './CanvasTabBar.module.scss';

const events = eventEmitterFactory.createEventEmitter('canvas');
const dpmm = 96 / 25.4;
let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const CanvasTabBar = (): JSX.Element => {
  const isMobile = useIsMobile();
  const lang = useI18n();

  const {
    displayLayer,
    setDisplayLayer,
    isPreviewing,
    endPreviewMode,
    changeToPreviewMode,
    showCameraPreviewDeviceList,
  } = useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = useState('none');

  useEffect(() => {
    if (activeKey === 'layer' && !displayLayer) {
      setActiveKey('none');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLayer]);

  const resetActiveKey = useCallback(() => {
    setActiveKey('none');
  }, []);
  if (!isMobile) return null;

  const tabs = [
    {
      key: 'camera',
      title: lang.beambox.left_panel.label.choose_camera,
      icon: <CameraIcon style={{}} />,
    },
    {
      key: 'image',
      title: lang.beambox.left_panel.label.photo,
      icon: <TabBarIcons.Photo />,
      badge: Badge.dot,
    },
    {
      key: 'shape',
      title: lang.beambox.left_panel.label.shapes,
      icon: <TabBarIcons.Shape />,
    },
    {
      key: 'text',
      title: lang.beambox.left_panel.label.text,
      icon: <TabBarIcons.Text />,
    },
    {
      key: 'layer',
      title: lang.topbar.menu.layer_setting,
      icon: (
        <div
          onClick={() => {
            if (activeKey === 'layer' && displayLayer) {
              setDisplayLayer(false);
              setActiveKey('none');
            }
          }}
        >
          <TabBarIcons.Layers />
        </div>
      ),
    },
    {
      key: 'pen',
      title: lang.beambox.left_panel.label.pen,
      icon: <TabBarIcons.Draw />,
    },
    {
      key: 'document',
      title: lang.topbar.menu.document_setting_short,
      icon: <TabBarIcons.Document />,
    },
    {
      key: 'dmkt',
      title: 'DMKT',
      icon: <DmktIcon style={{ fontSize: 40 }} />,
    },
    {
      key: '',
      title: '',
      icon: <div className={styles.sep} />,
    },
    {
      key: 'undo',
      title: lang.topbar.menu.undo,
      icon: <Icon component={TabBarIcons.Undo} viewBox="2 2 16 16" />,
    },
    {
      key: 'redo',
      title: lang.topbar.menu.redo,
      icon: <Icon component={TabBarIcons.Redo} viewBox="2 2 16 16" />,
    },
  ];

  const handleTabClick = (key: string) => {
    svgCanvas.setMode('select');
    setDisplayLayer(key === 'layer');

    if (key === 'camera') {
      changeToPreviewMode();
      if (!PreviewModeController.isPreviewMode()) showCameraPreviewDeviceList();
      setActiveKey('choose-preview-device');
      setTimeout(resetActiveKey, 300);
    } else if (key === 'image') {
      FnWrapper.importImage();
      setTimeout(resetActiveKey, 300);
    } else if (key === 'text') {
      events.once('addText', (newText: HTMLElement) => {
        svgEditor.zoomChanged(window, {
          zoomLevel: window.innerWidth / newText.clientWidth / dpmm,
        });
        newText.scrollIntoView({ block: 'center', inline: 'center' });
        resetActiveKey();
      });
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
      console.log('open shape panel');
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
      title: lang.beambox.left_panel.label.choose_camera,
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
    setTimeout(resetActiveKey, 300);
  };

  return (
    <>
      <div
        id="mobile-tab-bar"
        className={styles.container}
        onClick={() => ObjectPanelController.updateActiveKey(null)}
      >
        <div style={{ width: 'fit-content' }}>
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
      {activeKey === 'shape' && <ShapePanel onClose={resetActiveKey} />}
    </>
  );
};

export default CanvasTabBar;
