import React, { useMemo, useState } from 'react';
import { ConfigProvider, InputNumber } from 'antd';

import ColorPicker from 'app/widgets/ColorPicker';
import constant from 'app/actions/beambox/constant';
import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import storage from 'implementations/storage';
import useDidUpdateEffect from 'helpers/hooks/useDidUpdateEffect';
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

  const handleFillColorChange = (newColor: string) => {
    const batchCmd = HistoryCommandFactory.createBatchCommand('Color Panel Fill');
    svgCanvas.undoMgr.beginUndoableChange('fill', [elem]);
    svgCanvas.changeSelectedAttributeNoUndo('fill', newColor, [elem]);
    let cmd = svgCanvas.undoMgr.finishUndoableChange();
    if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    svgCanvas.undoMgr.beginUndoableChange('fill-opacity', [elem]);
    svgCanvas.changeSelectedAttributeNoUndo('fill-opacity', newColor === 'none' ? '0' : '1', [
      elem,
    ]);
    cmd = svgCanvas.undoMgr.finishUndoableChange();
    if (!cmd.isEmpty()) batchCmd.addSubCommand(cmd);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    setState({ ...state, fill: newColor });
  };

  const handleStrokeColorChange = (newColor: string) => {
    svgCanvas.changeSelectedAttribute('stroke', newColor, [elem]);
    setState({ ...state, stroke: newColor });
  };

  const handleStrokeWidthChange = (val: number) => {
    svgCanvas.changeSelectedAttribute('stroke-width', val, [elem]);
    setState({ ...state, strokeWidth: val });
  };

  const unit = storage.get('default-units') || 'mm';
  const ratio = useMemo(() => constant.dpmm * (unit === 'inches' ? 25.4 : 1), [unit]);

  return (
    <>
      <div className={styles.block}>
        <div className={styles.label}>Fill</div>
        <ColorPicker allowClear initColor={fill} onChange={handleFillColorChange} />
      </div>
      <div className={styles.block}>
        <div className={styles.label}>Stroke</div>
        <div className={styles.controls}>
          <ColorPicker
            initColor={strokeWidth === 0 ? 'none' : stroke}
            triggerType="stroke"
            onChange={handleStrokeColorChange}
          />
          <ConfigProvider
            theme={{
              components: {
                InputNumber: {
                  controlWidth: 60,
                },
              },
            }}
          >
            <InputNumber
              id="stroke-width"
              value={strokeWidth}
              size="small"
              min={0}
              onChange={handleStrokeWidthChange}
              precision={0}
              // addonAfter={isInch ? 'in' : 'mm'}
              formatter={(value) => `${value / ratio}`}
              parser={(value) => Number(value) * ratio}
            />
          </ConfigProvider>
        </div>
      </div>
    </>
  );
};

export default ColorPanel;
