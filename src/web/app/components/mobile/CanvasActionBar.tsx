import * as React from 'react';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import { Badge, TabBar } from 'antd-mobile';
import { PenIcon, RedoIcon, TrashIcon, UndoIcon } from 'app/icons/icons';
import { CanvasContext, CanvasContextType } from 'app/contexts/CanvasContext';
import svgEditor from 'app/actions/beambox/svg-editor';

const CanvasActionBar = () => {
  const { displayLayer, setDisplayLayer, selectedElem } = React.useContext(CanvasContext) as CanvasContextType;
  const [activeKey, setActiveKey] = React.useState('dmkt');

  const tabs = [
    {
      key: 'trash',
      title: '刪除',
      icon: <TrashIcon />,
      disabled: (!selectedElem)
    },
  ];

  const handleTabClick = (key: string) => {
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
      zIndex: 998,
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
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} aria-disabled={item.disabled} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default CanvasActionBar;
