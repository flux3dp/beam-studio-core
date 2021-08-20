import * as React from 'react';
import classNames from 'classnames';

import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  selectedLayers: string[];
  draggingLayer: string;
}

function DragImage({ selectedLayers, draggingLayer = null }: Props): JSX.Element {
  if (!draggingLayer) return (<div id="drag-image" />);

  const drawing = svgCanvas.getCurrentDrawing();
  const layer = drawing.getLayerByName(draggingLayer);
  if (!layer) return (<div id="drag-image" />);

  const isLocked = layer.getAttribute('data-lock') === 'true';
  const isVis = drawing.getLayerVisibility(draggingLayer);
  const backLayers = [];
  for (let i = selectedLayers.length - 1; i >= 1; i -= 1) {
    backLayers.push(<div className="layer-back" key={i} style={{ top: -10 * i, left: 10 * i }} />);
  }

  return (
    <div id="drag-image">
      {backLayers}
      <div className={classNames('layer', 'layersel', { lock: isLocked })}>
        <div className="drag-sensor-area" />
        <div className="layer-row">
          <div className="layercolor">
            <div style={{ backgroundColor: drawing.getLayerColor(draggingLayer) }} />
          </div>
          <div className="layername">{draggingLayer}</div>
          <div className={classNames('layervis', { layerinvis: !drawing.getLayerVisibility(draggingLayer) })}>
            <img className="vis-icon" src={isVis ? 'img/right-panel/icon-eyeopen.svg' : 'img/right-panel/icon-eyeclose.svg'} alt="vis-icon" />
          </div>
          <div className="layerlock">
            <img src="img/right-panel/icon-layerlock.svg" alt="lock-icon" />
          </div>
        </div>
        <div className="drag-sensor-area" />
      </div>
    </div>
  );
}

export default DragImage;
