import eventEmitterFactory from 'helpers/eventEmitterFactory';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import textEdit from 'app/svgedit/text/textedit';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;

const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const createNewText = (x: number, y: number, text = '', addToHistory = false) => {
  const usePostscriptAsFamily = window.os === 'MacOS' && window.FLUX.version !== 'web';
  const currentShape = svgCanvas.getCurrentShape();
  const curText = textEdit.getCurText();

  const newText = svgCanvas.addSvgElementFromJson({
    element: 'text',
    curStyles: true,
    attr: {
      x,
      y,
      id: svgCanvas.getNextId(),
      fill: 'none',
      'fill-opacity': curText.fill_opacity,
      'stroke-width': 2,
      'font-size': curText.font_size,
      'font-family': usePostscriptAsFamily ? `'${curText.font_postscriptName}'` : curText.font_family,
      'font-postscript': curText.font_postscriptName,
      'text-anchor': curText.text_anchor,
      'data-ratiofixed': true,
      'xml:space': 'preserve',
      opacity: currentShape.opacity,
    },
  });
  if (usePostscriptAsFamily) newText.setAttribute('data-font-family', curText.font_family);
  if (svgCanvas.isUsingLayerColor) {
    svgCanvas.updateElementColor(newText);
  }
  if (text) textEdit.renderText(newText, text);
  if (addToHistory) svgCanvas.addCommandToHistory(new history.InsertElementCommand(newText));
  canvasEvents.emit('addText', newText);
};

export default createNewText;