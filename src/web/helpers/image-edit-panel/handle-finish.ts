import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const handleFinish = (
  element: SVGImageElement,
  src: string,
  base64: string,
  width?: number,
  height?: number,
): void => {
  const batchCmd = new history.BatchCommand('Image Edit');

  const handleSetAttribute = (attr: string, value) => {
    svgCanvas.undoMgr.beginUndoableChange(attr, [element]);
    element.setAttribute(attr, value);
    const cmd = svgCanvas.undoMgr.finishUndoableChange();
    if (!cmd.isEmpty()) {
      batchCmd.addSubCommand(cmd);
    }
  };
  handleSetAttribute('origImage', src);
  handleSetAttribute('xlink:href', base64);
  if (typeof width === 'number') handleSetAttribute('width', width);
  if (typeof height === 'number') handleSetAttribute('height', height);
  svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  svgCanvas.selectOnly([element], true);
};

export default handleFinish;
