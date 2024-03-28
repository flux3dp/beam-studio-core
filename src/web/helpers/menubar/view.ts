import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import grid from 'app/actions/canvas/grid';
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
  const isUsingLayerColor = !svgCanvas.isUsingLayerColor;
  svgCanvas.isUsingLayerColor = isUsingLayerColor;
  BeamboxPreference.write('use_layer_color', isUsingLayerColor);
  const layers = Array.from(document.querySelectorAll('g.layer'));
  layers.forEach((layer) => {
    updateLayerColor(layer as SVGGElement);
  });
  return isUsingLayerColor;
};

const toggleGrid = (): boolean => {
  const newVal = !BeamboxPreference.read('show_grids');
  BeamboxPreference.write('show_grids', newVal);
  grid.toggleGrids();
  return newVal;
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

const toggleZoomWithWindow = (): boolean => {
  svgEditor.resetView();
  const zoomWithWindow = !BeamboxPreference.read('zoom_with_window');
  if (zoomWithWindow) {
    window.removeEventListener('resize', svgEditor.resetView);
    window.addEventListener('resize', svgEditor.resetView);
  } else {
    window.removeEventListener('resize', svgEditor.resetView);
  }
  BeamboxPreference.write('zoom_with_window', zoomWithWindow);
  return zoomWithWindow;
};

const toggleAntiAliasing = (): boolean => {
  const newValue = !BeamboxPreference.read('anti-aliasing');
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
