import NS from 'app/constants/namespaces';

import BeamboxPreference from './beambox-preference';
import Constant from './constant';
import { getSVGAsync } from '../../../helpers/svg-editor-helper';

let svgedit;
getSVGAsync((globalSVG) => {
  svgedit = globalSVG.Edit;
});

let openBottomBoundaryRect: SVGRectElement;
let openBottomBoundarySVG: SVGSVGElement;

const checkSvgEdit = () =>
  new Promise((resolve) => {
    if (svgedit) {
      resolve(null);
      return;
    }
    const interval = setInterval(() => {
      if (svgedit) {
        resolve(null);
        clearInterval(interval);
      }
    }, 500);
  });

const createBoundary = async () => {
  await checkSvgEdit();
  openBottomBoundarySVG = document.createElementNS(
    NS.SVG,
    'svg'
  ) as unknown as SVGSVGElement;
  openBottomBoundaryRect = document.createElementNS(
    NS.SVG,
    'rect'
  ) as unknown as SVGRectElement;
  const canvasBackground = svgedit.utilities.getElem('canvasBackground');
  canvasBackground.appendChild(openBottomBoundarySVG);
  openBottomBoundarySVG.appendChild(openBottomBoundaryRect);
  openBottomBoundarySVG.id = 'open-bottom-boundary';
  openBottomBoundarySVG.setAttribute('width', '100%');
  openBottomBoundarySVG.setAttribute('height', '100%');
  const workarea = BeamboxPreference.read('workarea');
  openBottomBoundarySVG.setAttribute(
    'viewBox',
    `0 0 ${Constant.dimension.getWidth(workarea)} ${Constant.dimension.getHeight(workarea)}`
  );
  openBottomBoundarySVG.setAttribute('x', '0');
  openBottomBoundarySVG.setAttribute('y', '0');
  openBottomBoundarySVG.setAttribute('style', 'pointer-events:none');
  openBottomBoundaryRect.setAttribute('fill', '#CCC');
  openBottomBoundaryRect.setAttribute('fill-opacity', '0.4');
  openBottomBoundaryRect.setAttribute('fill-rule', 'evenodd');
  openBottomBoundaryRect.setAttribute('stroke', 'none');
  openBottomBoundaryRect.setAttribute('style', 'pointer-events:none');
  openBottomBoundaryRect.setAttribute('y', '0');
  openBottomBoundaryRect.setAttribute(
    'width',
    `${Constant.borderless.safeDistance.X * Constant.dpmm}`
  );
  openBottomBoundaryRect.setAttribute('height', '100%');
};

const show = async () => {
  if (!openBottomBoundarySVG) await createBoundary();
  const x =
    Constant.dimension.getWidth(BeamboxPreference.read('workarea')) -
    Constant.borderless.safeDistance.X * Constant.dpmm;
  openBottomBoundaryRect.setAttribute('x', x.toString());
  openBottomBoundaryRect.setAttribute('display', 'block');
};
const hide = () => {
  if (!openBottomBoundaryRect) return;
  openBottomBoundaryRect.setAttribute('display', 'none');
};

const update = (): void => {
  const isOpenBottom = BeamboxPreference.read('borderless');
  const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(
    BeamboxPreference.read('workarea')
  );
  if (isOpenBottom && supportOpenBottom) show();
  else hide();
};

export default {
  update,
};
