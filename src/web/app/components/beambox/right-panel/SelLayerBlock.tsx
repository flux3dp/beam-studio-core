import React, { useContext, memo } from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { getObjectLayer } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const defaultOption = ' ';

function SelLayerBlock(): JSX.Element {
  const lang = useI18n().beambox.right_panel.layer_panel;
  const [promptMoveLayerOnce, setPromptMoveLayerOnce] = React.useState(false);
  const { selectedElem } = useContext(CanvasContext);
  if (!selectedElem) return null;

  const drawing = svgCanvas.getCurrentDrawing();
  const layerCount = drawing.getNumLayers();
  if (layerCount === 1) return null;


  const moveToOtherLayer = (e: React.ChangeEvent): void => {
    const select = e.target as HTMLSelectElement;
    const destLayer = select.options[select.selectedIndex].value;
    const confirmStr = lang.notification.QmoveElemsToLayer.replace('%s', destLayer);
    const moveToLayer = (ok) => {
      if (!ok) {
        return;
      }
      svgCanvas.moveSelectedToLayer(destLayer);
      drawing.setCurrentLayer(destLayer);
      setPromptMoveLayerOnce(true);
    };

    if (destLayer) {
      if (promptMoveLayerOnce) {
        moveToLayer(true);
      } else {
        Alert.popUp({
          id: 'move layer',
          buttonType: AlertConstants.YES_NO,
          message: confirmStr,
          onYes: moveToLayer,
        });
      }
    }
  };

  const currentLayer = getObjectLayer(selectedElem as SVGElement);
  const currentLayerName = currentLayer?.title ?? defaultOption;

  const options = [];
  if (!currentLayer) {
    options.push(<option value={defaultOption} key={-1}>{lang.move_elems_to}</option>);
  }
  for (let i = layerCount - 1; i >= 0; i -= 1) {
    const layerName = drawing.getLayerName(i);
    options.push(<option value={layerName} key={i}>{layerName}</option>);
  }
  return (
    <div className="selLayerBlock controls">
      <span id="selLayerLabel">{lang.move_elems_to}</span>
      <select
        value={currentLayerName}
        id="selLayerNames"
        title="Move selected elements to a different layer"
        onChange={(e: React.ChangeEvent) => moveToOtherLayer(e)}
        disabled={options.length < 2}
      >
        {options}
      </select>
    </div>
  );
}

export default memo(SelLayerBlock);
