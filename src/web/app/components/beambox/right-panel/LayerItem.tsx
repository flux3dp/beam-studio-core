import * as React from 'react';
import classNames from 'classnames';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import {
  highlightLayer,
} from 'helpers/layer/layer-helper';
import { SettingOutlined } from '@ant-design/icons';

let svgCanvas: ISVGCanvas; let
  svgDrawing: ISVGDrawing;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgDrawing = svgCanvas.drawing;
});

interface Props {
  i: number;
  layerName: string;
  isSelected: boolean;
  isActive: boolean;
  fn: {
    handleLayerClick: (e: React.MouseEvent, layerName: string) => void;
    layerDoubleClick: () => void;
    onLayerCenterDragEnter: (layerName: string) => void;
    onLayerDragEnd: (e: React.DragEvent) => void;
    onLayerDragStart: (layerName: string, e: React.DragEvent) => void;
    onLayerTouchEnd: (e: React.TouchEvent) => void;
    onLayerTouchMove: (e: React.TouchEvent) => void;
    onLayerTouchStart: (layerName: string, e: React.TouchEvent) => void;
    onSensorAreaDragEnter: (index: number) => void;
    unlockLayers: (layerName: string) => void;
    setLayerVisibility: (layerName: string) => void;
    openLayerColorPanel: (e: React.MouseEvent, layerName: string) => void;
    openLayerSettings: (e: React.MouseEvent, layerName: string) => void;
  }
}

const LayerItem = (props: Props) => {
  const {
    i,
    layerName,
    isSelected,
    isActive,
    fn
  } = props;
  const drawing = svgCanvas.getCurrentDrawing();
  const layer = drawing.getLayerByName(layerName);
  const isLocked = layer.getAttribute('data-lock') === 'true';
  const isVis = drawing.getLayerVisibility(layerName);
  return (
    <div
      data-test-key={`layer-${i}`}
      key={layerName}
      className={classNames('layer', {
        layersel: isSelected,
        lock: isLocked,
        current: isActive
      })}
      onClick={(e: React.MouseEvent) => fn.handleLayerClick(e, layerName)}
      onMouseOver={() => highlightLayer(layerName)}
      onMouseOut={() => highlightLayer()}
      draggable
      onDragStart={(e: React.DragEvent) => fn.onLayerDragStart(layerName, e)}
      onDragEnd={fn.onLayerDragEnd}
      onTouchStart={(e: React.TouchEvent) => fn.onLayerTouchStart(layerName, e)}
      onTouchMove={fn.onLayerTouchMove}
      onTouchEnd={fn.onLayerTouchEnd}
      onFocus={() => { }}
      onBlur={() => { }}
    >
      <div
        className="drag-sensor-area"
        data-index={i + 1}
        onDragEnter={() => fn.onSensorAreaDragEnter(i + 1)}
      />
      <div
        className="layer-row"
        data-layer={layerName}
        onDragEnter={() => fn.onLayerCenterDragEnter(layerName)}
      >
        <div className="layercolor">
          <div
            id={`layerbackgroundColor-${i}`}
            style={{ backgroundColor: drawing.getLayerColor(layerName) }}
            onClick={(e) => fn.openLayerColorPanel(e, layerName)}
          />
        </div>
        <div
          id={`layerdoubleclick-${i}`}
          className="layername"
          onDoubleClick={(e) => {
            if (!e.ctrlKey && !e.shiftKey && !e.metaKey) fn.layerDoubleClick();
          }}
        >
          {layerName}
        </div>
        <div
          id={`layervis-${i}`}
          className="layervis"
          onClick={(e) => { e.stopPropagation(); fn.setLayerVisibility(layerName); }}
        >
          <img
            className="vis-icon"
            src={isVis
              ? 'img/right-panel/icon-eyeopen.svg'
              : 'img/right-panel/icon-eyeclose.svg'}
            alt="vis-icon"
          />
        </div>
        <div
          id={`layer-config-${i}`}
          className={classNames('layer-config', 'hidden-desktop')}
          onClick={(e) => {
            fn.openLayerSettings(e, layerName);
          }}
        >
          <SettingOutlined />
        </div>
        <div
          id={`layerlock-${i}`}
          className="layerlock"
          onClick={(e) => {
            if (isLocked) {
              e.stopPropagation();
              fn.unlockLayers(layerName);
            }
          }}
        >
          <img src="img/right-panel/icon-layerlock.svg" alt="lock-icon" />
        </div>
      </div>
      <div
        className="drag-sensor-area"
        data-index={i}
        onDragEnter={() => fn.onSensorAreaDragEnter(i)}
      />
    </div>
  );
};

export default LayerItem;
