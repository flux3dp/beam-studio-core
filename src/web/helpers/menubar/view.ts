import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { updateCheckbox } from './electron-menubar-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const updateAntiAliasing = (on: boolean): void => {
  const svgContent = document.getElementById('svgcontent');
  if (svgContent) {
    svgContent.style.shapeRendering = on ? '' : 'optimizeSpeed';
  }
};

const init = (): void => {
  const shouldShowRulers = !!BeamboxPreference.read('show_rulers');
  updateCheckbox(['_view', 'SHOW_RULERS'], shouldShowRulers);
  const isUsingLayerColor = BeamboxPreference.read('use_layer_color');
  updateCheckbox(['_view', 'SHOW_LAYER_COLOR'], isUsingLayerColor);
  const isUsingAntiAliasing = BeamboxPreference.read('anti-aliasing') !== false;
  updateCheckbox(['_view', 'ANTI_ALIASING'], isUsingAntiAliasing);
};

const toggleLayerColor = (): void => {
  const isUsingLayerColor = !(svgCanvas.isUsingLayerColor);
  svgCanvas.isUsingLayerColor = isUsingLayerColor;
  BeamboxPreference.write('use_layer_color', isUsingLayerColor);
  updateCheckbox(['_view', 'SHOW_LAYER_COLOR'], isUsingLayerColor);
  const layers = Array.from(document.querySelectorAll('g.layer'));
  layers.forEach((layer) => {
    svgCanvas.updateLayerColor(layer);
  });
};

const toggleGrid = (): void => {
  const showGrid = !(svgEditor.curConfig.showGrid || false);
  svgEditor.curConfig.showGrid = showGrid;
  updateCheckbox(['_view', 'SHOW_GRIDS'], showGrid);
  const canvasGridDisplay = showGrid ? 'inline' : 'none';
  $('#canvasGrid').attr('style', `display: ${canvasGridDisplay}`);
};

const toggleRulers = (): void => {
  const shouldShowRulers = !BeamboxPreference.read('show_rulers');
  updateCheckbox(['_view', 'SHOW_RULERS'], shouldShowRulers);
  document.getElementById('rulers').style.display = shouldShowRulers ? '' : 'none';
  if (shouldShowRulers) {
    svgEditor.updateRulers();
  }
  BeamboxPreference.write('show_rulers', shouldShowRulers);
};

let zoomWithWindow = false;
const toggleZoomWithWindow = (): void => {
  svgEditor.resetView();
  zoomWithWindow = !zoomWithWindow;
  updateCheckbox(['_view', 'ZOOM_WITH_WINDOW'], zoomWithWindow);
  if (zoomWithWindow) {
    window.addEventListener('resize', svgEditor.resetView);
  } else {
    window.removeEventListener('resize', svgEditor.resetView);
  }
};

const toggleAntiAliasing = (): void => {
  // Default True
  const currentValue = BeamboxPreference.read('anti-aliasing') !== false;
  const newValue = !currentValue;
  updateAntiAliasing(newValue);
  BeamboxPreference.write('anti-aliasing', newValue);
  updateCheckbox(['_view', 'ANTI_ALIASING'], newValue);
};

export default {
  init,
  toggleAntiAliasing,
  toggleGrid,
  toggleLayerColor,
  toggleRulers,
  toggleZoomWithWindow,
  updateAntiAliasing,
};
