import { Subject, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import Constant, { WorkAreaModel } from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const LANG = i18n.lang.beambox.left_panel;
const documentPanelEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
const IOS_CANVAS_LIMIT = 16777216;

class PreviewModeBackgroundDrawer {
  canvas: HTMLCanvasElement;

  canvasRatio = 1;

  cameraCanvasUrl: string;

  coordinates: { maxX: number; maxY: number; minX: number; minY: number; };

  cameraOffset: any;

  backgroundDrawerSubject: Subject<any>;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvasRatio = 1;
    this.cameraCanvasUrl = '';

    this.coordinates = {
      maxX: 0,
      maxY: 0,
      minX: 10000,
      minY: 10000,
    };
    this.backgroundDrawerSubject = new Subject();
    this.cameraOffset = null;
    documentPanelEventEmitter.on('workarea-change', this.updateCanvasSize);
  }

  private updateRatio(width: number, height: number) {
    // if is IOS system (web version), set ratio for canvas limit
    if (navigator.maxTouchPoints > 1 && window.os === 'MacOS') {
      if (width * height > IOS_CANVAS_LIMIT) {
        this.canvasRatio = Math.floor(1000 * Math.sqrt(IOS_CANVAS_LIMIT / (width * height))) / 1000;
      }
    }
  }

  start(cameraOffset) {
    const width = Constant.dimension.getWidth(BeamboxPreference.read('workarea'));
    const height = Constant.dimension.getHeight(BeamboxPreference.read('workarea'));
    this.updateRatio(width, height);
    this.canvas.width = Math.round(width * this.canvasRatio);
    this.canvas.height = Math.round(height * this.canvasRatio);

    // { x, y, angle, scaleRatioX, scaleRatioY }
    this.cameraOffset = cameraOffset;

    this.backgroundDrawerSubject = new Subject();
    this.backgroundDrawerSubject
      .pipe(concatMap((p) => from(p)))
      .subscribe((blob) => this.drawBlobToBackground(blob));
  }

  end() {
    if (this.backgroundDrawerSubject) {
      this.backgroundDrawerSubject.complete();
    }
  }

  async drawFullWorkarea(imgUrl, deviceModel: WorkAreaModel, callBack = () => { }) {
    const p = this.preprocessFullWorkareaImg(imgUrl, callBack);
    this.backgroundDrawerSubject.next(p);
  }

  async draw(imgUrl, x, y, last = false, callBack = () => { }) {
    const p = this.prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last, callBack);
    this.backgroundDrawerSubject.next(p);
    // await p;
    // if you want to know the time when image transfer to Blob,
    // which is almost the same time background is drawn.
  }

  updateCanvasSize = () => {
    const oldRatio = this.canvasRatio;
    const newWidth = Constant.dimension.getWidth(BeamboxPreference.read('workarea'));
    const newHeight = Constant.dimension.getHeight(BeamboxPreference.read('workarea'));
    this.updateRatio(newWidth, newHeight);
    const ctx = this.canvas.getContext('2d');
    const data = ctx.getImageData(0, 0,
      Math.round(newWidth / oldRatio), Math.round(newHeight / oldRatio));
    this.canvas.width = Math.round(newWidth * this.canvasRatio);
    this.canvas.height = Math.round(newHeight * this.canvasRatio);
    ctx.putImageData(data, 0, 0, 0, 0,
      this.canvas.width, this.canvas.height);
    this.resetBoundary();
    this.canvas.toBlob((blob) => {
      this.drawBlobToBackground(blob);
    });
    if (BeamboxPreference.read('show_guides')) {
      beamboxStore.emitDrawGuideLines();
    }
  };

  resetBoundary() {
    const canvasBackground = svgedit.utilities.getElem('canvasBackground');
    const previewBoundary = svgedit.utilities.getElem('previewBoundary');

    if (previewBoundary) {
      canvasBackground.removeChild(previewBoundary);
      this.drawBoundary();
    }
  }

  drawBoundary() {
    const canvasBackground = svgedit.utilities.getElem('canvasBackground');
    const canvasGrid = svgedit.utilities.getElem('canvasGrid');
    const previewBoundary = this.getPreviewBoundary();
    if (!previewBoundary) return;
    if (canvasGrid.nextSibling) {
      canvasBackground.insertBefore(previewBoundary, canvasGrid.nextSibling);
    } else {
      canvasBackground.appendChild(previewBoundary);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  clearBoundary() {
    const canvasBackground = svgedit.utilities.getElem('canvasBackground');
    const previewBoundary = svgedit.utilities.getElem('previewBoundary');

    if (previewBoundary) {
      canvasBackground.removeChild(previewBoundary);
    }
  }

  isClean() {
    return this.cameraCanvasUrl === '';
  }

  clear() {
    if (this.isClean()) {
      return;
    }

    svgCanvas.setBackground('#fff');

    // clear canvas
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

    // reset cameraCanvasUrl
    URL.revokeObjectURL(this.cameraCanvasUrl);
    this.cameraCanvasUrl = '';
  }

  getCameraCanvasUrl() {
    return this.cameraCanvasUrl;
  }

  getCoordinates() {
    return this.coordinates;
  }

  resetCoordinates() {
    this.coordinates.maxX = 0;
    this.coordinates.maxY = 0;
    this.coordinates.minX = 10000;
    this.coordinates.minY = 10000;
  }

  drawBlobToBackground(blob) {
    if (this.cameraCanvasUrl) {
      URL.revokeObjectURL(this.cameraCanvasUrl);
    }

    this.cameraCanvasUrl = URL.createObjectURL(blob);
    svgCanvas.setBackground('#fff', this.cameraCanvasUrl);
  }

  preprocessFullWorkareaImg = async (imgUrl: string, callBack = () => { }) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      this.canvas.getContext('2d').drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.canvas.toBlob((blob) => {
        resolve(blob);
        setTimeout(callBack, 1000);
      });
    };
    img.src = imgUrl;
  });

  prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last = false, callBack = () => { }) {
    const img = new Image();
    img.src = imgUrl;

    return new Promise((resolve) => {
      img.onload = () => {
        // free unused blob memory
        URL.revokeObjectURL(imgUrl);
        const regulatedImg = this.cropAndRotateImg(img);
        const { width, height } = regulatedImg;
        const { canvasRatio } = this;
        const minX = (x - width / 2) * canvasRatio;
        const maxX = (x + width / 2) * canvasRatio;
        const minY = (y - height / 2) * canvasRatio;
        const maxY = (y + height / 2) * canvasRatio;

        if (maxX > this.coordinates.maxX) {
          this.coordinates.maxX = maxX;
        }
        if (minX < this.coordinates.minX) {
          this.coordinates.minX = Math.max(minX, 0);
        }
        if (maxY > this.coordinates.maxY) {
          this.coordinates.maxY = maxY;
        }
        if (minY < this.coordinates.minY) {
          this.coordinates.minY = Math.max(minY, 0);
        }
        this.canvas.getContext('2d').drawImage(regulatedImg, minX, minY, width * canvasRatio, height * canvasRatio);
        this.canvas.toBlob((blob) => {
          resolve(blob);
          if (last) {
            setTimeout(callBack, 1000);
          }
        });
      };
    });
  }

  cropAndRotateImg(imageObj) {
    const {
      angle,
      scaleRatioX,
      scaleRatioY,
    } = this.cameraOffset;

    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');

    const a = angle;
    const w = imageObj.width;
    const h = imageObj.height;

    const l = (h * scaleRatioY) / (Math.cos(a) + Math.sin(a));
    cvs.width = l;
    cvs.height = l;
    ctx.translate(l / 2, l / 2);
    ctx.rotate(a);
    ctx.scale(scaleRatioX, scaleRatioY);
    ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);

    return cvs;
  }

  getPreviewBoundary() {
    if (!this.cameraOffset) return null;
    const previewBoundaryId = 'previewBoundary';
    const color = 'rgba(204,204,204,0.8)';
    const stripeColor = 'rgba(102,102,102,0.8)';
    const stripeWidth = 60;
    const uncapturabledHeight = (this.cameraOffset.y * Constant.dpmm)
      - (Constant.camera.imgHeight * this.cameraOffset.scaleRatioY) / 2;
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const { NS } = svgedit;
    const boundaryGroup = svgdoc.createElementNS(NS.SVG, 'svg');
    const borderTop = svgdoc.createElementNS(NS.SVG, 'rect');
    const borderPattern = svgdoc.createElementNS(NS.SVG, 'pattern');
    const patternRect = svgdoc.createElementNS(NS.SVG, 'rect');
    const patternLine = svgdoc.createElementNS(NS.SVG, 'line');
    const descText = svgdoc.createElementNS(NS.SVG, 'text');

    const workarea = BeamboxPreference.read('workarea');
    svgedit.utilities.assignAttributes(boundaryGroup, {
      id: previewBoundaryId,
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${Constant.dimension.getWidth(workarea)} ${Constant.dimension.getHeight(workarea)}`,
      x: 0,
      y: 0,
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(borderPattern, {
      id: 'border-pattern',
      width: stripeWidth,
      height: stripeWidth,
      patternUnits: 'userSpaceOnUse',
      patternTransform: 'rotate(45 100 100)',
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(patternRect, {
      id: 'pattern-rect',
      width: stripeWidth,
      height: stripeWidth,
      fill: color,
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(patternLine, {
      id: 'pattern-line',
      stroke: stripeColor,
      'stroke-width': stripeWidth,
      patternUnits: 'userSpaceOnUse',
      y2: stripeWidth,
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(borderTop, {
      width: Constant.dimension.getWidth(workarea),
      height: uncapturabledHeight,
      x: 0,
      y: 0,
      fill: 'url(#border-pattern)',
      style: 'pointer-events:none',
    });

    svgedit.utilities.assignAttributes(descText, {
      'font-size': 60,
      x: (uncapturabledHeight - 60) / 2,
      y: (uncapturabledHeight + 60) / 2 - 10,
      'font-weight': 'bold',
      fill: '#fff',
      stroke: '#666',
      'stroke-width': 5,
      'paint-order': 'stroke',
      style: 'pointer-events:none',
    });

    const textNode = document.createTextNode(LANG.unpreviewable_area);
    descText.appendChild(textNode);

    borderPattern.appendChild(patternRect);
    borderPattern.appendChild(patternLine);

    boundaryGroup.appendChild(borderTop);
    if (
      BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(workarea)
    ) {
      const {
        hybridBorder,
        hybridDescText,
      } = this.getHybridModulePreviewBoundary(uncapturabledHeight);
      boundaryGroup.appendChild(hybridBorder);
      boundaryGroup.appendChild(hybridDescText);
    } else if (BeamboxPreference.read('borderless')) {
      const {
        openBottomBoundary,
        openBottomDescText,
      } = this.getOpenBottomModulePreviewBoundary(uncapturabledHeight);
      boundaryGroup.appendChild(openBottomBoundary);
      boundaryGroup.appendChild(openBottomDescText);
    }

    boundaryGroup.appendChild(borderPattern);
    boundaryGroup.appendChild(descText);

    return boundaryGroup;
  }

  // eslint-disable-next-line class-methods-use-this
  getOpenBottomModulePreviewBoundary(uncapturabledHeight) {
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const { NS } = svgedit;
    const openBottomBoundary = svgdoc.createElementNS(NS.SVG, 'rect');
    const openBottomDescText = svgdoc.createElementNS(NS.SVG, 'text');
    const workarea = BeamboxPreference.read('workarea');
    svgedit.utilities.assignAttributes(openBottomBoundary, {
      width: Constant.borderless.safeDistance.X * Constant.dpmm,
      height: Constant.dimension.getHeight(workarea),
      x: Constant.dimension.getWidth(workarea) - Constant.borderless.safeDistance.X * Constant.dpmm,
      y: 0,
      fill: 'url(#border-pattern)',
      style: 'pointer-events:none',
    });
    svgedit.utilities.assignAttributes(openBottomDescText, {
      'font-size': 60,
      x: Constant.dimension.getWidth(workarea) - (uncapturabledHeight - 60) / 2,
      y: (uncapturabledHeight + 60) / 2 - 10,
      'text-anchor': 'end',
      'font-weight': 'bold',
      fill: '#fff',
      stroke: '#666',
      'stroke-width': 5,
      'paint-order': 'stroke',
      style: 'pointer-events:none',
    });
    const textNode = document.createTextNode(LANG.borderless_blind_area);
    openBottomDescText.appendChild(textNode);
    return { openBottomBoundary, openBottomDescText };
  }

  // eslint-disable-next-line class-methods-use-this
  getHybridModulePreviewBoundary(uncapturabledHeight) {
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const { NS } = svgedit;
    const hybridBorder = svgdoc.createElementNS(NS.SVG, 'rect');
    const hybridDescText = svgdoc.createElementNS(NS.SVG, 'text');
    const workarea = BeamboxPreference.read('workarea');
    svgedit.utilities.assignAttributes(hybridBorder, {
      width: Constant.diode.safeDistance.X * Constant.dpmm,
      height: Constant.dimension.getHeight(workarea),
      x: Constant.dimension.getWidth(workarea) - Constant.diode.safeDistance.X * Constant.dpmm,
      y: 0,
      fill: 'url(#border-pattern)',
      style: 'pointer-events:none',
    });
    svgedit.utilities.assignAttributes(hybridDescText, {
      'font-size': 60,
      x: Constant.dimension.getWidth(workarea) - (uncapturabledHeight - 60) / 2,
      y: (uncapturabledHeight + 60) / 2 - 10,
      'text-anchor': 'end',
      'font-weight': 'bold',
      fill: '#fff',
      stroke: '#666',
      'stroke-width': 5,
      'paint-order': 'stroke',
      style: 'pointer-events:none',
    });
    const textNode = document.createTextNode(LANG.diode_blind_area);
    hybridDescText.appendChild(textNode);
    return { hybridBorder, hybridDescText };
  }
}

const instance = new PreviewModeBackgroundDrawer();

export default instance;
