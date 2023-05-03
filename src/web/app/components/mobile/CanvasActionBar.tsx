import * as React from 'react';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import { Badge, TabBar } from 'antd-mobile';
import { PenIcon, RedoIcon, TrashIcon, UndoIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';
import svgEditor from 'app/actions/beambox/svg-editor';

const CanvasActionBar = () => {
  const { displayLayer, setDisplayLayer } = React.useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = React.useState('dmkt');

  const tabs = [
    {
      key: 'trash',
      title: '刪除',
      icon: <TrashIcon />,
    },
    {
      key: 'undo',
      title: '復原',
      icon: <UndoIcon />,
    },
    {
      key: 'redo',
      title: '重做',
      icon: <RedoIcon />,
    },
  ];

  const handleTabClick = (key: string) => {
    if (key === 'undo') {
      svgEditor.clickUndo();
    }
    if (key === 'redo') {
      svgEditor.clickRedo();
    }
    if (key === 'trash') {
      svgEditor.deleteSelected();
    }
    setActiveKey('dmkt');
  };

  return (
    <div style={{
      position: 'fixed',
      width: '100%',
      borderTop: 'solid 1px #CCC',
      background: '#FFFFFF',
      zIndex: 9999,
      overflowX: 'scroll',
      bottom: 50,
    }}
    >
      <div style={{ width: '100%' }}>
        <TabBar
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            handleTabClick(key);
          }}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default CanvasActionBar;
