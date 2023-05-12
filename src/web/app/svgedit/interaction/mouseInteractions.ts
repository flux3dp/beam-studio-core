/* eslint-disable no-case-declarations */
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import history from 'app/svgedit/history';
import selector from 'app/svgedit/selector';
import * as LayerHelper from 'helpers/layer/layer-helper';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import TopBarController from 'app/views/beambox/TopBar/contexts/TopBarController';
import * as TutorialController from 'app/views/tutorials/tutorialController';
import TutorialConstants from 'app/constants/tutorial-constants';
import clipboard from 'app/svgedit/operations/clipboard';
import TopBarHintsController from 'app/views/beambox/TopBar/contexts/TopBarHintsController';
import touchEvents from 'app/svgedit/touchEvents';
import textEdit from 'app/svgedit/textedit';
import SymbolMaker from 'helpers/symbol-maker';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { MouseButtons } from 'app/constants/mouse-constants';

let svgEditor;
let svgCanvas: ISVGCanvas;

getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

const { svgedit } = window;
const SENSOR_AREA_RADIUS = 10;

// Mouse events

let newDPath = null;
let startX = null;
let startY = null;
let initBBox = {};

let startMouseX = null;
let startMouseY = null;
let selectedBBox = null;
let justSelected = null;

const freehand = {
  minx: null,
  miny: null,
  maxx: null,
  maxy: null,
};
let sumDistance = 0;
let controllPoint2 = {
  x: 0,
  y: 0,
};
let controllPoint1 = {
  x: 0,
  y: 0,
};
let start = {
  x: 0,
  y: 0,
};
let end = {
  x: 0,
  y: 0,
};
let parameter;
let nextParameter;
let bSpline = {
  x: 0,
  y: 0,
};
let nextPos = {
  x: 0,
  y: 0,
};
const THRESHOLD_DIST = 0.8;
const STEP_COUNT = 10;

const setRubberBoxStart = () => {
  const selectorManager = selector.getSelectorManager();
  let rubberBox = svgCanvas.getRubberBox();
  if (rubberBox == null) {
    rubberBox = selectorManager.getRubberBandBox();
    svgCanvas.unsafeAccess.setRubberBox(rubberBox);
  }

  svgedit.utilities.assignAttributes(rubberBox, {
    x: startMouseX,
    y: startMouseY,
    width: 0,
    height: 0,
    display: 'inline',
  }, 100);
};

const getBsplinePoint = (t) => {
  const spline = {
    x: 0,
    y: 0,
  };
  const p0 = controllPoint2;
  const p1 = controllPoint1;
  const p2 = start;
  const p3 = end;
  const S = 1.0 / 6.0;
  const t2 = t * t;
  const t3 = t2 * t;

  const m = [
    [-1, 3, -3, 1],
    [3, -6, 3, 0],
    [-3, 0, 3, 0],
    [1, 4, 1, 0],
  ];

  spline.x = S * (
    (p0.x * m[0][0] + p1.x * m[0][1] + p2.x * m[0][2] + p3.x * m[0][3]) * t3
    + (p0.x * m[1][0] + p1.x * m[1][1] + p2.x * m[1][2] + p3.x * m[1][3]) * t2
    + (p0.x * m[2][0] + p1.x * m[2][1] + p2.x * m[2][2] + p3.x * m[2][3]) * t
    + (p0.x * m[3][0] + p1.x * m[3][1] + p2.x * m[3][2] + p3.x * m[3][3])
  );
  spline.y = S * (
    (p0.y * m[0][0] + p1.y * m[0][1] + p2.y * m[0][2] + p3.y * m[0][3]) * t3
    + (p0.y * m[1][0] + p1.y * m[1][1] + p2.y * m[1][2] + p3.y * m[1][3]) * t2
    + (p0.y * m[2][0] + p1.y * m[2][1] + p2.y * m[2][2] + p3.y * m[2][3]) * t
    + (p0.y * m[3][0] + p1.y * m[3][1] + p2.y * m[3][2] + p3.y * m[3][3])
  );

  return {
    x: spline.x,
    y: spline.y,
  };
};

/**
 * Add transform for resizing operation
 * @param {Element} element svg element to init transform
 */
const initResizeTransform = (element) => {
  const transforms = svgedit.transformlist.getTransformList(element);
  const pos = svgedit.utilities.getRotationAngle(element) ? 1 : 0;
  const svgRoot = svgCanvas.getRoot();

  if (svgedit.math.hasMatrixTransform(transforms)) {
    transforms.insertItemBefore(svgRoot.createSVGTransform(), pos);
    transforms.insertItemBefore(svgRoot.createSVGTransform(), pos);
    transforms.insertItemBefore(svgRoot.createSVGTransform(), pos);
  } else {
    transforms.appendItem(svgRoot.createSVGTransform());
    transforms.appendItem(svgRoot.createSVGTransform());
    transforms.appendItem(svgRoot.createSVGTransform());
  }
};

let mouseSelectModeCmds;
// - when we are in a create mode, the element is added to the canvas
// but the action is not recorded until mousing up
// - when we are in select mode, select the element, remember the position
// and do nothing else
const mouseDown = (evt: MouseEvent) => {
  const currentShape = svgCanvas.getCurrentShape();
  const currentZoom = svgCanvas.getCurrentZoom();
  const selectedElements = svgCanvas.getSelectedElems();
  const started = svgCanvas.getStarted();
  const svgRoot = svgCanvas.getRoot();
  const rightClick = evt.button === MouseButtons.Right;
  let currentMode = svgCanvas.getCurrentMode();
  let extensionResult = null;

  svgCanvas.setRootScreenMatrix(($('#svgcontent')[0] as any).getScreenCTM().inverse());
  const pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, svgCanvas.getRootScreenMatrix());
  let { x, y } = pt;
  startMouseX = x * currentZoom;
  startMouseY = y * currentZoom;
  const realX = x; // realX/Y ignores grid-snap value
  const realY = y;

  if (svgCanvas.spaceKey || evt.button === MouseButtons.Mid) return;

  mouseSelectModeCmds = [];

  if (svgCanvas.getCurrentConfig().gridSnapping) {
    x = svgedit.utilities.snapToGrid(x);
    y = svgedit.utilities.snapToGrid(y);
  }

  startX = x;
  startY = y;

  evt.preventDefault();
  (document.activeElement as HTMLElement).blur();
  if (rightClick) {
    if (started) return;
    if (currentMode === 'path') {
      svgCanvas.pathActions.finishPath(false);
      $('#workarea').css('cursor', 'default');
      svgCanvas.unsafeAccess.setCurrentMode('select');
      return;
    }
    svgEditor.clickSelect(false);
    svgCanvas.setLastClickPoint(pt);
    return;
  }

  // This would seem to be unnecessary...
  // if (['select', 'resize'].indexOf(currentMode) == -1) {
  //   setGradient();
  // }

  let mouseTarget = svgCanvas.getMouseTarget(evt);

  if (mouseTarget.tagName === 'a' && mouseTarget.childNodes.length === 1) {
    mouseTarget = mouseTarget.firstChild as SVGElement;
  }
  if (mouseTarget === svgCanvas.selectorManager.selectorParentGroup
      && selectedElements[0] != null) {
    // if it is a selector grip, then it must be a single element selected,
    // set the mouseTarget to that and update the mode to rotate/resize
    const grip = evt.target;
    const gripType = $.data(grip, 'type');
    if (gripType === 'rotate') {
      // rotating
      svgCanvas.unsafeAccess.setCurrentMode('rotate');
    } else if (gripType === 'resize') {
      // resizing
      svgCanvas.unsafeAccess.setCurrentMode('resize');
      svgCanvas.setCurrentResizeMode($.data(grip, 'dir'));
    }
    [mouseTarget] = selectedElements;
    console.log('svgCanvas gripping', svgCanvas.getCurrentMode(), svgCanvas.getCurrentResizeMode());
  } else if (svgCanvas.textActions.isEditing) {
    svgCanvas.unsafeAccess.setCurrentMode('textedit');
  }

  extensionResult = svgCanvas.runExtensions('checkMouseTarget', { mouseTarget }, true);
  if (extensionResult) {
    $.each(extensionResult, (i, r) => {
      svgCanvas.unsafeAccess.setStarted(started || (r && r.started));
    });
    if (started && currentMode !== 'path') {
      console.log('extension ate the mouseDown event');
      return;
    }
  }

  svgCanvas.unsafeAccess.setStartTransform(mouseTarget.getAttribute('transform'));
  currentMode = svgCanvas.getCurrentMode();
  switch (currentMode) {
    case 'select':
    case 'multiselect':
      svgCanvas.unsafeAccess.setStarted(true);
      svgCanvas.setCurrentResizeMode('none');
      if (rightClick) {
        svgCanvas.unsafeAccess.setStarted(false);
      } else {
        // End layer multiselect
        const selectedLayers = LayerPanelController.getSelectedLayers();
        if (selectedLayers && selectedLayers.length > 1) {
          const currentLayerName = svgCanvas.getCurrentDrawing().getCurrentLayerName();
          if (currentLayerName) LayerPanelController.setSelectedLayers([currentLayerName]);
        }
      }

      if (PreviewModeController.isPreviewMode() || TopBarController.getTopBarPreviewMode()) {
        // preview mode
        svgCanvas.clearSelection();
        if (PreviewModeController.isPreviewMode()) {
          svgCanvas.unsafeAccess.setCurrentMode('preview');
        } else {
          // i.e. TopBarController.getTopBarPreviewMode()
          svgCanvas.unsafeAccess.setCurrentMode('pre_preview');
        }
        setRubberBoxStart();
      } else {
        const mouseTargetObjectLayer = LayerHelper.getObjectLayer(mouseTarget);
        const isElemTempGroup = mouseTarget.getAttribute('data-tempgroup') === 'true';
        const layerSelectable = (mouseTargetObjectLayer
          && mouseTargetObjectLayer.elem
          && mouseTargetObjectLayer.elem.getAttribute('display') !== 'none'
          && !mouseTargetObjectLayer.elem.getAttribute('data-lock'));
        if (mouseTarget !== svgRoot && (isElemTempGroup || layerSelectable)) {
          // Mouse down on element
          if (!selectedElements.includes(mouseTarget)) {
            if (!evt.shiftKey) {
              svgCanvas.clearSelection(true);
            }
            if (navigator.maxTouchPoints > 1 && ['MacOS', 'others'].includes(window.os)) {
              // in touchable mobiles, allow multiselect if click on non selected element
              // if user doesn't multiselect, select [justSelected] in mouseup
              svgCanvas.unsafeAccess.setCurrentMode('multiselect');
              setRubberBoxStart();
            } else {
              svgCanvas.addToSelection([mouseTarget]);
              if (selectedElements.length > 1) {
                svgCanvas.tempGroupSelectedElements();
              }
            }
            justSelected = mouseTarget;
            svgCanvas.pathActions.clear();
          } else if (evt.shiftKey) {
            if (mouseTarget === svgCanvas.getTempGroup()) {
              const elemToRemove = svgCanvas.getMouseTarget(evt, false);
              svgCanvas.removeFromTempGroup(elemToRemove);
            } else {
              svgCanvas.clearSelection();
            }
          }

          if (!rightClick) {
            if (evt.altKey) {
              const cmd = clipboard.cloneSelectedElements(0, 0, true);
              if (cmd && !cmd.isEmpty()) {
                mouseSelectModeCmds.push(cmd);
              }
            }
            for (let i = 0; i < selectedElements.length; i += 1) {
              // insert a dummy transform so if the element(s) are moved it will have
              // a transform to use for its translate
              if (selectedElements[i] == null) {
                // eslint-disable-next-line no-continue
                continue;
              }
              const transforms = svgedit.transformlist.getTransformList(selectedElements[i]);
              if (transforms.numberOfItems) {
                transforms.insertItemBefore(svgRoot.createSVGTransform(), 0);
              } else {
                transforms.appendItem(svgRoot.createSVGTransform());
              }
            }
          }
        } else if (!rightClick) {
          // Mouse down on svg root
          svgCanvas.clearSelection();
          svgCanvas.unsafeAccess.setCurrentMode('multiselect');
          setRubberBoxStart();
        }
      }
      break;
    case 'zoom':
      svgCanvas.unsafeAccess.setStarted(true);
      setRubberBoxStart();
      break;
    case 'resize':
      svgCanvas.unsafeAccess.setStarted(true);
      startX = x;
      startY = y;

      // Getting the BBox from the selection box, since we know we
      // want to orient around it
      const selectBox = document.getElementById(`selectedBox_${mouseTarget.id}`);
      initBBox = svgedit.utilities.getBBox(selectBox);
      const bb: { [key: string]: number } = {};
      $.each(initBBox, (key, val) => {
        bb[key] = val / svgCanvas.getCurrentZoom();
      });
      initBBox = (mouseTarget.tagName === 'use') ? svgCanvas.getSvgRealLocation(mouseTarget) : bb;
      // append three dummy transforms to the tlist so that
      // we can translate,scale,translate in mousemove

      initResizeTransform(mouseTarget);
      if (svgedit.browser.supportsNonScalingStroke()) {
        const delayedStroke = (ele: SVGElement) => {
          const strokeValue = ele.getAttributeNS(null, 'stroke');
          ele.removeAttributeNS(null, 'stroke');
          // Re-apply stroke after delay. Anything higher than 1 seems to cause flicker
          if (strokeValue !== null) {
            setTimeout(() => {
              ele.setAttributeNS(null, 'stroke', strokeValue);
            }, 0);
          }
        };

        mouseTarget.style.vectorEffect = 'non-scaling-stroke';
        delayedStroke(mouseTarget);

        const all = mouseTarget.getElementsByTagName('*') as HTMLCollectionOf<SVGElement>;
        const len = all.length;
        for (let i = 0; i < len; i += 1) {
          all[i].style.vectorEffect = 'non-scaling-stroke';
          delayedStroke(all[i]);
        }
      }
      break;
    case 'fhellipse':
    case 'fhrect':
    case 'fhpath':
      start.x = realX;
      start.y = realY;
      svgCanvas.unsafeAccess.setStarted(true);
      newDPath = `${realX},${realY} `;
      svgCanvas.addSvgElementFromJson({
        element: 'polyline',
        curStyles: true,
        attr: {
          points: newDPath,
          id: svgCanvas.getNextId(),
          fill: 'none',
          opacity: currentShape.opacity / 2,
          'stroke-linecap': 'round',
          style: 'pointer-events:none',
        },
      });
      freehand.minx = realX;
      freehand.maxx = realX;
      freehand.miny = realY;
      freehand.maxy = realY;
      break;
    case 'image':
      svgCanvas.unsafeAccess.setStarted(true);
      const newImage = svgCanvas.addSvgElementFromJson({
        element: 'image',
        attr: {
          x,
          y,
          width: 0,
          height: 0,
          id: svgCanvas.getNextId(),
          opacity: currentShape.opacity / 2,
          style: 'pointer-events:inherit',
        },
      }) as unknown as SVGImageElement;
      svgCanvas.setHref(newImage, svgCanvas.getGoodImage());
      svgedit.utilities.preventClickDefault(newImage);
      break;
    case 'square':
    // FIXME: once we create the rect, we lose information that this was a square
    // (for resizing purposes this could be important)
    // eslint-disable-next-line no-fallthrough
    case 'rect':
      svgCanvas.unsafeAccess.setStarted(true);
      startX = x;
      startY = y;
      const newRect = svgCanvas.addSvgElementFromJson({
        element: 'rect',
        curStyles: false,
        attr: {
          x,
          y,
          width: 0,
          height: 0,
          stroke: '#000',
          id: svgCanvas.getNextId(),
          fill: 'none',
          'fill-opacity': 0,
          opacity: currentShape.opacity / 2,
        },
      });
      if (svgCanvas.isUsingLayerColor) {
        svgCanvas.updateElementColor(newRect);
      }
      svgCanvas.selectOnly([newRect], true);
      break;
    case 'line':
      svgCanvas.unsafeAccess.setStarted(true);
      const newLine = svgCanvas.addSvgElementFromJson({
        element: 'line',
        curStyles: false,
        attr: {
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          id: svgCanvas.getNextId(),
          stroke: '#000',
          'stroke-width': 1,
          'stroke-dasharray': currentShape.stroke_dasharray,
          'stroke-linejoin': currentShape.stroke_linejoin,
          'stroke-linecap': currentShape.stroke_linecap,
          fill: 'none',
          opacity: currentShape.opacity / 2,
          style: 'pointer-events:none',
        },
      });
      if (svgCanvas.isUsingLayerColor) {
        svgCanvas.updateElementColor(newLine);
      }
      svgCanvas.selectOnly([newLine], true);
      svgCanvas.getEvents().emit('addLine', newLine);
      break;
    case 'circle':
      svgCanvas.unsafeAccess.setStarted(true);
      svgCanvas.addSvgElementFromJson({
        element: 'circle',
        curStyles: false,
        attr: {
          cx: x,
          cy: y,
          r: 0,
          id: svgCanvas.getNextId(),
          stroke: '#000',
          opacity: currentShape.opacity / 2,
        },
      });
      break;
    case 'ellipse':
      svgCanvas.unsafeAccess.setStarted(true);
      // eslint-disable-next-line no-case-declarations
      const newEllipse = svgCanvas.addSvgElementFromJson({
        element: 'ellipse',
        curStyles: false,
        attr: {
          cx: x,
          cy: y,
          rx: 0,
          ry: 0,
          id: svgCanvas.getNextId(),
          stroke: '#000',
          'fill-opacity': 0,
          fill: 'none',
          opacity: currentShape.opacity / 2,
        },
      });
      if (svgCanvas.isUsingLayerColor) {
        svgCanvas.updateElementColor(newEllipse);
      }
      svgCanvas.selectOnly([newEllipse], true);
      break;
    case 'text':
      svgCanvas.unsafeAccess.setStarted(true);
      const usePostscriptAsFamily = window.os === 'MacOS' && window.FLUX.version !== 'web';
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
      svgCanvas.getEvents().emit('addText', newText);
      break;
    case 'polygon':
      // Polygon is created in ext-polygon.js
      TopBarHintsController.setHint('POLYGON');
      break;
    case 'path':
    // Fall through
    case 'pathedit':
      startX *= currentZoom;
      startY *= currentZoom;
      if (svgCanvas.isBezierPathAlignToEdge) {
        const { xMatchPoint, yMatchPoint } = svgCanvas.findMatchPoint(startMouseX, startMouseY);
        startX = xMatchPoint ? xMatchPoint.x * currentZoom : startX;
        startY = yMatchPoint ? yMatchPoint.y * currentZoom : startY;
      }
      const { x: newX, y: newY } = svgCanvas.pathActions.mouseDown(evt, mouseTarget, startX, startY);
      startX = newX;
      startY = newY;
      svgCanvas.unsafeAccess.setStarted(true);
      break;
    case 'textedit':
      startX *= currentZoom;
      startY *= currentZoom;
      svgCanvas.textActions.mouseDown(evt, mouseTarget, startX, startY);
      svgCanvas.unsafeAccess.setStarted(true);
      break;
    case 'rotate':
      svgCanvas.unsafeAccess.setStarted(true);
      // we are starting an undoable change (a drag-rotation)
      if (!svgCanvas.getTempGroup()) {
        svgCanvas.undoMgr.beginUndoableChange('transform', selectedElements);
      } else {
        svgCanvas.undoMgr.beginUndoableChange(
          'transform',
          Array.from(svgCanvas.getTempGroup().childNodes as unknown as SVGElement[])
        );
      }
      break;
    default:
      // This could occur in an extension
      break;
  }

  extensionResult = svgCanvas.runExtensions('mouseDown', {
    event: evt,
    start_x: startX,
    start_y: startY,
    selectedElements,
    ObjectPanelController,
  }, true);

  if (selectedElements.length > 0 && selectedElements[0]) {
    selectedBBox = svgCanvas.getSvgRealLocation(selectedElements[0]);
  } else {
    selectedBBox = null;
  }

  $.each(extensionResult, (index, r) => {
    if (r && r.started) {
      svgCanvas.unsafeAccess.setStarted(true);
    }
  });
};

const onResizeMouseMove = (evt: MouseEvent, selected: SVGElement, x, y) => {
  const currentConfig = svgCanvas.getCurrentConfig();
  const svgRoot = svgCanvas.getRoot();
  const transforms = svgedit.transformlist.getTransformList(selected);
  const hasMatrix = svgedit.math.hasMatrixTransform(transforms);
  const box = hasMatrix ? initBBox : svgedit.utilities.getBBox(selected);
  let left = box.x;
  let top = box.y;
  let { width } = box;
  let { height } = box;
  let dx = (x - startX);
  let dy = (y - startY);

  if (currentConfig.gridSnapping) {
    dx = svgedit.utilities.snapToGrid(dx);
    dy = svgedit.utilities.snapToGrid(dy);
    height = svgedit.utilities.snapToGrid(height);
    width = svgedit.utilities.snapToGrid(width);
  }

  // if rotated, adjust the dx,dy values
  const angle = svgedit.utilities.getRotationAngle(selected);
  if (angle) {
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx) - angle * (Math.PI / 180.0);
    dx = r * Math.cos(theta);
    dy = r * Math.sin(theta);
  }

  // if not stretching in y direction, set dy to 0
  // if not stretching in x direction, set dx to 0
  const resizeMode = svgCanvas.getCurrentResizeMode();
  if (resizeMode.indexOf('n') === -1 && resizeMode.indexOf('s') === -1) {
    dy = 0;
  }
  if (resizeMode.indexOf('e') === -1 && resizeMode.indexOf('w') === -1) {
    dx = 0;
  }

  let tx = 0;
  let ty = 0;
  let sy = height ? (height + dy) / height : 1;
  let sx = width ? (width + dx) / width : 1;
  // if we are dragging on the north side, then adjust the scale factor and ty
  if (resizeMode.indexOf('n') >= 0) {
    sy = height ? (height - dy) / height : 1;
    ty = height;
  }

  // if we dragging on the east side, then adjust the scale factor and tx
  if (resizeMode.indexOf('w') >= 0) {
    sx = width ? (width - dx) / width : 1;
    tx = width;
  }

  // update the transform list with translate,scale,translate
  const translateOrigin = svgRoot.createSVGTransform();
  const scale = svgRoot.createSVGTransform();
  const translateBack = svgRoot.createSVGTransform();

  if (currentConfig.gridSnapping) {
    left = svgedit.utilities.snapToGrid(left);
    tx = svgedit.utilities.snapToGrid(tx);
    top = svgedit.utilities.snapToGrid(top);
    ty = svgedit.utilities.snapToGrid(ty);
  }
  const isRatioFixed = ObjectPanelController.getDimensionValues('isRatioFixed') ? 1 : 0;
  translateOrigin.setTranslate(-(left + tx), -(top + ty));
  // eslint-disable-next-line no-bitwise
  if (isRatioFixed ^ (evt.shiftKey ? 1 : 0)) {
    if (sx === 1) {
      sx = sy;
    } else {
      sy = sx;
    }
  }
  scale.setScale(sx, sy);
  translateBack.setTranslate(left + tx, top + ty);

  if (hasMatrix) {
    const diff = angle ? 1 : 0;
    transforms.replaceItem(translateOrigin, 2 + diff);
    transforms.replaceItem(scale, 1 + diff);
    transforms.replaceItem(translateBack, Number(diff));
  } else {
    const N = transforms.numberOfItems;
    transforms.replaceItem(translateBack, N - 3);
    transforms.replaceItem(scale, N - 2);
    transforms.replaceItem(translateOrigin, N - 1);
  }

  // Bounding box calculation
  switch (selected.tagName) {
    case 'rect':
    case 'path':
    case 'use':
    case 'polygon':
    case 'image':
    case 'ellipse':
    case 'g':
      const dCx = tx === 0 ? 0.5 * width * (sx - 1) : 0.5 * width * (1 - sx);
      const dCy = ty === 0 ? 0.5 * height * (sy - 1) : 0.5 * height * (1 - sy);
      const theta = angle * (Math.PI / 180);
      const newCx = left + width / 2 + dCx * Math.cos(theta) - dCy * Math.sin(theta);
      const newCy = top + height / 2 + dCx * Math.sin(theta) + dCy * Math.cos(theta);
      const newWidth = Math.abs(width * sx);
      const newHeight = Math.abs(height * sy);
      const newLeft = newCx - 0.5 * newWidth;
      const newTop = newCy - 0.5 * newHeight;

      if (selected.tagName === 'ellipse') {
        ObjectPanelController.updateDimensionValues({
          cx: newCx, cy: newCy, rx: newWidth / 2, ry: newHeight / 2,
        });
      } else {
        ObjectPanelController.updateDimensionValues({
          x: newLeft, y: newTop, width: newWidth, height: newHeight,
        });
      }
      break;
    case 'text':
      // This is a bad hack because vector-effect
      // seems not working when resize text, but work after receiving new stroke width value
      if (selected.getAttribute('stroke-width') === '2') {
        selected.setAttribute('stroke-width', '2.01');
      } else {
        selected.setAttribute('stroke-width', '2');
      }
      break;
    default:
      break;
  }

  if (['rect', 'path, ellipse'].includes(selected.tagName)) {
    if ((width < 0.01 && Math.abs(width * sx) >= 0.01)
        || (height < 0.01 && Math.abs(height * sy) >= 0.01)) {
      console.log('recal', width, height, width * sx, height * sy);
      svgedit.recalculate.recalculateDimensions(selected);
      initResizeTransform(selected);
      startX = x;
      startY = y;
    }
  }

  svgCanvas.selectorManager.requestSelector(selected).resize();
  svgCanvas.call('transition', svgCanvas.getSelectedElems());
  ObjectPanelController.updateObjectPanel();
  if (svgedit.utilities.getElem('text_cursor')) {
    svgCanvas.textActions.init();
  }
};

// in this function we do not record any state changes yet (but we do update
// any elements that are still being created, moved or resized on the svgCanvas)
const mouseMove = (evt: MouseEvent) => {
  const started = svgCanvas.getStarted();
  const currentMode = svgCanvas.getCurrentMode();
  const currentZoom = svgCanvas.getCurrentZoom();
  const currentConfig = svgCanvas.getCurrentConfig();
  const selectedElements = svgCanvas.getSelectedElems();
  const rubberBox = svgCanvas.getRubberBox();
  const svgRoot = svgCanvas.getRoot();

  if (evt.button === MouseButtons.Mid || svgCanvas.spaceKey) {
    return;
  }

  svgCanvas.setRootScreenMatrix(($('#svgcontent')[0] as any).getScreenCTM().inverse());
  let c; let cx; let cy; let dx; let dy; let len; let angle; let box;
  let selected = selectedElements[0];
  const pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, svgCanvas.getRootScreenMatrix());
  const mouseX = pt.x * currentZoom;
  const mouseY = pt.y * currentZoom;
  const shape = svgedit.utilities.getElem(svgCanvas.getId());
  const realX = mouseX / currentZoom;
  const realY = mouseY / currentZoom;
  let x = realX;
  let y = realY;

  if (!started) {
    if (svgCanvas.isBezierPathAlignToEdge) {
      if (currentMode === 'path') {
        const { xMatchPoint, yMatchPoint } = svgCanvas.findMatchPoint(mouseX, mouseY);
        const px = xMatchPoint ? xMatchPoint.x * currentZoom : mouseX;
        const py = yMatchPoint ? yMatchPoint.y * currentZoom : mouseY;
        svgCanvas.drawAlignLine(px, py, xMatchPoint, yMatchPoint);
      }
    }

    if (svgCanvas.sensorAreaInfo) {
      if (currentMode === 'select' && !PreviewModeController.isPreviewMode()) {
        const dist = Math.hypot(svgCanvas.sensorAreaInfo.x - mouseX,
          svgCanvas.sensorAreaInfo.y - mouseY);
        if (dist < SENSOR_AREA_RADIUS) {
          $('#workarea').css('cursor', 'move');
        } else if ($('#workarea').css('cursor') === 'move') {
          if (PreviewModeController.isPreviewMode() || TopBarController.getTopBarPreviewMode()) {
            $('#workarea').css('cursor', 'url(img/camera-cursor.svg), cell');
          } else {
            $('#workarea').css('cursor', 'auto');
          }
        }
      }
    }

    return;
  }

  if (currentConfig.gridSnapping) {
    x = svgedit.utilities.snapToGrid(x);
    y = svgedit.utilities.snapToGrid(y);
  }

  const updateRubberBox = () => {
    svgedit.utilities.assignAttributes(rubberBox, {
      x: Math.min(startMouseX, mouseX),
      y: Math.min(startMouseY, mouseY),
      width: Math.abs(mouseX - startMouseX),
      height: Math.abs(mouseY - startMouseY),
    }, 100);
  };

  evt.preventDefault();
  let tlist;
  switch (currentMode) {
    case 'select':
      // we temporarily use a translate on the element(s) being dragged
      // this transform is removed upon mousing up and the element is
      // relocated to the new location
      if (selectedElements[0] !== null) {
        dx = x - startX;
        dy = y - startY;

        if (currentConfig.gridSnapping) {
          dx = svgedit.utilities.snapToGrid(dx);
          dy = svgedit.utilities.snapToGrid(dy);
        }

        if (evt.shiftKey) {
          const xya = svgedit.math.snapToAngle(startX, startY, x, y);
          dx = xya.x - startX;
          dy = xya.y - startY;
        }

        if (dx !== 0 || dy !== 0) {
          len = selectedElements.length;
          for (let i = 0; i < len; i += 1) {
            selected = selectedElements[i];
            if (selected == null) {
              break;
            }
            // if (i==0) {
            //   var box = svgedit.utilities.getBBox(selected);
            //     selectedBBoxes[i].x = box.x + dx;
            //     selectedBBoxes[i].y = box.y + dy;
            // }

            // update the dummy transform in our transform list
            // to be a translate
            const xform = svgRoot.createSVGTransform();
            tlist = svgedit.transformlist.getTransformList(selected);
            // Note that if Webkit and there's no ID for this
            // element, the dummy transform may have gotten lost.
            // This results in unexpected behaviour

            xform.setTranslate(dx, dy);
            if (tlist.numberOfItems) {
              tlist.replaceItem(xform, 0);
            } else {
              tlist.appendItem(xform);
            }

            // update our internal bbox that we're tracking while dragging
            // if (tempGroup) {
            //     Array.from(tempGroup.childNodes).forEach((child) => {
            //         selectorManager.requestSelector(child).resize();
            //     });
            // }
            svgCanvas.selectorManager.requestSelector(selected).resize();
          }
          if (svgCanvas.sensorAreaInfo) {
            svgCanvas.sensorAreaInfo.dx = dx * currentZoom;
            svgCanvas.sensorAreaInfo.dy = dy * currentZoom;
          }

          if (selectedBBox) {
            if (selectedElements[0].tagName === 'ellipse') {
              ObjectPanelController.updateDimensionValues({
                cx: selectedBBox.x + selectedBBox.width / 2 + dx,
                cy: selectedBBox.y + selectedBBox.height / 2 + dy,
              });
            } else {
              ObjectPanelController.updateDimensionValues({
                x: selectedBBox.x + dx,
                y: selectedBBox.y + dy,
              });
            }
          }
          ObjectPanelController.updateObjectPanel();

          svgCanvas.call('transition', selectedElements);
        }
      }
      break;
    case 'pre_preview':
    case 'preview':
    case 'zoom':
      updateRubberBox();
      break;
    case 'multiselect':
      updateRubberBox();
      // Stop adding elements to selection when mouse moving
      // Select all intersected elements when mouse up
      break;
    case 'resize':
      // we track the resize bounding box and translate/scale the selected element
      // while the mouse is down, when mouse goes up, we use this to recalculate
      // the shape's coordinates
      onResizeMouseMove(evt, selected, x, y);
      break;
    case 'text':
      svgedit.utilities.assignAttributes(shape, {
        x,
        y,
      }, 1000);
      break;
    case 'line':
      if (currentConfig.gridSnapping) {
        x = svgedit.utilities.snapToGrid(x);
        y = svgedit.utilities.snapToGrid(y);
      }

      let x2 = x;
      let y2 = y;

      if (evt.shiftKey) {
        const xya = svgedit.math.snapToAngle(startX, startY, x2, y2, Math.PI / 4);
        x2 = xya.x;
        y2 = xya.y;
      }
      svgCanvas.selectorManager.requestSelector(selected).resize();
      shape.setAttributeNS(null, 'x2', x2);
      shape.setAttributeNS(null, 'y2', y2);
      ObjectPanelController.updateDimensionValues({ x2, y2 });
      ObjectPanelController.updateObjectPanel();
      break;
    case 'foreignObject':
    // fall through
    case 'square':
    // fall through
    case 'rect':
    // fall through
    case 'image':
      const square = (currentMode === 'square') || evt.shiftKey;
      let w = Math.abs(x - startX);
      let h = Math.abs(y - startY);
      let newX;
      let newY;
      if (square) {
        w = Math.max(w, h);
        h = w;
        newX = startX < x ? startX : startX - w;
        newY = startY < y ? startY : startY - h;
      } else {
        newX = Math.min(startX, x);
        newY = Math.min(startY, y);
      }

      if (currentConfig.gridSnapping) {
        w = svgedit.utilities.snapToGrid(w);
        h = svgedit.utilities.snapToGrid(h);
        newX = svgedit.utilities.snapToGrid(newX);
        newY = svgedit.utilities.snapToGrid(newY);
      }

      svgedit.utilities.assignAttributes(shape, {
        width: w,
        height: h,
        x: newX,
        y: newY,
      }, 1000);
      ObjectPanelController.updateDimensionValues({
        x: newX, y: newY, width: w, height: h,
      });
      ObjectPanelController.updateObjectPanel();
      svgCanvas.selectorManager.requestSelector(selected).resize();
      break;
    case 'circle':
      c = $(shape).attr(['cx', 'cy']);
      cx = c.cx;
      cy = c.cy;
      let rad = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (currentConfig.gridSnapping) {
        rad = svgedit.utilities.snapToGrid(rad);
      }
      shape.setAttributeNS(null, 'r', rad);
      break;
    case 'ellipse':
      c = $(shape).attr(['cx', 'cy']);
      cx = c.cx;
      cy = c.cy;

      shape.setAttributeNS(null, 'rx', Math.abs(x - cx));
      const ry = Math.abs(evt.shiftKey ? (x - cx) : (y - cy));
      shape.setAttributeNS(null, 'ry', ry);

      ObjectPanelController.updateDimensionValues({ rx: Math.abs(x - cx), ry });
      ObjectPanelController.updateObjectPanel();
      svgCanvas.selectorManager.requestSelector(selected).resize();
      break;
    case 'fhellipse':
    case 'fhrect':
      freehand.minx = Math.min(realX, freehand.minx);
      freehand.maxx = Math.max(realX, freehand.maxx);
      freehand.miny = Math.min(realY, freehand.miny);
      freehand.maxy = Math.max(realY, freehand.maxy);
    // break; missing on purpose
    // eslint-disable-next-line no-fallthrough
    case 'fhpath':
      end.x = realX;
      end.y = realY;
      if (controllPoint2.x && controllPoint2.y) {
        for (let i = 0; i < STEP_COUNT - 1; i += 1) {
          parameter = i / STEP_COUNT;
          nextParameter = (i + 1) / STEP_COUNT;
          bSpline = getBsplinePoint(nextParameter);
          nextPos = bSpline;
          bSpline = getBsplinePoint(parameter);
          sumDistance += Math.sqrt((nextPos.x - bSpline.x) * (nextPos.x - bSpline.x)
                                    + (nextPos.y - bSpline.y) * (nextPos.y - bSpline.y));
          if (sumDistance > THRESHOLD_DIST) {
            newDPath += `${+bSpline.x},${bSpline.y} `;
            shape.setAttributeNS(null, 'points', newDPath);
            sumDistance -= THRESHOLD_DIST;
          }
        }
      }
      controllPoint2 = {
        x: controllPoint1.x,
        y: controllPoint1.y,
      };
      controllPoint1 = {
        x: start.x,
        y: start.y,
      };
      start = {
        x: end.x,
        y: end.y,
      };
      break;
    // update path stretch line coordinates
    case 'path':
    // fall through
    case 'pathedit':
      x *= currentZoom;
      y *= currentZoom;

      if (currentConfig.gridSnapping) {
        x = svgedit.utilities.snapToGrid(x);
        y = svgedit.utilities.snapToGrid(y);
      }
      if (evt.shiftKey) {
        const { path } = svgedit.path;
        const x1 = path?.dragging ? path.dragging[0] : startX;
        const y1 = path?.dragging ? path.dragging[1] : startY;
        const xya = svgedit.math.snapToAngle(x1, y1, x, y, Math.PI / 4);
        x = xya.x;
        y = xya.y;
      }

      if (rubberBox && rubberBox.getAttribute('display') !== 'none') {
        updateRubberBox();
      }
      if (svgCanvas.isBezierPathAlignToEdge) {
        const { xMatchPoint, yMatchPoint } = svgCanvas.findMatchPoint(mouseX, mouseY);
        x = xMatchPoint ? xMatchPoint.x * currentZoom : x;
        y = yMatchPoint ? yMatchPoint.y * currentZoom : y;
        svgCanvas.drawAlignLine(x, y, xMatchPoint, yMatchPoint);
      }
      svgCanvas.pathActions.mouseMove(x, y);

      break;
    case 'textedit':
      svgCanvas.textActions.mouseMove(mouseX, mouseY);
      break;
    case 'rotate':
      box = svgedit.utilities.getBBox(selected);
      cx = box.x + box.width / 2;
      cy = box.y + box.height / 2;
      const matrix = svgedit.math.getMatrix(selected);
      const center = svgedit.math.transformPoint(cx, cy, matrix);
      cx = center.x;
      cy = center.y;
      angle = ((Math.atan2(cy - y, cx - x) * (180 / Math.PI)) - 90) % 360;
      if (currentConfig.gridSnapping) {
        angle = svgedit.utilities.snapToGrid(angle);
      }
      if (evt.shiftKey) { // restrict rotations to nice angles (WRS)
        const snap = 45;
        angle = Math.round(angle / snap) * snap;
      }
      svgCanvas.setRotationAngle(angle < -180 ? (360 + angle) : angle, true);
      svgCanvas.call('transition', selectedElements);
      ObjectPanelController.updateDimensionValues({
        rotation: angle < -180 ? (360 + angle) : angle,
      });
      ObjectPanelController.updateObjectPanel();
      if (svgedit.utilities.getElem('text_cursor')) {
        svgCanvas.textActions.init();
      }
      break;
    default:
      break;
  }

  svgCanvas.runExtensions('mouseMove', {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY,
    selected,
    ObjectPanelController,
  });
}; // mouseMove()

// - in create mode, the element's opacity is set properly, we create an InsertElementCommand
// and store it on the Undo stack
// - in move/resize mode, the element's attributes which were affected by the move/resize are
// identified, a ChangeElementCommand is created and stored on the stack for those attrs
// this is done in when we recalculate the selected dimensions()

const mouseUp = async (evt: MouseEvent, blocked = false) => {
  const started = svgCanvas.getStarted();
  const currentMode = svgCanvas.getCurrentMode();
  const currentShape = svgCanvas.getCurrentShape();
  const currentZoom = svgCanvas.getCurrentZoom();
  let selectedElements = svgCanvas.getSelectedElems();
  const rubberBox = svgCanvas.getRubberBox();
  const screenMatrix = svgCanvas.getRootScreenMatrix();
  const rightClick = evt.button === MouseButtons.Right;

  if (rightClick) {
    return;
  }
  if (blocked) {
    svgCanvas.unsafeAccess.setStarted(false);
  }
  const tempJustSelected = justSelected;
  justSelected = null;
  if (!started) {
    return;
  }
  const pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, screenMatrix);
  const { x, y } = pt;
  const realX = x;
  const realY = y;
  const mouseX = x * currentZoom;
  const mouseY = y * currentZoom;

  let element = svgedit.utilities.getElem(svgCanvas.getId());
  let keep = false;

  // TODO: Make true when in multi-unit mode
  const useUnit = false; // (currentConfig.baseUnit !== 'px');
  svgCanvas.unsafeAccess.setStarted(false);
  let attrs; let
    t;
  svgCanvas.unsafeAccess.setSelectedElements(selectedElements.filter((e) => e !== null));
  const isContinuousDrawing = BeamboxPreference.read('continuous_drawing');

  const doPreview = () => {
    const callback = () => {
      TopBarController.updateTopBar();
      if (TutorialController.getNextStepRequirement() === TutorialConstants.PREVIEW_PLATFORM) {
        TutorialController.handleNextStep();
      }
    };
    if (PreviewModeController.isPreviewMode()) {
      if (startX === realX && startY === realY) {
        PreviewModeController.preview(realX, realY, true, () => callback());
      } else {
        PreviewModeController.previewRegion(startX, startY, realX, realY, () => callback());
      }
    }
  };

  switch (currentMode) {
    case 'pre_preview':
      if (rubberBox !== null) {
        rubberBox.setAttribute('display', 'none');
        svgCanvas.clearBoundingBox();
      }
      svgCanvas.unsafeAccess.setCurrentMode('select');
      TopBarController.setStartPreviewCallback(() => {
        doPreview();
      });
      TopBarController.setShouldStartPreviewController(true);
      return;
    case 'preview':
      if (rubberBox != null) {
        rubberBox.setAttribute('display', 'none');
        svgCanvas.clearBoundingBox();
      }
      doPreview();
      svgCanvas.unsafeAccess.setCurrentMode('select');
    // intentionally fall-through to select here
    // eslint-disable-next-line no-fallthrough
    case 'resize':
    case 'multiselect':
      if (currentMode === 'multiselect') {
        svgCanvas.clearBoundingBox();
        if ((navigator.maxTouchPoints > 1 && ['MacOS', 'others'].includes(window.os))
        && Math.hypot(mouseX - startMouseX, mouseY - startMouseY) < 1) {
          // in touchable mobile, if almost not moved, select mousedown element
          selectedElements = [tempJustSelected];
        } else {
          const intersectedElements = svgCanvas.getIntersectionList().filter((elem) => {
            const layer = LayerHelper.getObjectLayer(elem);
            if (!layer) {
              return false;
            }
            const layerElem = layer.elem;
            if (layerElem.getAttribute('data-lock') || layerElem.getAttribute('display') === 'none') {
              return false;
            }
            return true;
          });
          selectedElements = intersectedElements;
        }
        svgCanvas.unsafeAccess.setSelectedElements(selectedElements);
        svgCanvas.call('selected', selectedElements);
      }
      if (rubberBox != null) {
        rubberBox.setAttribute('display', 'none');
        svgCanvas.clearBoundingBox();
      }
      $('.tool-btn').removeClass('active');
      $('#left-Cursor').addClass('active');
      $('#left-Shoot').addClass('active');
    // eslint-disable-next-line no-fallthrough
    case 'select':
      if (selectedElements[0]) {
        // if we only have one selected element
        if (!selectedElements[1]) {
          // set our current stroke/fill properties to the element's
          const selected = selectedElements[0];
          switch (selected.tagName) {
            case 'g':
            case 'use':
            case 'image':
            case 'foreignObject':
              break;
            default:
              let val = selected.getAttribute('fill');
              if (val !== null) svgCanvas.setCurrentStyleProperties('fill', val);
              val = selected.getAttribute('fill-opacity');
              if (val !== null) svgCanvas.setCurrentStyleProperties('fill_opacity', val);
              val = selected.getAttribute('stroke');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke', val);
              val = selected.getAttribute('stroke-opacity');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke_opacity', val);
              val = selected.getAttribute('stroke-width');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke_width', val);
              val = selected.getAttribute('stroke-dasharray');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke_dasharray', val);
              val = selected.getAttribute('stroke-linejoin');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke_linejoin', val);
              val = selected.getAttribute('stroke-linecap');
              if (val !== null) svgCanvas.setCurrentStyleProperties('stroke_linecap', val);
          }

          if (selected.tagName === 'text') {
            const curText = textEdit.getCurText();
            curText.font_size = selected.getAttribute('font-size');
            if (window.os === 'MacOS' && window.FLUX.version !== 'web') {
              curText.font_family = selected.getAttribute('data-font-family');
            } else {
              curText.font_family = selected.getAttribute('font-family');
            }
            curText.font_postscriptName = selected.getAttribute('font-postscript');
            textEdit.updateCurText(curText);
          }
          svgCanvas.selectorManager.requestSelector(selected).show(true);

          const targetLayer = LayerHelper.getObjectLayer(selected);
          const currentLayer = svgCanvas.getCurrentDrawing().getCurrentLayer();
          if (targetLayer
              && !selectedElements.includes(targetLayer.elem)
              && targetLayer.elem !== currentLayer) {
            svgCanvas.setCurrentLayer(targetLayer.title);
            LayerPanelController.setSelectedLayers([targetLayer.title]);
          }
        }
        // always recalculate dimensions to strip off stray identity transforms
        const cmd = svgCanvas.recalculateAllSelectedDimensions(true);
        if (cmd && !cmd.isEmpty()) {
          mouseSelectModeCmds.push(cmd);
        }
        // if it was being dragged/resized
        if (mouseX !== startMouseX || mouseY !== startMouseY) {
          let i; const
            len = selectedElements.length;
          if (currentMode === 'resize') {
            const allSelectedUses = [];
            selectedElements.forEach((e) => {
              if (e.tagName === 'use') {
                allSelectedUses.push(e);
              } else if (e.tagName === 'g') {
                allSelectedUses.push(...Array.from(e.querySelectorAll('use')));
              }
            });
            SymbolMaker.reRenderImageSymbolArray(allSelectedUses);
          }
          if (currentMode !== 'multiselect') {
            // Not sure if this is necessary, but multiselect does not need this
            for (i = 0; i < len; i += 1) {
              if (selectedElements[i] == null) {
                break;
              }
              if (!selectedElements[i].firstChild && selectedElements[i].tagName !== 'use') {
                // Not needed for groups (incorrectly resizes elems), possibly not needed at all?
                svgCanvas.selectorManager.requestSelector(selectedElements[i]).resize();
              }
            }
          }
          svgCanvas.unsafeAccess.setCurrentMode('select');
        } else {
          // no change in position/size, so maybe we should move to pathedit
          svgCanvas.unsafeAccess.setCurrentMode('select');
          t = evt.target;
          if (selectedElements[0].nodeName === 'path'
            && selectedElements[1] == null) {
            // if it was a path
            svgCanvas.pathActions.select(selectedElements[0]);
          } else if (evt.shiftKey) {
            // else, if it was selected and this is a shift-click, remove it from selection
            if (tempJustSelected !== t) {
              svgCanvas.removeFromSelection([t]);
            }
          }
        } // no change in mouse position

        // Remove non-scaling stroke
        if (svgedit.browser.supportsNonScalingStroke()) {
          const elem = selectedElements[0];
          if (elem) {
            elem.removeAttribute('style');
            svgedit.utilities.walkTree(elem, (el: Element) => {
              el.removeAttribute('style');
            });
          }
        }
        if (svgCanvas.sensorAreaInfo) {
          svgCanvas.sensorAreaInfo.x += svgCanvas.sensorAreaInfo.dx;
          svgCanvas.sensorAreaInfo.y += svgCanvas.sensorAreaInfo.dy;
          svgCanvas.sensorAreaInfo.dx = 0;
          svgCanvas.sensorAreaInfo.dy = 0;
        }
      } else {
        svgCanvas.unsafeAccess.setCurrentMode('select');
      }

      if (selectedElements.length > 1) {
        svgCanvas.tempGroupSelectedElements();
        svgEditor.updateContextPanel();
      }

      if (mouseSelectModeCmds.length > 1) {
        const batchCmd = new history.BatchCommand('Mouse Event');
        for (let i = 0; i < mouseSelectModeCmds.length; i += 1) {
          batchCmd.addSubCommand(mouseSelectModeCmds[i]);
        }
        svgCanvas.addCommandToHistory(batchCmd);
      } else if (mouseSelectModeCmds.length === 1) {
        svgCanvas.addCommandToHistory(mouseSelectModeCmds[0]);
      }

      return;
    // zoom is broken
    case 'zoom':
      if (rubberBox != null) {
        rubberBox.setAttribute('display', 'none');
      }
      svgCanvas.call('zoomed');
      return;
    case 'fhpath':
      // Check that the path contains at least 2 points; a degenerate one-point path
      // causes problems.
      // Webkit ignores how we set the points attribute with commas and uses space
      // to separate all coordinates, see https://bugs.webkit.org/show_bug.cgi?id=29870
      sumDistance = 0;
      controllPoint2 = {
        x: 0,
        y: 0,
      };
      controllPoint1 = {
        x: 0,
        y: 0,
      };
      start = {
        x: 0,
        y: 0,
      };
      end = {
        x: 0,
        y: 0,
      };
      const coords = element.getAttribute('points');
      const commaIndex = coords.indexOf(',');
      if (commaIndex >= 0) {
        keep = coords.indexOf(',', commaIndex + 1) >= 0;
      } else {
        keep = coords.indexOf(' ', coords.indexOf(' ') + 1) >= 0;
      }
      if (keep) {
        element = svgCanvas.pathActions.smoothPolylineIntoPath(element);
      }
      break;
    case 'line':
      attrs = $(element).attr(['x1', 'x2', 'y1', 'y2']);
      keep = (attrs.x1 !== attrs.x2 || attrs.y1 !== attrs.y2);
      if (!isContinuousDrawing) {
        svgCanvas.setMode('select');
      }
      break;
    case 'foreignObject':
    case 'square':
    case 'rect':
      attrs = $(element).attr(['width', 'height']);
      keep = (attrs.width !== 0 && attrs.height !== 0);
      if (TutorialController.getNextStepRequirement() === TutorialConstants.DRAW_A_RECT && keep) {
        TutorialController.handleNextStep();
        svgCanvas.setMode('select');
      } else if (!isContinuousDrawing) {
        svgCanvas.setMode('select');
      }
      break;
    case 'image':
      // Image should be kept regardless of size (use inherit dimensions later)
      keep = true;
      svgCanvas.unsafeAccess.setCurrentMode('select');
      $('.tool-btn').removeClass('active');
      $('#left-Cursor').addClass('active');
      break;
    case 'circle':
      keep = (element.getAttribute('r') !== 0);
      break;
    case 'ellipse':
      attrs = $(element).attr(['rx', 'ry']);
      keep = (attrs.rx > 0 && attrs.ry > 0);
      if (TutorialController.getNextStepRequirement() === TutorialConstants.DRAW_A_CIRCLE && keep) {
        TutorialController.handleNextStep();
        svgCanvas.setMode('select');
      } else if (!isContinuousDrawing) {
        svgCanvas.setMode('select');
      }
      break;
    case 'fhellipse':
      if ((freehand.maxx - freehand.minx) > 0
        && (freehand.maxy - freehand.miny) > 0) {
        element = svgCanvas.addSvgElementFromJson({
          element: 'ellipse',
          curStyles: true,
          attr: {
            cx: (freehand.minx + freehand.maxx) / 2,
            cy: (freehand.miny + freehand.maxy) / 2,
            rx: (freehand.maxx - freehand.minx) / 2,
            ry: (freehand.maxy - freehand.miny) / 2,
            id: svgCanvas.getId(),
          },
        });
        svgCanvas.call('changed', [element]);
        keep = true;
      }
      break;
    case 'fhrect':
      if ((freehand.maxx - freehand.minx) > 0
        && (freehand.maxy - freehand.miny) > 0) {
        element = svgCanvas.addSvgElementFromJson({
          element: 'rect',
          curStyles: true,
          attr: {
            x: freehand.minx,
            y: freehand.miny,
            width: (freehand.maxx - freehand.minx),
            height: (freehand.maxy - freehand.miny),
            id: svgCanvas.getId(),
          },
        });
        svgCanvas.call('changed', [element]);
        keep = true;
      }
      break;
    case 'text':
      keep = true;
      svgCanvas.selectOnly([element]);
      svgCanvas.textActions.start(element);
      break;
    case 'polygon':
      // Polygon creation is in ext-polygon.js
      TopBarHintsController.removeHint();
      break;
    case 'path':
      // set element to null here so that it is not removed nor finalized
      element = null;
      // continue to be set to true so that mouseMove happens
      svgCanvas.unsafeAccess.setStarted(true);
      $('#x_align_line').remove();
      $('#y_align_line').remove();

      const res = svgCanvas.pathActions.mouseUp(evt, element, mouseX, mouseY);
      element = res.element;
      keep = res.keep;
      break;
    case 'pathedit':
      keep = true;
      element = null;
      $('#x_align_line').remove();
      $('#y_align_line').remove();
      svgCanvas.pathActions.mouseUp(evt);
      break;
    case 'textedit':
      keep = false;
      element = null;
      svgCanvas.textActions.mouseUp(evt, mouseX, mouseY);
      break;
    case 'rotate':
      keep = true;
      element = null;
      svgCanvas.unsafeAccess.setCurrentMode('select');
      $('.tool-btn').removeClass('active');
      $('#left-Cursor').addClass('active');
      const batchCmd = svgCanvas.undoMgr.finishUndoableChange();
      if (!batchCmd.isEmpty()) {
        svgCanvas.addCommandToHistory(batchCmd);
      }
      // perform recalculation to weed out any stray identity transforms that might get stuck
      svgCanvas.recalculateAllSelectedDimensions();
      svgCanvas.call('changed', selectedElements);
      break;
    default:
      // This could occur in an extension
      break;
  }

  if (selectedElements.length > 1) {
    svgCanvas.tempGroupSelectedElements();
    svgEditor.updateContextPanel();
  }

  const extResult = svgCanvas.runExtensions('mouseUp', {
    event: evt,
    mouse_x: mouseX,
    mouse_y: mouseY,
    isContinuousDrawing,
  }, true);

  let startedFlag = svgCanvas.getStarted();

  $.each(extResult, (i, r: any) => {
    if (r) {
      keep = r.keep || keep;
      element = r.element;
      startedFlag = r.started || startedFlag;
    }
  });

  svgCanvas.unsafeAccess.setStarted(startedFlag);

  if (!keep && element != null) {
    svgCanvas.getCurrentDrawing().releaseId(svgCanvas.getId());
    svgedit.transformlist.removeElementFromListMap(element);
    svgCanvas.selectorManager.releaseSelector(element);
    element.parentNode.removeChild(element);
    element = null;
    t = evt.target;
    svgCanvas.clearSelection();

    // if this element is in a group, go up until we reach the top-level group
    // just below the layer groups
    // TODO: once we implement links, we also would have to check for <a> elements
    try {
      while (t.parentNode.parentNode.tagName === 'g') {
        t = t.parentNode;
      }
    } catch (e) {
      console.log(t, 'has no g parent');
      throw e;
    }
    // if we are not in the middle of creating a path, and we've clicked on some shape,
    // then go to Select mode.
    // WebKit returns <div> when the canvas is clicked, Firefox/Opera return <svg>
    if ((currentMode !== 'path' || !svgCanvas.pathActions.hasDrawingPath())
      && t.parentNode.id !== 'selectorParentGroup'
      && t.id !== 'svgcanvas' && t.id !== 'svgRoot') {
      // switch into "select" mode if we've clicked on an element
      svgCanvas.setMode('select');
      svgCanvas.selectOnly([t], true);
    }
  } else if (element != null) {
    svgCanvas.addedNew = true;

    if (useUnit) {
      svgedit.units.convertAttrs(element);
    }

    let duration = 0.2;
    let clonedAnimation;
    if (svgCanvas.opacityAnimation.beginElement && element.getAttribute('opacity') !== currentShape.opacity) {
      clonedAnimation = $(svgCanvas.opacityAnimation).clone().attr({
        to: currentShape.opacity,
        dur: duration,
      }).appendTo(element);
      try {
        // Fails in FF4 on foreignObject
        clonedAnimation[0].beginElement();
      } catch (e) {
        console.error('SVGAnimation error', e);
      }
    } else {
      duration = 0;
    }

    // Ideally this would be done on the endEvent of the animation,
    // but that doesn't seem to be supported in Webkit
    setTimeout(() => {
      if (clonedAnimation) {
        clonedAnimation.remove();
      }
      element.setAttribute('opacity', currentShape.opacity);
      element.setAttribute('style', 'pointer-events:inherit');
      svgCanvas.cleanupElement(element);
      svgCanvas.addCommandToHistory(new history.InsertElementCommand(element));
      if (svgCanvas.getCurrentConfig().selectNew && !isContinuousDrawing) {
        if (currentMode === 'textedit') {
          svgCanvas.selectorManager.requestSelector(element).show(true);
        } else if (element.parentNode) {
          svgCanvas.selectOnly([element], true);
          svgCanvas.call('changed', [element]);
        }
      }
    }, duration * 1000);
  }
  if (isContinuousDrawing && svgCanvas.getCurrentMode() !== 'textedit') {
    svgCanvas.clearSelection();
  }

  svgCanvas.unsafeAccess.setStartTransform(null);
};

const mouseEnter = (evt: MouseEvent) => {
  if (svgCanvas.getStarted() && (evt.buttons & MouseButtons.Mid) === 0) {
    mouseUp(evt);
  }
};

const dblClick = (evt: MouseEvent) => {
  const currentMode = svgCanvas.getCurrentMode();
  const screenMatrix = svgCanvas.getRootScreenMatrix();
  const parent = (evt.target as SVGElement).parentNode as SVGElement;

  // Do nothing if already in current group
  if (parent === svgCanvas.getCurrentGroup()) {
    return;
  }
  const mouseTarget: Element = svgCanvas.getMouseTarget(evt);
  const { tagName } = mouseTarget;
  if (!['textedit', 'text'].includes(currentMode)) {
    if (tagName === 'text') {
      const pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, screenMatrix);
      svgCanvas.textActions.select(mouseTarget, pt.x, pt.y);
    } else if (mouseTarget.getAttribute('data-textpath-g')) {
      const pt = svgedit.math.transformPoint(evt.pageX, evt.pageY, screenMatrix);
      const clickOnText = ['text', 'textPath'].includes((evt.target as SVGElement).tagName);
      const text = mouseTarget.querySelector('text');
      const path = mouseTarget.querySelector('path');
      if (text && clickOnText) {
        svgCanvas.selectorManager.releaseSelector(mouseTarget);
        svgCanvas.textActions.select(text, pt.x, pt.y);
      } else if (path) {
        svgCanvas.pathActions.toEditMode(path);
      }
    }
  } else if (currentMode === 'textedit') {
    const curtext = svgCanvas.textActions.getCurtext();
    if (
      curtext === mouseTarget
      || (mouseTarget?.getAttribute('data-textpath-g') && mouseTarget?.querySelector('text') === curtext)
    ) {
      svgCanvas.textActions.dbClickSelectAll();
    }
  }

  if ((tagName === 'g' || tagName === 'a') && svgedit.utilities.getRotationAngle(mouseTarget)) {
    // TODO: Ingroup Edit Mode

    // Ungroup and regroup
    // pushGroupProperties(mouseTarget);
    // mouseTarget = selectedElements[0];
    // clearSelection(true);
    return;
  }
  // Reset context
  if (svgCanvas.getCurrentGroup()) {
    svgCanvas.leaveContext();
  }

  if ((parent.tagName !== 'g' && parent.tagName !== 'a')
    || parent === svgCanvas.getCurrentDrawing().getCurrentLayer()
    || mouseTarget === svgCanvas.selectorManager.selectorParentGroup) {
    // Escape from in-group edit

  }
  // setContext(mouseTarget);
};

// prevent links from being followed in the canvas
const handleLinkInCanvas = (e: MouseEvent) => {
  e.preventDefault();
  return false;
};

// Register wheel events
const onMouseWheel = (() => {
  let targetZoom;
  let timer;
  let trigger = Date.now();

  return (e: any) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    const evt = e.originalEvent;
    evt.stopImmediatePropagation();
    evt.preventDefault();

    targetZoom = svgCanvas.getZoom();

    const mouseInputDevice = BeamboxPreference.read('mouse_input_device');
    const isTouchpad = (mouseInputDevice === 'TOUCHPAD');

    function zoomProcess() {
      // End of animation
      const currentZoom = svgCanvas.getZoom();
      if ((currentZoom === targetZoom) || (Date.now() - trigger > 500)) {
        clearInterval(timer);
        timer = undefined;
        return;
      }

      // Calculate next animation zoom level
      let nextZoom = currentZoom + (targetZoom - currentZoom) / 5;

      if (Math.abs(targetZoom - currentZoom) < 0.005) {
        nextZoom = targetZoom;
      }

      const cursorPosition = {
        x: evt.pageX,
        y: evt.pageY,
      };

      svgCanvas.call('zoomed', {
        zoomLevel: nextZoom,
        staticPoint: cursorPosition,
      });
    }

    function zoomAsIllustrator() {
      const delta = evt.wheelDelta || (evt.detail ? -evt.detail : 0);
      if (isTouchpad) {
        targetZoom *= 1.1 ** (delta / 100);
      } else {
        targetZoom *= 1.1 ** (delta / 50);
      }

      targetZoom = Math.min(20, targetZoom);
      targetZoom = Math.max(0.1, targetZoom);
      if ((targetZoom > 19) && (delta > 0)) {
        return;
      }

      if (!timer) {
        const interval = 20;
        timer = setInterval(zoomProcess, interval);
      }

      // due to wheel event bug (which zoom gesture will sometimes block all other processes),
      // we trigger the zoomProcess about every few miliseconds
      if (Date.now() - trigger > 20) {
        zoomProcess();
        trigger = Date.now();
      }
    }

    function panAsIllustrator() {
      requestAnimationFrame(() => {
        const scrollLeft = $('#workarea').scrollLeft() + evt.deltaX / 2.0;
        const scrollTop = $('#workarea').scrollTop() + evt.deltaY / 2.0;
        $('#workarea').scrollLeft(scrollLeft);
        $('#workarea').scrollTop(scrollTop);
      });
    }

    if (isTouchpad) {
      if (e.ctrlKey) {
        zoomAsIllustrator();
      } else {
        panAsIllustrator();
      }
    } else {
      zoomAsIllustrator();
      // panning is default behavior when pressing middle button
    }
  };

  // TODO(rafaelcastrocouto): User preference for shift key and zoom facto
})();

const registerEvents = () => {
  // Added mouseup to the container here.
  // TODO(codedread): Figure out why after the Closure compiler, the window mouseup is ignored.
  const container = svgCanvas.getContainer();
  container.addEventListener('click', handleLinkInCanvas);
  // iPad or other pads
  if (navigator.maxTouchPoints > 1 && ['MacOS', 'others'].includes(window.os)) {
    window.addEventListener('gesturestart', (e) => e.preventDefault());
    window.addEventListener('gesturechange', (e) => e.preventDefault());
    window.addEventListener('gestureend', (e) => e.preventDefault());
    const workarea = document.getElementById('workarea');
    touchEvents.setupCanvasTouchEvents(
      container,
      workarea,
      mouseDown,
      mouseMove,
      mouseUp,
      dblClick,
      () => svgCanvas.getZoom(),
      (zoom, staticPoint) => svgCanvas.call('zoomed', {
        zoomLevel: zoom,
        staticPoint,
      }),
    );
  } else {
    svgCanvas.getContainer().addEventListener('mousedown', mouseDown);
    svgCanvas.getContainer().addEventListener('mousemove', mouseMove);
    svgCanvas.getContainer().addEventListener('mouseup', mouseUp);
    svgCanvas.getContainer().addEventListener('mouseenter', mouseEnter);
    svgCanvas.getContainer().addEventListener('dblclick', dblClick);

    if (window.FLUX.version === 'web') {
      const onWindowScroll = (e) => {
        if (e.ctrlKey) e.preventDefault();
      };
      window.addEventListener('wheel', onWindowScroll, { passive: false });
      window.addEventListener('DOMMouseScroll', onWindowScroll, { passive: false });
    }

    if (svgedit.browser.isSafari()) {
      window.addEventListener('gesturestart', (e) => e.preventDefault());
      window.addEventListener('gesturechange', (e) => e.preventDefault());
      window.addEventListener('gestureend', (e) => e.preventDefault());
      let startZoom: number;
      let currentScale = 1;
      container.addEventListener('gesturestart', (e: any) => {
        startZoom = svgCanvas.getZoom();
        currentScale = e.scale;
      });
      container.addEventListener('gesturechange', (e: any) => {
        const { clientX, clientY, scale } = e;
        if (startZoom && Math.abs(Math.log(currentScale / scale)) >= Math.log(1.05)) {
          const newZoom = startZoom * (scale ** 0.5);
          svgCanvas.call('zoomed', {
            zoomLevel: newZoom,
            staticPoint: { x: clientX, y: clientY },
          });
          currentScale = scale;
        }
      });
    }
  }
  $(container).bind('wheel DOMMouseScroll', onMouseWheel);
};

const MouseInteractions = {
  register: (canvas: ISVGCanvas): void => {
    svgCanvas = canvas;
    registerEvents();
  },
};

export default MouseInteractions;
