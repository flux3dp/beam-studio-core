import eventEmitterFactory from 'helpers/eventEmitterFactory';
import fontHelper from 'helpers/fonts/fontHelper';
import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import textEdit from 'app/svgedit/text/textedit';
import updateElementColor from 'helpers/color/updateElementColor';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;

const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface Options {
  text?: string;
  addToHistory?: boolean;
  fill?: string;
  fontSize?: number;
  fontPostscript?: string;
  isToSelect?: boolean;
}

const createNewText = (
  x: number,
  y: number,
  {
    text = '',
    addToHistory = false,
    fill = 'none',
    fontSize,
    fontPostscript,
    isToSelect = true,
  }: Options = {}
): SVGElement => {
  const currentShape = svgCanvas.getCurrentShape();
  const curText = textEdit.getCurText();
  const usePostscriptAsFamily = fontHelper.usePostscriptAsFamily(curText.font_postscriptName);

  const newText = svgCanvas.addSvgElementFromJson({
    element: 'text',
    curStyles: true,
    attr: {
      x,
      y,
      id: svgCanvas.getNextId(),
      fill,
      'fill-opacity': fill === 'none' ? curText.fill_opacity : 1,
      'stroke-width': 2,
      'font-size': fontSize ?? curText.font_size,
      'font-family': usePostscriptAsFamily
        ? `'${curText.font_postscriptName}'`
        : curText.font_family,
      'font-postscript': fontPostscript ?? curText.font_postscriptName,
      'text-anchor': curText.text_anchor,
      'data-ratiofixed': true,
      'xml:space': 'preserve',
      opacity: currentShape.opacity,
    },
  });

  if (usePostscriptAsFamily) {
    newText.setAttribute('data-font-family', curText.font_family);
  }

  updateElementColor(newText);

  if (text) {
    textEdit.renderText(newText, text);

    if (isToSelect) {
      svgCanvas.selectOnly([newText]);
    }
  }

  if (addToHistory) {
    svgCanvas.addCommandToHistory(new history.InsertElementCommand(newText));
  }

  canvasEvents.emit('addText', newText);

  return newText;
};

export default createNewText;
