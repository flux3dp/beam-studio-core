import * as React from 'react';
import classNames from 'classnames';

import LayerPanel from 'app/components/beambox/right-panel/LayerPanel';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import Tab from 'app/components/beambox/right-panel/Tab';
import { LayerPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { RightPanelContext, RightPanelMode } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';
import { useContext, useEffect, useState } from 'react';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { isMobile } from 'helpers/system-helper';

import styles from './RightPanel.module.scss';

let lastElement: Element;
let lastMode: RightPanelMode;

const RightPanel = (): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState<'layers' | 'objects'>('layers');
  const { displayLayer, selectedElem } = useContext(CanvasContext);
  const { mode } = useContext(RightPanelContext);

  useEffect(() => {
    if (mode === 'element') {
      if (!selectedElem && selectedTab !== 'layers') {
        setSelectedTab('layers');
      } else if (selectedElem && !lastElement) {
        setSelectedTab('objects');
      }
    } else if (lastMode !== mode) {
      setSelectedTab('objects');
    }
    lastMode = mode;
    lastElement = selectedElem;
  }, [mode, selectedElem, selectedTab]);

  const renderLayerAndLaserPanel = () => (
    <LayerPanelContextProvider>
      <LayerPanel
        elem={selectedElem}
      />
    </LayerPanelContextProvider>
  );

  const renderObjectPanel = () => (
    <ObjectPanel
      elem={selectedElem}
    />
  );

  let content;
  if (mode === 'path-edit') {
    content = <PathEditPanel />;
  } else if (selectedTab === 'layers' || !selectedElem) { // element mode
    if (!displayLayer && isMobile()) return <div />;
    content = renderLayerAndLaserPanel();
  } else {
    content = renderObjectPanel();
  }
  const sideClass = classNames(styles.sidepanels, {
    [styles.short]: window.os === 'Windows' && window.FLUX.version !== 'web',
    [styles.wide]: window.os !== 'MacOS',
  });
  return (
    <div id="right-panel" style={{ display: 'block' }}>
      <div id="sidepanels" className={sideClass}>
        <Tab
          mode={mode}
          selectedElement={selectedElem}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <ObjectPanelContextProvider>
          {content}
        </ObjectPanelContextProvider>
      </div>
    </div>
  );
};
export default RightPanel;
