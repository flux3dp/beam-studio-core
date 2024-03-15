import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import rotaryConstants from 'app/constants/rotary-constants';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

const canvasEvents = eventEmitterFactory.createEventEmitter('canvas');
const zoomBlockEventEmitter = eventEmitterFactory.createEventEmitter('zoom-block');

class WorkareaManager {
  model: WorkAreaModel;

  rotaryEnabled: boolean;

  width: number; // px

  height: number; // px

  zoomRatio = 1;

  canvasExpansion = 3; // extra space

  rotaryExpansion: number[]; // [top, bottom] in pixel

  init(model: WorkAreaModel): void {
    this.setWorkarea(model);
  }

  setWorkarea(model: WorkAreaModel): void {
    const rotaryEnabled = !!beamboxPreference.read('rotary_mode');
    if (model !== this.model || this.rotaryEnabled !== rotaryEnabled) {
      const workarea = getWorkarea(model);
      this.model = model;
      this.rotaryEnabled = rotaryEnabled;
      this.width = workarea.pxWidth;
      this.height = workarea.pxDisplayHeight ?? workarea.pxHeight;
      if (rotaryEnabled && rotaryConstants[model]) {
        const { dpmm } = constant;
        const { boundary, maxHeight } = rotaryConstants[model];
        const [lowerBound, upperBound] = boundary
          ? [boundary[0] * dpmm, boundary[1] * dpmm]
          : [0, this.height];
        const pxMaxHeight = maxHeight * dpmm;
        this.rotaryExpansion = [pxMaxHeight - lowerBound, pxMaxHeight - (this.height - upperBound)];
        this.height += this.rotaryExpansion[1];
      } else {
        this.rotaryExpansion = [0, 0];
      }
      const svgcontent = document.getElementById('svgcontent');
      svgcontent?.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      const fixedSizeSvg = document.getElementById('fixedSizeSvg');
      fixedSizeSvg?.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      this.zoom(this.zoomRatio);
    }
  }

  zoom(zoomRatio: number, staticPoint?: { x: number; y: number }): void {
    const targetZoom = Math.max(0.05, zoomRatio);
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
    svgCanvas.style.width = `${Math.max(workareaElem.clientWidth, rootW)}px`;
    svgCanvas.style.height = `${Math.max(workareaElem.clientHeight, rootW)}px`;

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
      y: workareaElem.clientHeight / 2,
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
