import * as React from 'react';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import { Badge, TabBar } from 'antd-mobile';
import {
  PicturesOutline,
} from 'antd-mobile-icons';
import { DatabaseOutlined, FireOutlined, FontSizeOutlined, LineOutlined, ShopOutlined } from '@ant-design/icons';
import { CameraIcon, PenIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';

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

    if (key === 'image') {
      FnWrapper.importImage();
    }
    if (key === 'text') {
      FnWrapper.insertText();
    }
    if (key === 'pen') {
      FnWrapper.insertPath();
    }
    if (key === 'lines') {
      FnWrapper.insertLine();
    }
    if (key === 'camera') {
      if (isPreviewing) {
        endPreviewMode();
      } else {
        showCameraPreviewDeviceList();
      }
    }
    setActiveKey('none');
  };

  return (
    <div style={{
      position: 'fixed',
      width: '100%',
      borderTop: 'solid 1px #CCC',
      background: '#FFFFFF',
      zIndex: 998,
      overflowX: 'scroll',
      bottom: 0,
    }}
    >
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
