import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

import selector from './selector';

const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
const zoomBlockEventEmitter = eventEmitterFactory.createEventEmitter('zoom-block');

class WorkareaManager {
  model: WorkAreaModel;

  width: number; // px

  height: number; // px

  zoomRatio = 1;

  svgroot: SVGSVGElement;

  canvasExpansion = 3; // extra space

  init(model: WorkAreaModel): void {
    this.setWorkarea(model);
  }

  setWorkarea(model: WorkAreaModel): void {
    if (model !== this.model) {
      const workarea = getWorkarea(model);
      this.model = model;
      this.width = workarea.pxWidth;
      this.height = workarea.pxDisplayHeight ?? workarea.pxHeight;
      const svgcontent = document.getElementById('svgcontent');
      svgcontent?.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      const fixedSizeSvg = document.getElementById('fixedSizeSvg');
      fixedSizeSvg?.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      this.zoom(this.zoomRatio);
    }
  }

  zoom(zoomRatio: number, staticPoint?: { x: number; y: number; }): void {
    const targetZoom = Math.max(0.1, zoomRatio);
    const oldZoomRatio = this.zoomRatio;
    this.zoomRatio = targetZoom;
    const w = this.width * targetZoom;
    const h = this.height * targetZoom;
    const rootW = w * this.canvasExpansion;
    const rootH = h * this.canvasExpansion;
    const expansionRatio = (this.canvasExpansion - 1) / 2;
    const x = this.width * targetZoom * expansionRatio;
    const y = this.height * targetZoom * expansionRatio;
    const svgroot = document.getElementById('svgroot');
    svgroot?.setAttribute('x', x.toString());
    svgroot?.setAttribute('y', y.toString());
    svgroot?.setAttribute('width', rootW.toString());
    svgroot?.setAttribute('height', rootH.toString());

    const svgCanvas = document.getElementById('svgcanvas');
    const workareaElem = document.getElementById('workarea');
    svgCanvas?.setAttribute('width', Math.max(workareaElem.clientWidth, rootW).toString());
    svgCanvas?.setAttribute('height', Math.max(workareaElem.clientHeight, rootW).toString());

    const canvasBackground = document.getElementById('canvasBackground');
    canvasBackground?.setAttribute('x', x.toString());
    canvasBackground?.setAttribute('y', y.toString());
    canvasBackground?.setAttribute('width', w.toString());
    canvasBackground?.setAttribute('height', h.toString());

    const svgcontent = document.getElementById('svgcontent');
    svgcontent?.setAttribute('x', x.toString());
    svgcontent?.setAttribute('y', y.toString());
    svgcontent?.setAttribute('width', w.toString());
    svgcontent?.setAttribute('height', h.toString());

    // eslint-disable-next-line no-param-reassign
    staticPoint = staticPoint ?? {
      x: workareaElem.clientWidth / 2,
      y: workareaElem.clientHeight / 2
    };
    const oldScroll = { x: workareaElem.scrollLeft, y: workareaElem.scrollTop };
    const zoomChanged = targetZoom / oldZoomRatio;
    workareaElem.scrollLeft = (oldScroll.x + staticPoint.x) * zoomChanged - staticPoint.x;
    workareaElem.scrollTop = (oldScroll.y + staticPoint.y) * zoomChanged - staticPoint.y;

    canvasEvents.emit('zoom-changed', targetZoom, oldZoomRatio);
    zoomBlockEventEmitter.emit('UPDATE_ZOOM_BLOCK');
  }
}

// singleton
const workareaManager = new WorkareaManager();

export default workareaManager;

