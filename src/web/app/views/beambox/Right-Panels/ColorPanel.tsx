import classNames from 'classnames';
import React, { useCallback, useState } from 'react';

import constant from 'app/actions/beambox/constant';
import dialogCaller from 'app/actions/dialog-caller';
import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import storage from 'implementations/storage';
import UnitInput from 'app/widgets/Unit-Input-v2';
import useDidUpdateEffect from 'helpers/hooks/useDidUpdateEffect';
import { deleteElements } from 'app/svgedit/operations/delete';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './ColorPanel.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const deriveElementState = (element: Element) => {
  const fill = element.getAttribute('fill');
  const stroke = element.getAttribute('stroke');
  const strokeWidthAttr = element.getAttribute('stroke-width') || '1';
  const strokeWidth = Number.isNaN(Number(strokeWidthAttr)) ? 1 : Number(strokeWidthAttr);
  return { fill, stroke, strokeWidth };
};

interface Props {
  elem: Element;
}

interface State {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

const ColorPanel = ({ elem }: Props): JSX.Element => {
  const [state, setState] = useState<State>(deriveElementState(elem));
  const { fill, stroke, strokeWidth } = state;
  useDidUpdateEffect(() => {
    setState(deriveElementState(elem));
  }, [elem]);
  const handleColorBlockClick = useCallback(
    (e: React.MouseEvent, type: 'fill' | 'stroke') => {
      e.stopPropagation();
      const origColor = type === 'fill' ? fill : stroke;
      dialogCaller.showColorPicker({
        originalColor: origColor,
        left: e.clientX,
        top: e.clientY,
        allowNone: true,
        onNewColor: (newColor: string) => {
          if (type === 'stroke') {
            if (fill === 'none' && newColor === 'none') deleteElements([elem]);
            else svgCanvas.changeSelectedAttribute('stroke', newColor, [elem]);
          } else if (newColor === 'none' && (stroke === 'none' || strokeWidth === 0)) {
            deleteElements([elem]);
          } else {
            const batchCmd = HistoryCommandFactory.createBatchCommand('Color Panel Fill');
            svgCanvas.undoMgr.beginUndoableChange('fill', [elem]);
            svgCanvas.changeSelectedAttributeNoUndo('fill', newColor, [elem]);
            let cmd = svgCanvas.undoMgr.finishUndoableChange();
            if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
            svgCanvas.undoMgr.beginUndoableChange('fill-opacity', [elem]);
            svgCanvas.changeSelectedAttributeNoUndo('fill-opacity', newColor === 'none' ? '0' : '1', [elem]);
            cmd = svgCanvas.undoMgr.finishUndoableChange();
            if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
            svgCanvas.undoMgr.addCommandToHistory(batchCmd);
          }
          setState({ ...state, [type]: newColor });
        },
      });
    },
    [elem, fill, state, stroke, strokeWidth]
  );

  const handleStrokeWidthChange = (val: number) => {
    const targetVal = val * constant.dpmm;
    if (val === 0 && fill === 'none') {
      deleteElements([elem]);
    } else svgCanvas.changeSelectedAttribute('stroke-width', targetVal, [elem]);
  };

  const renderStrokeWidthBlock = () => {
    const unit = storage.get('default-units') || 'mm';
    const isInch = unit === 'inches';
    return (
      <div className={styles.block} key="rounded-corner">
        <div className={styles.label}>Stroke Width</div>
        <UnitInput
          id="stroke-width"
          min={0}
          decimal={1}
          unit={isInch ? 'in' : 'mm'}
          className={{ [styles.input]: true }}
          defaultValue={strokeWidth / constant.dpmm}
          getValue={(val) => handleStrokeWidthChange(val)}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>COLOR</div>
      <div className={styles.block}>
        <div className={styles.label}>Fill</div>
        <div
          className={classNames(styles.color, { [styles.none]: fill === 'none' })}
          style={{ background: fill }}
          onClick={(e) => handleColorBlockClick(e, 'fill')}
        />
      </div>
      <div className={styles.block}>
        <div className={styles.label}>Stroke</div>
        <div
          className={classNames(styles.color, { [styles.none]: stroke === 'none' })}
          style={{ background: stroke }}
          onClick={(e) => handleColorBlockClick(e, 'stroke')}
        />
      </div>
      {renderStrokeWidthBlock()}
    </div>
  );
};

export default ColorPanel;
