/* eslint-disable class-methods-use-this */
import menu from 'implementations/menu';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

class BeamboxGlobalInteraction {
  attach() {
    menu.attach([
      'IMPORT',
      'SAVE_SCENE',
      'UNDO',
      'REDO',
      'EXPORT_FLUX_TASK',
      'DOCUMENT_SETTING',
      'CLEAR_SCENE',
      'ZOOM_IN',
      'ZOOM_OUT',
      'ALIGN_TO_EDGES',
      'FITS_TO_WINDOW',
      'ZOOM_WITH_WINDOW',
      'SHOW_GRIDS',
      'SHOW_LAYER_COLOR',
      'NETWORK_TESTING',
      'ABOUT_BEAM_STUDIO',
    ]);
  }

  onObjectFocus(elems?) {
    menu.enable(['DUPLICATE', 'DELETE', 'PATH']);
    let selectedElements = elems || svgCanvas.getSelectedElems().filter((elem) => elem);
    if (selectedElements.length === 0) {
      return;
    }
    if (selectedElements[0].tagName === 'image') {
      menu.enable(['PHOTO_EDIT']);
    } else if (selectedElements[0].tagName === 'use') {
      menu.enable(['SVG_EDIT']);
    } else if (selectedElements[0].tagName === 'path') {
      menu.enable(['DECOMPOSE_PATH']);
    }
    if (selectedElements.length > 0 && selectedElements[0].getAttribute('data-tempgroup') === 'true') {
      selectedElements = Array.from(selectedElements[0].childNodes);
    }
    if (selectedElements?.length > 1 || (selectedElements?.length === 1 && selectedElements[0].tagName !== 'g')) {
      menu.enable(['GROUP']);
    }
    if (selectedElements && selectedElements.length === 1 && ['g', 'a', 'use'].includes(selectedElements[0].tagName)) {
      menu.enable(['UNGROUP']);
    }
  }

  onObjectBlur() {
    menu.disable(['GROUP', 'UNGROUP', 'DUPLICATE', 'DELETE', 'PATH', 'DECOMPOSE_PATH', 'PHOTO_EDIT', 'SVG_EDIT']);
  }

  detach() {
    menu.detach();
  }
}

const instance = new BeamboxGlobalInteraction();

export default instance;
