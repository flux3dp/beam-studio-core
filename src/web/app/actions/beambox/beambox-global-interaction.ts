import GlobalInteraction from 'app/actions/global-interaction';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

class BeamboxGlobalInteraction extends GlobalInteraction {
  attach() {
    super.attach([
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
    // ElectronUpdater.autoCheck();
  }

  onObjectFocus(elems?) {
    this.enableMenuItems(['DUPLICATE', 'DELETE', 'PATH']);
    let selectedElements = elems || svgCanvas.getSelectedElems().filter((elem) => elem);
    if (selectedElements.length > 0 && selectedElements[0].getAttribute('data-tempgroup') === 'true') {
      selectedElements = Array.from(selectedElements[0].childNodes);
    }
    if (selectedElements.length === 0) {
      return;
    }
    if (selectedElements[0].tagName === 'image') {
      this.enableMenuItems(['PHOTO_EDIT']);
    } else if (selectedElements[0].tagName === 'use') {
      this.enableMenuItems(['SVG_EDIT']);
    } else if (selectedElements[0].tagName === 'path') {
      this.enableMenuItems(['DECOMPOSE_PATH']);
    }
    if (selectedElements && selectedElements.length > 0) {
      this.enableMenuItems(['GROUP']);
    }
    if (selectedElements && selectedElements.length === 1 && ['g', 'a', 'use'].includes(selectedElements[0].tagName)) {
      this.enableMenuItems(['UNGROUP']);
    }
  }

  onObjectBlur() {
    this.disableMenuItems(['DUPLICATE', 'DELETE', 'PATH', 'DECOMPOSE_PATH', 'PHOTO_EDIT', 'SVG_EDIT']);
  }
}

const instance = new BeamboxGlobalInteraction();

export default instance;
