import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import LayerPanel from 'app/components/beambox/right-panel/LayerPanel';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import Tab from 'app/components/beambox/right-panel/Tab';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import {
  RightPanelContext,
  RightPanelMode,
} from 'app/views/beambox/Right-Panels/contexts/RightPanelContext';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './RightPanel.module.scss';

let lastElement: Element;
let lastMode: RightPanelMode;

const RightPanel = (): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState<'layers' | 'objects'>('layers');
  const { displayLayer, setDisplayLayer } = useContext(CanvasContext);
  const { selectedElement } = useContext(SelectedElementContext);
  const { mode } = useContext(RightPanelContext);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (mode === 'element') {
      if (!selectedElement && selectedTab !== 'layers') {
        setSelectedTab('layers');
      } else if (selectedElement && !lastElement) {
        setSelectedTab('objects');
      }
    } else if (lastMode !== mode) {
      setSelectedTab('objects');
    }
    if (isMobile) {
      if (displayLayer) {
        setSelectedTab('layers');
      } else {
        setSelectedTab('objects');
      }
    }
    lastMode = mode;
    lastElement = selectedElement;
  }, [mode, selectedElement, selectedTab, displayLayer, isMobile]);

  const showLayerPanel =
    mode === 'element' &&
    (selectedTab === 'layers' || !selectedElement) &&
    (displayLayer || !isMobile);

  let content;
  if (mode === 'path-edit') {
    content = <PathEditPanel />;
  } else if (selectedElement && selectedTab === 'objects') {
    content = <ObjectPanel />;
  }
  const sideClass = classNames(styles.sidepanels, {
    [styles.short]: window.os === 'Windows' && window.FLUX.version !== 'web',
    [styles.wide]: window.os !== 'MacOS',
  });
  return (
    <div id="right-panel" style={{ display: 'block' }}>
      <div id="sidepanels" className={sideClass}>
        <Tab mode={mode} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <ObjectPanelContextProvider>
          <ObjectPanelItem.Mask />
          {content}
        </ObjectPanelContextProvider>
        <LayerPanel hide={!showLayerPanel} setDisplayLayer={setDisplayLayer} />
      </div>
    </div>
  );
};
export default memo(RightPanel);
