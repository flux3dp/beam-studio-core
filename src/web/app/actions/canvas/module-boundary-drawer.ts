import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import Constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import LayerModule from 'app/constants/layer-module/layer-modules';
import moduleBoundary from 'app/constants/layer-module/module-boundary';

const { svgedit } = window;
const documentPanelEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');

let boundarySvg: SVGSVGElement;
let boundaryPath: SVGPathElement;

const createBoundary = () => {
  boundarySvg = document.createElementNS(svgedit.NS.SVG, 'svg') as unknown as SVGSVGElement;
  boundaryPath = document.createElementNS(svgedit.NS.SVG, 'path') as unknown as SVGPathElement;
  document.getElementById('canvasBackground')?.appendChild(boundarySvg);
  const workarea = BeamboxPreference.read('workarea');
  boundarySvg.appendChild(boundaryPath);
  boundarySvg.setAttribute('id', 'module-boundary');
  boundarySvg.setAttribute('x', '0');
  boundarySvg.setAttribute('y', '0');
  boundarySvg.setAttribute('width', '100%');
  boundarySvg.setAttribute('height', '100%');
  boundarySvg.setAttribute(
    'viewBox',
    `0 0 ${Constant.dimension.getWidth(workarea)} ${Constant.dimension.getHeight(workarea)}`
  );
  boundarySvg.setAttribute('style', 'pointer-events:none');

  boundaryPath.setAttribute('fill', '#CCC');
  boundaryPath.setAttribute('fill-opacity', '0.4');
  boundaryPath.setAttribute('fill-rule', 'evenodd');
  boundaryPath.setAttribute('stroke', 'none');
  boundaryPath.setAttribute('style', 'pointer-events:none');
};

const updateCanvasSize = (): void => {
  const workarea = BeamboxPreference.read('workarea');
  const viewBox = `0 0 ${Constant.dimension.getWidth(workarea)} ${Constant.dimension.getHeight(workarea)}`;
  boundarySvg?.setAttribute('viewBox', viewBox);
};
documentPanelEventEmitter.on('workarea-change', updateCanvasSize);

const update = (module: LayerModule): void => {
  const workarea = BeamboxPreference.read('workarea');
  if (!Constant.adorModels.includes(workarea)) {
    boundaryPath?.setAttribute('d', '');
    return;
  }
  if (!boundaryPath) createBoundary();
  const w = Constant.dimension.getWidth(workarea);
  const h = Constant.dimension.getHeight(workarea);
  const d1 = `M0,0H${w}V${h}H0V0`;
  const { dpmm } = Constant;
  let { top, left, bottom, right } = moduleBoundary[module];
  top *= dpmm;
  left *= dpmm;
  bottom *= dpmm;
  right *= dpmm;
  const d2 = `M${left},${top}H${w - right}V${h - bottom}H${left}V${top}`;
  boundaryPath?.setAttribute('d', `${d1} ${d2}`);
};

export default {
  update,
};
