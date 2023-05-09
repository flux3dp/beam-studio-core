import * as React from 'react';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import { Badge, TabBar } from 'antd-mobile';
import {
  PicturesOutline, RedoOutline, UndoOutline,
} from 'antd-mobile-icons';
import { DatabaseOutlined, FireOutlined, FontSizeOutlined, LineOutlined, ShopOutlined } from '@ant-design/icons';
import { CameraIcon, PenIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';
import svgEditor from 'app/actions/beambox/svg-editor';

const CanvasTabBar = () => {
  const { displayLayer,
    setDisplayLayer,
    isPreviewing,
    changeToPreviewMode,
    endPreviewMode,
    showCameraPreviewDeviceList } = React.useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = React.useState('none');

  const tabs = [
    {
      key: 'image',
      title: '圖片',
      icon: <PicturesOutline />,
      badge: Badge.dot,
    },
    {
      key: 'text',
      title: '文字',
      icon: <FontSizeOutlined />,
    },
    {
      key: 'layer',
      title: '圖層',
      icon: <DatabaseOutlined />,
    },
    {
      key: 'shape',
      title: '形狀',
      icon: <FireOutlined />,
    },
    {
      key: 'lines',
      title: '線段',
      icon: <LineOutlined />,
    },
    {
      key: 'pen',
      title: '鋼筆',
      icon: <PenIcon />,
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
    {
      key: 'camera',
      title: isPreviewing ? '關閉相機' : '相機',
      icon: <CameraIcon />
    },
    {
      key: 'dmkt',
      title: '市集',
      icon: <ShopOutlined />,
    },
  ];

  const handleTabClick = (key: string) => {
    setDisplayLayer(key === 'layer');
    const reset =  () => {
      console.log('call reset');
      setActiveKey('none');
    };

    if (key === 'image') {
      FnWrapper.events().once('addImage', () => reset());
      FnWrapper.importImage();
    }
    if (key === 'text') {
      FnWrapper.events().once('addText', () => reset());
      FnWrapper.insertText();
    }
    if (key === 'pen') {
      FnWrapper.events().once('addLine', () => reset());
      FnWrapper.insertPath();
    }
    if (key === 'lines') {
      FnWrapper.events().once('addLine', () => reset());
      FnWrapper.insertLine();
    }
    if (key === 'undo') {
      svgEditor.clickUndo();
      setTimeout(reset, 500);
    }
    if (key === 'redo') {
      svgEditor.clickRedo();

      setTimeout(reset, 500);
    }

    if (key === 'camera') {
      if (isPreviewing) {
        endPreviewMode();
      } else {
        showCameraPreviewDeviceList();
      }
    }
    ;
  };

  return (
    <div id="mobile-tab-bar">
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
              aria-disabled={item.key !== 'camera' && isPreviewing}
            />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default CanvasTabBar;
