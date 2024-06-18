import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import cursorIconUrl from 'app/icons/left-panel/curve-select.svg?url';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import NS from 'app/constants/namespaces';
import workareaManager from 'app/svgedit/workarea';
import { CanvasMode } from 'app/contexts/CanvasContext';
import { CurveEngraving, MeasureData } from 'interfaces/ICurveEngraving';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea } from 'app/constants/workarea-constants';
import { showCurveEngraving } from 'app/components/dialogs/CurveEngraving/CurveEngraving';
import { showMeasureArea } from 'app/components/dialogs/CurveEngraving/MeasureArea';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');

// TODO: add unit tests
class CurveEngravingModeController {
  started: boolean;

  data: CurveEngraving;

  boundarySvg: SVGSVGElement;

  boundaryPath: SVGPathElement;

  areaPath: SVGPathElement;

  constructor() {
    this.started = false;
    this.data = null;
    canvasEventEmitter.on('canvas-change', this.updateContainer);
  }

  start = () => {
    this.started = true;
    this.updateBoundaryPath();
    this.toAreaSelectMode();
    canvasEventEmitter.emit('SET_MODE', CanvasMode.CurveEngraving);
  };

  end = () => {
    this.started = false;
    this.updateBoundaryPath();
  };

  backToPreview = () => {
    this.end();
    svgCanvas.setMode('select');
    const workarea = document.querySelector('#workarea');
    if (workarea) {
      (workarea as HTMLDivElement).style.cursor = 'url(img/camera-cursor.svg), cell';
    }
    canvasEventEmitter.emit('SET_MODE', CanvasMode.Preview);
  };

  toAreaSelectMode = () => {
    svgCanvas.setMode('curve-engraving');
    const workarea = document.querySelector('#workarea');
    if (workarea) {
      (workarea as HTMLDivElement).style.cursor = `url(${cursorIconUrl}) 25 7, cell`;
    }
  };

  toCanvasSelectMode = () => {
    svgCanvas.setMode('select');
    const workarea = document.querySelector('#workarea');
    if (workarea) {
      (workarea as HTMLDivElement).style.cursor = 'auto';
    }
  };

  applyMeasureData = (data: MeasureData) => {
    this.data = { ...this.data, ...data };
  }

  setArea = async (bbox: { x: number; y: number; width: number; height: number }) => {
    let { x, y, width, height } = bbox;
    const workarea = beamboxPreference.read('workarea');
    const { width: workareaW, height: workareaH, autoFocusOffset = [0, 0, 0] } = getWorkarea(workarea);
    const leftBound = autoFocusOffset[0] > 0 ? autoFocusOffset[0] : 0;
    const rightBound = autoFocusOffset[0] < 0 ? workareaW + autoFocusOffset[0] : workareaW;
    const topBound = autoFocusOffset[1] > 0 ? autoFocusOffset[1] : 0;
    const bottomBound = autoFocusOffset[1] < 0 ? workareaH + autoFocusOffset[1] : workareaH;
    if (x < leftBound) {
      width -= leftBound - x;
      x = leftBound;
    }
    if (x + width > rightBound) {
      width = rightBound - x;
    }
    if (y < topBound) {
      height -= topBound - y;
      y = topBound;
    }
    if (y + height > bottomBound) {
      height = bottomBound - y;
    }
    if (width <= 0 || height <= 0) return;
    const newBBox = { x, y, width, height };
    const res = await showMeasureArea(newBBox);
    if (!res) return;
    this.data = { bbox, ...res };
    await showCurveEngraving(this.data, this.applyMeasureData);
    this.updateAreaPath();
    canvasEventEmitter.emit('CURVE_ENGRAVING_AREA_SET');
  };

  clearArea = () => {
    this.data = null;
    this.updateAreaPath();
    canvasEventEmitter.emit('CURVE_ENGRAVING_AREA_SET');
  };

  hasArea = () => Boolean(this.data);

  preview = async () => {
    if (!this.data) return;
    showCurveEngraving(this.data, this.applyMeasureData);
  };

  createContainer = () => {
    if (this.boundarySvg) return;
    this.boundarySvg = document.createElementNS(NS.SVG, 'svg') as unknown as SVGSVGElement;
    this.boundarySvg.setAttribute('id', 'curve-engraving-boundary');
    this.boundarySvg.setAttribute('width', '100%');
    this.boundarySvg.setAttribute('height', '100%');
    const { width, height } = workareaManager;
    this.boundarySvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.boundarySvg.setAttribute('style', 'pointer-events:none');
    document.getElementById('canvasBackground')?.appendChild(this.boundarySvg);
  };

  updateContainer = () => {
    if (!this.boundarySvg) return;
    const { width, height } = workareaManager;
    this.boundarySvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.updateBoundaryPath();
  };

  updateBoundaryPath = () => {
    this.createContainer();
    if (!this.started) {
      this.boundaryPath?.setAttribute('d', '');
      return;
    }
    if (!this.boundaryPath) {
      this.boundaryPath = document.createElementNS(NS.SVG, 'path') as SVGPathElement;
      this.boundaryPath.setAttribute('fill', '#CCC');
      this.boundaryPath.setAttribute('fill-opacity', '0.4');
      this.boundaryPath.setAttribute('fill-rule', 'evenodd');
      this.boundaryPath.setAttribute('stroke', 'none');
      this.boundarySvg.appendChild(this.boundaryPath);
    }
    const workarea = beamboxPreference.read('workarea');
    const { width: workareaW, height: workareaH, autoFocusOffset = [0, 0, 0] } = getWorkarea(workarea);
    const { width, height } = workareaManager;
    const { dpmm } = constant;
    const leftBound = (autoFocusOffset[0] > 0 ? autoFocusOffset[0] : 0) * dpmm;
    const rightBound = (autoFocusOffset[0] < 0 ? workareaW + autoFocusOffset[0] : workareaW) * dpmm;
    const topBound = (autoFocusOffset[1] > 0 ? autoFocusOffset[1] : 0) * dpmm;
    const bottomBound =
      (autoFocusOffset[1] < 0 ? workareaH + autoFocusOffset[1] : workareaH) * dpmm;
    const d1 = `M0,0H${width}V${height}H0V0Z`;
    const d2 = `M${leftBound},${topBound}H${rightBound}V${bottomBound}H${leftBound}V${topBound}Z`;
    this.boundaryPath.setAttribute('d', `${d1} ${d2}`);
  };

  updateAreaPath = () => {
    this.createContainer();
    if (!this.data) {
      this.areaPath?.setAttribute('d', '');
      return;
    }
    if (!this.areaPath) {
      this.areaPath = document.createElementNS(NS.SVG, 'path') as SVGPathElement;
      this.areaPath.setAttribute('fill', '#1890ff');
      this.areaPath.setAttribute('fill-opacity', '0.25');
      this.areaPath.setAttribute('fill-rule', 'evenodd');
      this.areaPath.setAttribute('stroke', '#1890ff');
      this.areaPath.setAttribute('stroke-width', '5');
      this.boundarySvg.appendChild(this.areaPath);
    }
    const { width, height } = workareaManager;
    let { x, y, width: w, height: h } = this.data.bbox;
    const { dpmm } = constant;
    x *= dpmm;
    y *= dpmm;
    w *= dpmm;
    h *= dpmm;
    const d1 = `M0,0H${width}V${height}H0V0Z`;
    const d2 = `M${x},${y}H${x + w}V${y + h}H${x}V${y}Z`;
    this.areaPath.setAttribute('d', `${d1} ${d2}`);
  };
}

const curveEngravingModeController = new CurveEngravingModeController();

export default curveEngravingModeController;
