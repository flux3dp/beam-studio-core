import * as TutorialController from 'app/views/tutorials/tutorialController';
import dialog from 'implementations/dialog';
import i18n from 'helpers/i18n';
import ImageData from 'helpers/image-data';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgedit;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
  svgEditor = globalSVG.Editor;
});
const LANG = i18n.lang.beambox;

const setCrosshairCursor = () => {
  $('#workarea').css('cursor', 'crosshair');
  $('#svg_editor g').css('cursor', 'crosshair');
};

const align = (types) => {
  if (svgCanvas.getTempGroup()) {
    const childeren = svgCanvas.ungroupTempGroup();
    svgCanvas.selectOnly(childeren, false);
  }
  const selectedElements = svgCanvas.getSelectedElems();
  const len = selectedElements.filter((e) => e).length;
  const mode = len > 1 ? 'selected' : 'page';
  svgCanvas.alignSelectedElements(types, mode);
  svgCanvas.tempGroupSelectedElements();
};

const funcs = {
  clearSelection(): void {
    svgCanvas.clearSelection();
  },
  cloneSelectedElement(): void {
    svgCanvas.cloneSelectedElements(20, 20);
  },
  // main panel
  importImage: async (): Promise<void> => {
    const file = await dialog.getFileFromDialog({
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi', 'bmp', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm'],
        },
      ],
    });
    if (file) svgEditor.handleFile(file);
    funcs.useSelectTool();
  },
  insertSvg(svgString: string, callback: () => void): void {
    svgEditor.importSvg(
      new Blob([svgString], { type: 'text/plain' }),
      { skipVersionWarning: true, isFromAI: true },
    );

    setTimeout(callback, 1500);
  },
  insertImage(
    insertedImageSrc, cropData, preCrop, sizeFactor = 1, threshold = 255, imageTrace = false,
  ) {
    // let's insert the new image until we know its dimensions
    const insertNewImage = function (img, cropData, preCrop, sizeFactor, threshold) {
      const { x, y, width, height } = cropData;
      const { offsetX, offsetY } = preCrop;
      const scale = (imageTrace ? 1 : 3.5277777);
      const newImage = svgCanvas.addSvgElementFromJson({
        element: 'image',
        attr: {
          x: (offsetX + x) * scale,
          y: (offsetY + y) * scale,
          width: width * scale * sizeFactor,
          height: height * scale * sizeFactor,
          id: svgCanvas.getNextId(),
          style: 'pointer-events:inherit',
          preserveAspectRatio: 'none',
          'data-threshold': parseInt(threshold, 10),
          'data-shading': true,
          origImage: img.src,
        },
      });

      ImageData(newImage.getAttribute('origImage'), {
        height,
        width,
        grayscale: {
          is_rgba: true,
          is_shading: true,
          threshold: parseInt(threshold, 10),
          is_svg: false,
        },
        onComplete(result) {
          svgCanvas.setHref(newImage, result.pngBase64);
        },
      });

      svgCanvas.selectOnly([newImage]);

      window['updateContextPanel']();
      $('#dialog_box').hide();
    };

    // create dummy img so we know the default dimensions
    const img = new Image();
    const layerName = LANG.right_panel.layer_panel.layer_bitmap;

    img.src = insertedImageSrc;
    img.style.opacity = '0';
    img.onload = () => {
      if (!svgCanvas.setCurrentLayer(layerName)) {
        svgCanvas.createLayer(layerName);
      }

      insertNewImage(img, cropData, preCrop, sizeFactor, threshold);
    };
  },

  getCurrentLayerData() {
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayer = drawing.getCurrentLayer();
    const layerData = {
      speed: currentLayer.getAttribute('data-speed'),
      power: currentLayer.getAttribute('data-strength'),
      repeat: currentLayer.getAttribute('data-repeat'),
      height: currentLayer.getAttribute('data-height'),
      zStep: currentLayer.getAttribute('data-zstep'),
      isDiode: currentLayer.getAttribute('data-diode'),
      configName: currentLayer.getAttribute('data-configName'),
    };

    return layerData;
  },

  // top menu
  groupSelected(): void {
    svgCanvas.groupSelectedElements();
  },
  ungroupSelected(): void {
    svgCanvas.ungroupSelectedElement();
  },

  // align toolbox
  alignLeft(): void {
    align('l');
  },
  alignCenter(): void {
    align('c');
  },
  alignRight(): void {
    align('r');
  },
  alignTop(): void {
    align('t');
  },
  alignMiddle(): void {
    align('m');
  },
  alignBottom(): void {
    align('b');
  },
  // left panel
  useSelectTool(): void {
    $('#tool_select').click();
  },
  insertRectangle(): void {
    if (TutorialController.getNextStepRequirement() === TutorialConstants.SELECT_RECT) {
      TutorialController.handleNextStep();
    }
    $('#tool_rect').mouseup();
    setCrosshairCursor();
  },
  insertEllipse(): void {
    if (TutorialController.getNextStepRequirement() === TutorialConstants.SELECT_CIRCLE) {
      TutorialController.handleNextStep();
    }
    $('#tool_ellipse').mouseup();
    setCrosshairCursor();
  },
  insertPath(): void {
    $('#tool_path').mouseup();
    setCrosshairCursor();
  },
  insertPolygon(): void {
    svgCanvas.setMode('polygon');
    setCrosshairCursor();
  },
  insertLine(): void {
    $('#tool_line').mouseup();
    setCrosshairCursor();
  },
  insertText(): void {
    if (svgedit.browser.isTouch()) {
      $('#tool_text').mousedown();
    } else {
      $('#tool_text').click();
    }
    $('#workarea').css('cursor', 'text');
  },
};

export default funcs;
