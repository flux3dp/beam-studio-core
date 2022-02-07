import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

const { $, svgedit } = window;
const documentPanelEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

let diodeBoundaryPath: SVGPathElement;
let diodeBoundarySvg: SVGSVGElement;
const createBoundary = () => {
  diodeBoundarySvg = document.createElementNS(svgedit.NS.SVG, 'svg') as unknown as SVGSVGElement;
  diodeBoundaryPath = document.createElementNS(svgedit.NS.SVG, 'path') as unknown as SVGPathElement;
  $('#canvasBackground').append(diodeBoundarySvg);
  diodeBoundarySvg.appendChild(diodeBoundaryPath);
  $(diodeBoundarySvg).attr({
    id: 'diode-boundary',
    width: '100%',
    height: '100%',
    viewBox: `0 0 ${Constant.dimension.getWidth(BeamboxPreference.read('workarea'))} ${Constant.dimension.getHeight(BeamboxPreference.read('workarea'))}`,
    x: 0,
    y: 0,
    style: 'pointer-events:none',
  });
  $(diodeBoundaryPath).attr({
    fill: '#CCC',
    'fill-opacity': 0.4,
    'fill-rule': 'evenodd',
    stroke: 'none',
    style: 'pointer-events:none',
  });
};

const updateCanvasSize = (): void => {
  const viewBox = `0 0 ${Constant.dimension.getWidth(BeamboxPreference.read('workarea'))} ${Constant.dimension.getHeight(BeamboxPreference.read('workarea'))}`;
  diodeBoundarySvg?.setAttribute('viewBox', viewBox);
};
documentPanelEventEmitter.on('workarea-change', updateCanvasSize);

const show = (isDiode = false): void => {
  if (!diodeBoundaryPath) createBoundary();
  const w = Constant.dimension.getWidth(BeamboxPreference.read('workarea'));
  const h = Constant.dimension.getHeight(BeamboxPreference.read('workarea'));

  let d = '';
  if (isDiode) {
    let offsetX = BeamboxPreference.read('diode_offset_x') !== undefined ? BeamboxPreference.read('diode_offset_x') : Constant.diode.defaultOffsetX;
    let offsetY = BeamboxPreference.read('diode_offset_y') !== undefined ? BeamboxPreference.read('diode_offset_y') : Constant.diode.defaultOffsetY;
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
