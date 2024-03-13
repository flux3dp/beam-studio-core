import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import NS from 'app/constants/namespaces';
import { getWorkarea } from 'app/constants/workarea-constants';

const documentPanelEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

let diodeBoundaryPath: SVGPathElement;
let diodeBoundarySvg: SVGSVGElement;
const createBoundary = () => {
  diodeBoundarySvg = document.createElementNS(NS.SVG, 'svg') as unknown as SVGSVGElement;
  diodeBoundaryPath = document.createElementNS(NS.SVG, 'path') as unknown as SVGPathElement;
  document.getElementById('canvasBackground')?.appendChild(diodeBoundarySvg);
  diodeBoundarySvg.appendChild(diodeBoundaryPath);
  const workarea = getWorkarea(BeamboxPreference.read('workarea'));
  const { pxWidth, pxHeight, pxDisplayHeight } = workarea;
  diodeBoundarySvg.setAttribute('id', 'diode-boundary');
  diodeBoundarySvg.setAttribute('width', '100%');
  diodeBoundarySvg.setAttribute('height', '100%');
  diodeBoundarySvg.setAttribute('viewBox', `0 0 ${pxWidth} ${pxDisplayHeight ?? pxHeight}`);
  diodeBoundarySvg.setAttribute('x', '0');
  diodeBoundarySvg.setAttribute('y', '0');
  diodeBoundarySvg.setAttribute('style', 'pointer-events:none');

  diodeBoundaryPath.setAttribute('fill', '#CCC');
  diodeBoundaryPath.setAttribute('fill-opacity', '0.4');
  diodeBoundaryPath.setAttribute('fill-rule', 'evenodd');
  diodeBoundaryPath.setAttribute('stroke', 'none');
  diodeBoundaryPath.setAttribute('style', 'pointer-events:none');
};

const updateCanvasSize = (): void => {
  const workarea = getWorkarea(BeamboxPreference.read('workarea'));
  const { pxWidth, pxHeight, pxDisplayHeight } = workarea;
  const viewBox = `0 0 ${pxWidth} ${pxDisplayHeight ?? pxHeight}`;
  diodeBoundarySvg?.setAttribute('viewBox', viewBox);
};
documentPanelEventEmitter.on('workarea-change', updateCanvasSize);

const show = (isDiode = false): void => {
  if (!diodeBoundaryPath) createBoundary();
  const workarea = getWorkarea(BeamboxPreference.read('workarea'));
  const w = workarea.pxWidth;
  const h = workarea.pxDisplayHeight ?? workarea.pxHeight;

  let d = '';
  if (isDiode) {
    let offsetX = BeamboxPreference.read('diode_offset_x') ?? Constant.diode.defaultOffsetX;
    let offsetY = BeamboxPreference.read('diode_offset_y') ?? Constant.diode.defaultOffsetY;
    offsetX = Math.max(offsetX, 0);
    offsetY = Math.max(offsetY, 0);
    const limitXL = offsetX * Constant.dpmm;
    const limitYT = offsetY * Constant.dpmm;
    d = `M0,0H${w}V${limitYT}H${limitXL}V${h}H0V0`;
  } else {
    const limitXR = Constant.diode.limitX * Constant.dpmm;
    const limitYB = Constant.diode.limitY * Constant.dpmm;
    d = `M${w},${h}H0,V${h - limitYB}H${w - limitXR}V0H${w}V${h}`;
  }
  diodeBoundaryPath.setAttribute('d', d);
};
const hide = (): void => {
  if (!diodeBoundaryPath) return;
  diodeBoundaryPath.setAttribute('d', '');
};

export default {
  show,
  hide,
  updateCanvasSize,
};
