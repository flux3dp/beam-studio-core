import * as TutorialController from 'app/views/tutorials/tutorialController';
import clipboard from 'app/svgedit/operations/clipboard';
import dialog from 'implementations/dialog';
import i18n from 'helpers/i18n';
import ImageData from 'helpers/image-data';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import importSvg from 'app/svgedit/operations/import/importSvg';
import TutorialConstants from 'app/constants/tutorial-constants';
import { createLayer } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
let svgedit: ISVGDrawing;
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
    clipboard.cloneSelectedElements(20, 20);
  },
  // main panel
  importImage: async (): Promise<void> => {
    const file = await dialog.getFileFromDialog({
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi', 'bmp', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm', 'dxf', 'ai', 'pdf', 'svg', 'bvg', 'beam'],
        },
      ],
    });
    if (file) svgEditor.handleFile(file);
    funcs.useSelectTool();
  },
  // TODO: replace this
  insertSvg(svgString: string, callback: () => void): void {
    importSvg(new Blob([svgString], { type: 'text/plain' }), { isFromAI: true });
    setTimeout(callback, 1500);
  },
  insertImage(
    insertedImageSrc: string,
    dimension: { x: number; y: number; width: number; height: number; },
    threshold = 255,
  ): void {
    const img = new Image();
    const layerName = LANG.right_panel.layer_panel.layer_bitmap;

    img.src = insertedImageSrc;
    img.style.opacity = '0';
    img.onload = () => {
      if (!svgCanvas.setCurrentLayer(layerName)) createLayer(layerName);
      const { x, y, width, height } = dimension;
      const newImage = svgCanvas.addSvgElementFromJson({
        element: 'image',
        attr: {
          x,
          y,
          width,
          height,
          id: svgCanvas.getNextId(),
          style: 'pointer-events:inherit',
          preserveAspectRatio: 'none',
          'data-threshold': threshold,
          'data-shading': false,
          origImage: img.src,
        },
      });

      ImageData(newImage.getAttribute('origImage'), {
        height,
        width,
        grayscale: {
          is_rgba: true,
          is_shading: false,
          threshold,
          is_svg: false,
        },
        onComplete(result) {
          svgCanvas.setHref(newImage, result.pngBase64);
        },
      });
      svgCanvas.updateElementColor(newImage);
      svgCanvas.selectOnly([newImage]);

      window['updateContextPanel']();
      $('#dialog_box').hide();
    };
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
