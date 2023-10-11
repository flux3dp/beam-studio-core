import classNames from 'classnames';
import React, { memo, useContext, useEffect, useState } from 'react';

import useI18n from 'helpers/useI18n';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { getObjectLayer, moveToOtherLayer } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './SelLayerBlock.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const defaultOption = ' ';

function SelLayerBlock(): JSX.Element {
  const lang = useI18n().beambox.right_panel.layer_panel;
  const [promptMoveLayerOnce, setPromptMoveLayerOnce] = useState(false);
  const [displayValue, setDisplayValue] = useState(defaultOption);
  const { selectedElem } = useContext(CanvasContext);
  useEffect(() => {
    if (!selectedElem) return;
    if (selectedElem.getAttribute('data-tempgroup') === 'true') {
      const originalLayers = new Set(
        ([...selectedElem.childNodes] as SVGElement[])
          .filter((elem) => elem?.getAttribute('data-imageborder') !== 'true')
          .map((elem) => elem.getAttribute('data-original-layer'))
      );
      if (originalLayers.size === 1) {
        const [firstValue] = originalLayers;
        setDisplayValue(firstValue ?? defaultOption);
      } else setDisplayValue(defaultOption);
    } else {
      const currentLayer = getObjectLayer(selectedElem as SVGElement);
      const currentLayerName = currentLayer?.title ?? defaultOption;
      setDisplayValue(currentLayerName);
    }
  }, [selectedElem]);
  if (!selectedElem) return null;

  const drawing = svgCanvas.getCurrentDrawing();
  const layerCount = drawing.getNumLayers();
  if (layerCount === 1) return null;

  const onChange = (e: React.ChangeEvent) => {
    const select = e.target as HTMLSelectElement;
    const destLayer = select.options[select.selectedIndex].value;
    moveToOtherLayer(
      destLayer,
      () => {
        setDisplayValue(destLayer);
        setPromptMoveLayerOnce(true);
      },
      !promptMoveLayerOnce
    );
  };

  const options = [];
  if (displayValue === defaultOption) {
    options.push(
      <option value={defaultOption} key={-1}>
        {lang.move_elems_to}
      </option>
    );
  }
  for (let i = layerCount - 1; i >= 0; i -= 1) {
    const layerName = drawing.getLayerName(i);
    options.push(
      <option value={layerName} key={i}>
        {layerName}
      </option>
    );
  }
  return (
    <div className={classNames('controls', styles.container)}>
      <span className={styles.label}>{lang.move_elems_to}</span>
      <select
        className={styles.select}
        value={displayValue}
        title="Move selected elements to a different layer"
        onChange={onChange}
        disabled={options.length < 2}
      >
        {options}
      </select>
    </div>
  );
}

export default memo(SelLayerBlock);
