import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import presprayIconUrl from 'app/icons/prespray.svg?url';

let presprayAreaBlock: SVGImageElement;

const areaWidth = 300;
const areaHeight = 300;

const round = (num: number, decimal: number): number => {
  const factor = 10 ** decimal;
  return Math.round(num * factor) / factor;
};

const togglePresprayArea = (): void => {
  const shouldShow =
    document.querySelectorAll(`g.layer[data-module="${LayerModule.PRINTER}"]:not([display="none"]`)
      .length > 0;
  if (shouldShow) presprayAreaBlock.removeAttribute('display');
  else presprayAreaBlock.setAttribute('display', 'none');
};

const getPosition = (mm = false): { x: number; y: number; w: number; h: number } => {
  const pxX = parseInt(presprayAreaBlock?.getAttribute('x'), 10);
  const pxY = parseInt(presprayAreaBlock?.getAttribute('y'), 10);
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
  if (!presprayAreaBlock) {
    const fixedSizeSvg = document.getElementById('fixedSizeSvg');
    const { svgedit } = window;
    const { NS } = svgedit;
    presprayAreaBlock = document.createElementNS(NS.SVG, 'image') as unknown as SVGImageElement;
    presprayAreaBlock.setAttribute('id', 'presprayArea');
    presprayAreaBlock.setAttribute('x', '4000');
    presprayAreaBlock.setAttribute('y', '2400');
    presprayAreaBlock.setAttribute('width', areaWidth.toFixed(0));
    presprayAreaBlock.setAttribute('height', areaHeight.toFixed(0));
    presprayAreaBlock.setAttribute('href', presprayIconUrl);
    presprayAreaBlock.setAttribute('style', 'cursor:move;');
    const presprayAreaTitle = document.createElementNS(NS.SVG, 'title');
    presprayAreaTitle.textContent = i18n.lang.editor.prespray_area;
    presprayAreaBlock.appendChild(presprayAreaTitle);
    fixedSizeSvg?.appendChild(presprayAreaBlock);
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
    presprayAreaBlock?.setAttribute('x', newX.toFixed(0));
    presprayAreaBlock?.setAttribute('y', newY.toFixed(0));
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
