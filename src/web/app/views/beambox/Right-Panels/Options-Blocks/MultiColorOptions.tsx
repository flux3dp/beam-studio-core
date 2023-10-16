import React, { useEffect, useState } from 'react';

import ColorPicker from 'app/widgets/ColorPicker';
import colloectColors from 'helpers/color/collectColors';
import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import HorizontalScrollContainer from 'app/widgets/HorizontalScrollContainer';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import symbolMaker from 'helpers/symbol-maker';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './MultiColorOptions.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Props {
  elem: Element;
}

const MultiColorOptions = ({ elem }: Props): JSX.Element => {
  const [colors, setColors] = useState(colloectColors(elem));
  useEffect(() => {
    setColors(colloectColors(elem));
  }, [elem]);

  if (Object.keys(colors).length === 0) return null;

  const handleColorChange = (origColor: string, newColor: string) => {
    const fillElements = [];
    const strokeElements = [];
    colors[origColor].forEach(({ element, attribute }) => {
      if (attribute === 'fill') fillElements.push(element);
      else if (attribute === 'stroke') strokeElements.push(element);
    });
    const batchCmd = HistoryCommandFactory.createBatchCommand('Update Color');
    if (fillElements.length > 0) {
      svgCanvas.undoMgr.beginUndoableChange('fill', fillElements);
      svgCanvas.changeSelectedAttributeNoUndo('fill', newColor, fillElements);
      const cmd = svgCanvas.undoMgr.finishUndoableChange();
      if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    }
    if (strokeElements.length > 0) {
      svgCanvas.undoMgr.beginUndoableChange('stroke', strokeElements);
      svgCanvas.changeSelectedAttributeNoUndo('stroke', newColor, strokeElements);
      const cmd = svgCanvas.undoMgr.finishUndoableChange();
      if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    }
    if (!batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    if (elem.tagName.toLowerCase() === 'use') {
      symbolMaker.reRenderImageSymbol(elem as SVGUseElement, { force: true });
    }
    setColors(colloectColors(elem));
  };

  return (
    <div className={styles.block}>
      <div className={styles.label}>Colors</div>
      <HorizontalScrollContainer className={styles.controls}>
        {Object.keys(colors).map((color) => (
          <ColorPicker
            key={color}
            initColor={color}
            onChange={(newColor) => handleColorChange(color, newColor)}
          />
        ))}
      </HorizontalScrollContainer>
    </div>
  );
};

export default MultiColorOptions;
