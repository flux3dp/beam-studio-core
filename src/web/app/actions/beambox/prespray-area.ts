import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import LayerModule from 'app/constants/layer-module/layer-modules';

let presprayAreaRect: SVGRectElement;

const areaWidth = 200;
const areaHeight = 200;

const round = (num: number, decimal: number): number => {
  const factor = 10 ** decimal;
  return Math.round(num * factor) / factor;
};

const togglePresprayArea = (): void => {
  const shouldShow =
    document.querySelectorAll(`g.layer[data-module="${LayerModule.PRINTER}"]:not([display="none"]`)
      .length > 0;
  if (shouldShow) presprayAreaRect.removeAttribute('display');
  else presprayAreaRect.setAttribute('display', 'none');
};

const getPosition = (mm = false): { x: number; y: number; w: number; h: number } => {
  const pxX = parseInt(presprayAreaRect?.getAttribute('x'), 10);
  const pxY = parseInt(presprayAreaRect?.getAttribute('y'), 10);
  const pxW = areaWidth;
  const pxH = areaHeight;
  if (!mm) return { x: pxX, y: pxY, w: pxW, h: pxH };
  const { dpmm } = constant;
  return {
    x: round(pxX / dpmm, 2),
    y: round(pxY / dpmm, 2),
    w: round(pxW / dpmm, 2),
    h: round(pxH / dpmm, 2),
  };
};

const generatePresprayArea = (): void => {
  if (!presprayAreaRect) {
    const fixedSizeSvg = document.getElementById('fixedSizeSvg');
    const { svgedit } = window;
    const { NS } = svgedit;
    presprayAreaRect = document.createElementNS(NS.SVG, 'rect') as unknown as SVGRectElement;
    presprayAreaRect.setAttribute('id', 'presprayArea');
    presprayAreaRect.setAttribute('x', '4000');
    presprayAreaRect.setAttribute('y', '2500');
    presprayAreaRect.setAttribute('width', areaWidth.toFixed(0));
    presprayAreaRect.setAttribute('height', areaHeight.toFixed(0));
    presprayAreaRect.setAttribute('fill', 'rgba(0, 128, 255, 0.3)');
    presprayAreaRect.setAttribute('stroke', 'rgba(0, 128, 255, 0.3)');
    presprayAreaRect.setAttribute('style', 'cursor:move;');
    fixedSizeSvg?.appendChild(presprayAreaRect);
    togglePresprayArea();
  }
};

const checkMouseTarget = (mouseTarget: Element): boolean =>
  mouseTarget && mouseTarget.id === 'presprayArea';

let startX = 0;
let startY = 0;
let workareaSize = { w: 0, h: 0 };

const startDrag = (): void => {
  const { x, y } = getPosition();
  startX = x;
  startY = y;
  const workarea = beamboxPreference.read('workarea');
  workareaSize = {
    w: constant.dimension.getWidth(workarea),
    h: constant.dimension.getHeight(workarea),
  };
};

const drag = (dx: number, dy: number): void => {
  requestAnimationFrame(() => {
    const { w, h } = workareaSize;
    const newX = Math.min(Math.max(0, startX + dx), w - areaWidth);
    const newY = Math.min(Math.max(0, startY + dy), h - areaHeight);
    presprayAreaRect?.setAttribute('x', newX.toFixed(0));
    presprayAreaRect?.setAttribute('y', newY.toFixed(0));
  });
};

export default {
  checkMouseTarget,
  drag,
  generatePresprayArea,
  getPosition,
  startDrag,
  togglePresprayArea,
};
