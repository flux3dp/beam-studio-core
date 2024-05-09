import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LayerPanel from 'app/components/beambox/right-panel/LayerPanel';
import ObjectPanel from 'app/views/beambox/Right-Panels/ObjectPanel';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import PathEditPanel from 'app/views/beambox/Right-Panels/PathEditPanel';
import Tab from 'app/components/beambox/right-panel/Tab';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { ObjectPanelContextProvider } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';
import { PanelType } from 'app/constants/right-panel-types';
import { SelectedElementContext } from 'app/contexts/SelectedElementContext';
import { useIsMobile } from 'helpers/system-helper';

import styles from './RightPanel.module.scss';

const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

const RightPanel = (): JSX.Element => {
  const lastElementRef = useRef<Element>();
  const lastPathEditingRef = useRef<boolean>(false);
  const { isPathEditing } = useContext(CanvasContext);
  const { selectedElement } = useContext(SelectedElementContext);
  const isMobile = useIsMobile();
  const [panelType, setPanelType] = useState<PanelType>(isMobile ? PanelType.None : PanelType.Layer);

  useEffect(() => {
    const handler = (val: boolean) => {
      if (!isMobile) return;
      setPanelType((cur) => {
        if (val) {
          if (cur !== PanelType.Layer) return PanelType.Layer;
          return cur;
        }
        if (cur === PanelType.Layer) return PanelType.None;
        return cur;
      });
    };
     rightPanelEventEmitter.on('DISPLAY_LAYER', handler);
    return () => {
      rightPanelEventEmitter.off('DISPLAY_LAYER', handler);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isPathEditing) {
      if (isMobile) {
        if (panelType === PanelType.Layer) return;
        if (!selectedElement && panelType !== PanelType.None) setPanelType(PanelType.None);
        else if (selectedElement && panelType !== PanelType.Object) setPanelType(PanelType.Object);
      } else if (panelType === PanelType.None || panelType === PanelType.PathEdit) {
        setPanelType(PanelType.Layer);
        // Keep old behavior in case we need to add preference for this
        // if (!selectedElement) {
        //   setPanelType(PanelType.Layer);
        // } else if (!lastElementRef.current) {
        //   setPanelType(PanelType.Object);
        // }
      }
    } else if (isPathEditing !== lastPathEditingRef.current) {
      setPanelType(PanelType.PathEdit);
    }
    lastPathEditingRef.current = isPathEditing;
    lastElementRef.current = selectedElement;
  }, [isPathEditing, selectedElement, isMobile, panelType]);

  const switchPanel = useCallback(() => {
    if (panelType === PanelType.Layer || panelType === PanelType.None) {
      setPanelType(isPathEditing ? PanelType.PathEdit : PanelType.Object);
    } else setPanelType(PanelType.Layer);
  }, [panelType, isPathEditing]);

  const sideClass = classNames(styles.sidepanels, {
    [styles.short]: window.os === 'Windows' && window.FLUX.version !== 'web',
    [styles.wide]: window.os !== 'MacOS',
  });
  return (
    <div id="right-panel" style={{ display: 'block' }}>
      <div id="sidepanels" className={sideClass}>
        <Tab panelType={panelType} switchPanel={switchPanel} />
        <ObjectPanelContextProvider>
          <ObjectPanelItem.Mask />
          {panelType === PanelType.PathEdit && <PathEditPanel />}
          <ObjectPanel hide={panelType !== PanelType.Object} />
          <LayerPanel hide={panelType !== PanelType.Layer} />
        </ObjectPanelContextProvider>
      </div>
    </div>
  );
};
export default memo(RightPanel);
