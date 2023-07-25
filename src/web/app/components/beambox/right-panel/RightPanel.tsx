import React, { memo, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';

import LayerPanel from 'app/components/beambox/right-panel/LayerPanel';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import Tab from 'app/components/beambox/right-panel/Tab';
import { LayerPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/LayerPanelContext';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { RightPanelContext, RightPanelMode } from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { isMobile } from 'helpers/system-helper';

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

  const showLayerPanel = mode === 'element'
    && (selectedTab === 'layers' || !selectedElem)
    && (displayLayer || isMobile());

  let content;
  if (mode === 'path-edit') {
    content = <PathEditPanel />;
  } else if (selectedElem && selectedTab === 'objects') {
    content = <ObjectPanel elem={selectedElem} />;
  }
  const sideClass = classNames({
    short: window.os === 'Windows' && window.FLUX.version !== 'web',
    wide: window.os !== 'MacOS',
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
          <LayerPanelContextProvider>
            <LayerPanel
              hide={!showLayerPanel}
              elem={selectedElem}
            />
          </LayerPanelContextProvider>
        </ObjectPanelContextProvider>
      </div>
    </div>
  );
};
export default memo(RightPanel);
