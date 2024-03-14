import beamboxPreference from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import NS from 'app/constants/namespaces';
import { getWorkarea } from 'app/constants/workarea-constants';

import styles from './grid.module.scss';

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');
const documentPanelEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
const gridIntervals = [1, 10, 100]; // px
let currentGridInterval: number;
let gridContainer: SVGGElement;
let xGridContainer: SVGGElement;
let yGridContainer: SVGGElement;
let show = beamboxPreference.read('show_grids');
let lastZoomRatio = 1;

const getGridInterval = (zoomRatio: number): number => {
  if (zoomRatio > 10) return gridIntervals[0];
  if (zoomRatio > 1) return gridIntervals[1];
  return gridIntervals[2];
};

const updateGrids = (zoomRatio: number, force = false): void => {
  lastZoomRatio = zoomRatio;
  if (!show) return;
  const gridLevel = getGridInterval(zoomRatio);
  if (!force && gridLevel === currentGridInterval) return;
  const workarea = getWorkarea(beamboxPreference.read('workarea'));
  const width = workarea.pxWidth;
  const height = workarea.pxDisplayHeight ?? workarea.pxHeight;
  xGridContainer.replaceChildren();
  yGridContainer.replaceChildren();
  for (let x = 0; x <= width; x += gridLevel) {
    const line = document.createElementNS(NS.SVG, 'line');
    line.setAttribute('x1', x.toString());
    line.setAttribute('y1', '0');
    line.setAttribute('x2', x.toString());
    line.setAttribute('y2', height.toString());
    xGridContainer.appendChild(line);
  }
  for (let y = 0; y <= height; y += gridLevel) {
    const line = document.createElementNS(NS.SVG, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', y.toString());
    line.setAttribute('x2', width.toString());
    line.setAttribute('y2', y.toString());
    yGridContainer.appendChild(line);
  }
  currentGridInterval = gridLevel;
};
canvasEventEmitter.on('zoom-changed', (zoomRatio: number) => {
  requestAnimationFrame(() => updateGrids(zoomRatio));
});
documentPanelEventEmitter.on('workarea-change', () => {
  requestAnimationFrame(() => updateGrids(lastZoomRatio, true));
});

const toggleGrids = (): void => {
  show = beamboxPreference.read('show_grids');
  gridContainer.style.display = show ? 'inline' : 'none';
  updateGrids(lastZoomRatio, true);
}

const init = (zoomRatio = 1): void => {
  const fixedSizeSvg = document.getElementById('fixedSizeSvg');
  gridContainer = document.createElementNS(NS.SVG, 'g') as unknown as SVGGElement;
  gridContainer.id = 'canvasGrid';
  gridContainer.classList.add(styles.container);
  xGridContainer = document.createElementNS(NS.SVG, 'g') as unknown as SVGGElement;
  xGridContainer.classList.add(styles.x);
  gridContainer.appendChild(xGridContainer);
  yGridContainer = document.createElementNS(NS.SVG, 'g') as unknown as SVGGElement;
  yGridContainer.classList.add(styles.y);
  gridContainer.appendChild(yGridContainer);

  fixedSizeSvg.appendChild(gridContainer);
  updateGrids(zoomRatio);
};

export default {
  init,
  updateGrids,
  toggleGrids,
};
