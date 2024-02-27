import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import updateLayerColor from 'helpers/color/updateLayerColor';
import { getSVGAsync } from 'helpers/svg-editor-helper';

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

const toggleLayerColor = (): boolean => {
  const isUsingLayerColor = !(svgCanvas.isUsingLayerColor);
  svgCanvas.isUsingLayerColor = isUsingLayerColor;
  BeamboxPreference.write('use_layer_color', isUsingLayerColor);
  const layers = Array.from(document.querySelectorAll('g.layer'));
  layers.forEach((layer) => {
    updateLayerColor(layer as SVGGElement);
  });
  return isUsingLayerColor;
};

const toggleGrid = (): boolean => {
  const showGrid = !(svgEditor.curConfig.showGrid || false);
  svgEditor.curConfig.showGrid = showGrid;
  const canvasGridDisplay = showGrid ? 'inline' : 'none';
  $('#canvasGrid').attr('style', `display: ${canvasGridDisplay}`);
  return showGrid;
};

const toggleRulers = (): boolean => {
  const shouldShowRulers = !BeamboxPreference.read('show_rulers');
  document.getElementById('rulers').style.display = shouldShowRulers ? '' : 'none';
  if (shouldShowRulers) {
    svgEditor.updateRulers();
  }
  BeamboxPreference.write('show_rulers', shouldShowRulers);
  return shouldShowRulers;
};

let zoomWithWindow = false;
const toggleZoomWithWindow = (): boolean => {
  svgEditor.resetView();
  zoomWithWindow = !zoomWithWindow;
  if (zoomWithWindow) {
    window.addEventListener('resize', svgEditor.resetView);
  } else {
    window.removeEventListener('resize', svgEditor.resetView);
  }
  return zoomWithWindow;
};

const toggleAntiAliasing = (): boolean => {
  // Default True
  const currentValue = BeamboxPreference.read('anti-aliasing') !== false;
  const newValue = !currentValue;
  updateAntiAliasing(newValue);
  BeamboxPreference.write('anti-aliasing', newValue);
  return newValue;
};

export default {
  toggleAntiAliasing,
  toggleGrid,
  toggleLayerColor,
  toggleRulers,
  toggleZoomWithWindow,
  updateAntiAliasing,
};
