import React, { useContext, memo } from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import i18n from 'helpers/i18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { getObjectLayer } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.layer_panel;

function SelLayerBlock(): JSX.Element {
  const [promptMoveLayerOnce, setPromptMoveLayerOnce] = React.useState(false);
  const { selectedElem } = useContext(CanvasContext);
  if (!selectedElem ) return null;
  const currentLayer = getObjectLayer(selectedElem as SVGElement);
  if (!currentLayer) return null;

  const drawing = svgCanvas.getCurrentDrawing();
  const layerCount = drawing.getNumLayers();
  if (layerCount === 1) return null;

  const options = [];
  for (let i = layerCount - 1; i >= 0; i -= 1) {
    const layerName = drawing.getLayerName(i);
    options.push(<option value={layerName} key={i}>{layerName}</option>);
  }

  const moveToOtherLayer = (e: React.ChangeEvent): void => {
    const select = e.target as HTMLSelectElement;
    const destLayer = select.options[select.selectedIndex].value;
    const confirmStr = LANG.notification.QmoveElemsToLayer.replace('%s', destLayer);
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

  const currentLayerName = currentLayer.title;
  return (
    <div className="selLayerBlock controls">
      <span id="selLayerLabel">{LANG.move_elems_to}</span>
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
