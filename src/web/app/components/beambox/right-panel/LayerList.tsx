/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import * as React from 'react';
import classNames from 'classnames';

import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveLayersToPosition, setLayersLock } from 'helpers/layer-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

interface Props {
  selectedLayers: string[];
  draggingDestIndex: number;
  setSelectedLayers: (selectedLayers: string[]) => void;
  highlightLayer: (layerName?: string) => void;
  updateDraggingLayer: (layerName: string) => void;
  updateDraggingDestIndex: (layerIndex: number) => void;
  updateColorPanel: (colorPanel: {
    colorPanelLayer: string;
    colorPanelLeft: number;
    colorPanelTop: number;
  }) => void;
  renameLayer: () => void;
}

function LayerList({
  selectedLayers,
  draggingDestIndex = null,
  setSelectedLayers,
  highlightLayer,
  updateDraggingLayer,
  updateDraggingDestIndex,
  updateColorPanel,
  renameLayer,
}: Props): JSX.Element {
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const items = [];
  const drawing = svgCanvas.getCurrentDrawing();
  const currentLayerName = drawing.getCurrentLayerName();

  const isAnyLayerMissing = drawing.all_layers.some((layer) => !layer.group_.parentNode);
  if (isAnyLayerMissing) {
    drawing.identifyLayers();
  }

  const allLayerNames: string[] = drawing.all_layers.map((layer) => layer.name_);
  const renderDragBar = (): JSX.Element => <div key="drag-bar" className={classNames('drag-bar')} />;

  if (draggingDestIndex === allLayerNames.length) {
    items.push(renderDragBar());
  }

  const toggleLayerSelected = (layerName: string): void => {
    const index = selectedLayers.findIndex((name: string) => name === layerName);
    if (index >= 0) {
      if (selectedLayers.length > 1) {
        selectedLayers.splice(index, 1);
        drawing.setCurrentLayer(selectedLayers[0]);
      }
    } else {
      selectedLayers.push(layerName);
      drawing.setCurrentLayer(layerName);
    }
    setSelectedLayers(selectedLayers);
  };

  const toggleContiguousSelectedUntil = (layerName: string): void => {
    const allLayers: string[] = drawing.all_layers.map((layer) => layer.name_);
    let [startIndex, endIndex] = [-1, -1];

    for (let i = 0; i < allLayers.length; i += 1) {
      if (allLayers[i] === drawing.getCurrentLayerName()) {
        startIndex = i;
      }
      if (allLayers[i] === layerName) {
        endIndex = i;
      }
      if (startIndex > -1 && endIndex > -1) break;
    }
    if (startIndex < 0 || endIndex < 0) return;

    const isLayerSelected = selectedLayers.includes(layerName);

    for (let i = startIndex; i !== endIndex; endIndex > startIndex ? i += 1 : i -= 1) {
      const index = selectedLayers.findIndex((name) => name === allLayers[i]);
      if (isLayerSelected && index >= 0) {
        selectedLayers.splice(index, 1);
      } else if (!isLayerSelected && index < 0) {
        selectedLayers.push(allLayers[i]);
      }
    }
    if (!selectedLayers.includes(layerName)) {
      selectedLayers.push(layerName);
    }
    drawing.setCurrentLayer(layerName);
    setSelectedLayers(selectedLayers);
  };

  const selectOnlyLayer = (layerName: string): void => {
    svgCanvas.clearSelection();
    const res = drawing.setCurrentLayer(layerName);
    if (res) {
      setSelectedLayers([layerName]);
    }
  };

  const handleLayerClick = (e: React.MouseEvent, layerName: string): void => {
    const isCtrlOrCmd = (window.os === 'MacOS' && e.metaKey) || (window.os !== 'MacOS' && e.ctrlKey);
    if (e.button === 0) {
      if (isCtrlOrCmd) {
        toggleLayerSelected(layerName);
      } else if (e.shiftKey) {
        toggleContiguousSelectedUntil(layerName);
      } else {
        selectOnlyLayer(layerName);
      }
    } else if (e.button === 2) {
      if (!selectedLayers.includes(layerName)) {
        selectOnlyLayer(layerName);
      }
    }
  };

  const onlayerDragStart = (e: React.DragEvent, layerName: string): void => {
    const dragImage = document.getElementById('drag-image') as Element;
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    if (!selectedLayers.includes(layerName)) {
      setSelectedLayers([layerName]);
    }
    updateDraggingLayer(layerName);
  };

  const onlayerDragEnd = (): void => {
    if (draggingDestIndex !== null) {
      moveLayersToPosition(selectedLayers, draggingDestIndex);
      svgCanvas.sortTempGroupByLayer();
    }
    updateDraggingLayer(null);
    updateDraggingDestIndex(null);
  };

  const onSensorAreaDragEnter = (index: number): void => {
    if (index !== draggingDestIndex) {
      updateDraggingDestIndex(index);
    }
  };

  const onlayerCenterDragEnter = (layerName: string): void => {
    if (selectedLayers.includes(layerName)) {
      updateDraggingDestIndex(null);
    }
  };

  const openLayerColorPanel = (e: React.MouseEvent, layerName: string): void => {
    e.stopPropagation();
    updateColorPanel({
      colorPanelLayer: layerName,
      colorPanelLeft: e.clientX,
      colorPanelTop: e.clientY,
    });
  };

  const setLayerVisibility = (layerName: string): void => {
    const isVis = drawing.getLayerVisibility(layerName);
    if (selectedLayers.includes(layerName)) {
      for (let i = 0; i < selectedLayers.length; i += 1) {
        svgCanvas.setLayerVisibility(selectedLayers[i], !isVis);
      }
    } else {
      svgCanvas.setLayerVisibility(layerName, !isVis);
    }
    forceUpdate();
  };

  const unLockLayers = (layerName: string): void => {
    if (selectedLayers.includes(layerName)) {
      setLayersLock(selectedLayers, false);
      forceUpdate();
    } else {
      setLayersLock([layerName], false);
      setSelectedLayers([layerName]);
    }
  };

  for (let i = allLayerNames.length - 1; i >= 0; i -= 1) {
    const layerName = allLayerNames[i];
    const layer = drawing.getLayerByName(layerName);
    if (layer) {
      const isLocked = layer.getAttribute('data-lock') === 'true';
      const isSelected = selectedLayers.includes(layerName);
      const isVis = drawing.getLayerVisibility(layerName);
      items.push(
        <div
          key={layerName}
          className={classNames('layer', { layersel: isSelected, lock: isLocked, current: currentLayerName === layerName })}
          onClick={(e: React.MouseEvent) => handleLayerClick(e, layerName)}
          onMouseOver={() => highlightLayer(layerName)}
          onMouseOut={highlightLayer}
          draggable
          onDragStart={(e: React.DragEvent) => onlayerDragStart(e, layerName)}
          onDragEnd={onlayerDragEnd}
        >
          <div className="drag-sensor-area" onDragEnter={() => onSensorAreaDragEnter(i + 1)} />
          <div className="layer-row" onDragEnter={() => onlayerCenterDragEnter(layerName)}>
            <div className="layercolor">
              <div
                style={{ backgroundColor: drawing.getLayerColor(layerName) }}
                onClick={(e: React.MouseEvent) => openLayerColorPanel(e, layerName)}
              />
            </div>
            <div
              className="layername"
              onDoubleClick={(e: React.MouseEvent) => {
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey) renameLayer();
              }}
            >
              {layerName}
            </div>
            <div
              className={classNames('layervis')}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setLayerVisibility(layerName);
              }}
            >
              <img className="vis-icon" src={isVis ? 'img/right-panel/icon-eyeopen.svg' : 'img/right-panel/icon-eyeclose.svg'} alt="vis-icon" />
            </div>
            <div
              className="layerlock"
              onClick={(e: React.MouseEvent) => {
                if (isLocked) {
                  e.stopPropagation();
                  unLockLayers(layerName);
                }
              }}
            >
              <img src="img/right-panel/icon-layerlock.svg" alt="lock-icon" />
            </div>
          </div>
          <div className="drag-sensor-area" onDragEnter={() => onSensorAreaDragEnter(i)} />
        </div>,
      );
      if (draggingDestIndex === i) {
        items.push(renderDragBar());
      }
    }
  }

  return (<div id="layerlist">{items}</div>);
}

export default LayerList;
