import { Subject, from } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import Constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import NS from 'app/constants/namespaces';
import workareaManager from 'app/svgedit/workarea';
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

  coordinates: { maxX: number; maxY: number; minX: number; minY: number };

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
    const { width, height, rotaryExpansion } = workareaManager;
    const canvasHeight = height - rotaryExpansion[1];
    this.updateRatio(width, height);
    this.canvas.width = Math.round(width * this.canvasRatio);
    this.canvas.height = Math.round(canvasHeight * this.canvasRatio);

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

  async drawFullWorkarea(imgUrl: string, callBack = () => {}) {
    const p = this.preprocessFullWorkareaImg(imgUrl, callBack);
    this.backgroundDrawerSubject.next(p);
  }

  async draw(imgUrl, x, y, last = false, callBack = () => {}) {
    const p = this.prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last, callBack);
    this.backgroundDrawerSubject.next(p);
    // await p;
    // if you want to know the time when image transfer to Blob,
    // which is almost the same time background is drawn.
  }

  updateCanvasSize = () => {
    if (this.isClean()) return;
    this.clear();
    const { width, height, rotaryExpansion } = workareaManager;
    const canvasHeight = height - rotaryExpansion[1];
    this.updateRatio(width, canvasHeight);
    this.canvas.width = Math.round(width);
    this.canvas.height = Math.round(canvasHeight);
    this.resetBoundary();
    if (BeamboxPreference.read('show_guides')) {
      beamboxStore.emitDrawGuideLines();
    }
  };

  resetBoundary() {
    const previewBoundary = document.getElementById('previewBoundary');

    if (previewBoundary) {
      previewBoundary.remove();
      this.drawBoundary();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  setTextStyle(text: SVGTextElement) {
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#fff');
    text.setAttribute('stroke', '#666');
    text.setAttribute('stroke-width', '5');
    text.setAttribute('paint-order', 'stroke');
  }

  drawBoundary() {
    const boundaryGroup = document.createElementNS(NS.SVG, 'g');
    boundaryGroup.id = 'previewBoundary';
    boundaryGroup.setAttribute('style', 'pointer-events:none');
    const fixedSizeSvg = document.getElementById('fixedSizeSvg');
    fixedSizeSvg.insertBefore(boundaryGroup, fixedSizeSvg.firstChild);
    const { width, height, rotaryExpansion } = workareaManager;

    if (rotaryExpansion[1] > 0) {
      const rotaryPreveiwBoundary = document.createElementNS(NS.SVG, 'rect');
      rotaryPreveiwBoundary.setAttribute('x', '0');
      rotaryPreveiwBoundary.setAttribute('y', (height - rotaryExpansion[1]).toString());
      rotaryPreveiwBoundary.setAttribute('width', width.toString());
      rotaryPreveiwBoundary.setAttribute('height', rotaryExpansion[1].toString());
      rotaryPreveiwBoundary.setAttribute('fill', '#CCC');
      rotaryPreveiwBoundary.setAttribute('fill-opacity', '0.4');
      boundaryGroup.appendChild(rotaryPreveiwBoundary);

      const rotaryPreveiwBoundaryText = document.createElementNS(NS.SVG, 'text') as SVGTextElement;
      rotaryPreveiwBoundaryText.setAttribute('font-size', '400');
      const textNode = document.createTextNode(LANG.unpreviewable_area);
      rotaryPreveiwBoundaryText.appendChild(textNode);
      this.setTextStyle(rotaryPreveiwBoundaryText)
      boundaryGroup.appendChild(rotaryPreveiwBoundaryText);
      const { width: textW, height: textH } = rotaryPreveiwBoundaryText.getBBox();
      const x = (width - textW) / 2;
      const y = height - (rotaryExpansion[1] - textH) / 2;
      rotaryPreveiwBoundaryText.setAttribute('x', x.toString());
      rotaryPreveiwBoundaryText.setAttribute('y', y.toString());
    }

    if (this.cameraOffset) {
      const color = 'rgba(204,204,204,0.8)';
      const stripeColor = 'rgba(102,102,102,0.8)';
      const stripeWidth = 60;
      const uncapturabledHeight =
        this.cameraOffset.y * Constant.dpmm -
        (Constant.camera.imgHeight * this.cameraOffset.scaleRatioY) / 2;
      const borderTop = document.createElementNS(NS.SVG, 'rect');
      const borderPattern = document.createElementNS(NS.SVG, 'pattern');
      const patternRect = document.createElementNS(NS.SVG, 'rect');
      const patternLine = document.createElementNS(NS.SVG, 'line');
      const descText = document.createElementNS(NS.SVG, 'text');

      borderPattern.id = 'border-pattern';
      borderPattern.setAttribute('width', stripeWidth.toString());
      borderPattern.setAttribute('height', stripeWidth.toString());
      borderPattern.setAttribute('patternUnits', 'userSpaceOnUse');
      borderPattern.setAttribute('patternTransform', 'rotate(45 100 100)');

      patternRect.id = 'pattern-rect';
      patternRect.setAttribute('width', stripeWidth.toString());
      patternRect.setAttribute('height', stripeWidth.toString());
      patternRect.setAttribute('fill', color);

      patternLine.id = 'pattern-line';
      patternLine.setAttribute('x1', '0');
      patternLine.setAttribute('y1', '0');
      patternLine.setAttribute('x2', '0');
      patternLine.setAttribute('y2', stripeWidth.toString());
      patternLine.setAttribute('stroke', stripeColor);
      patternLine.setAttribute('stroke-width', stripeWidth.toString());
      patternLine.setAttribute('patternUnits', 'userSpaceOnUse');

      borderTop.setAttribute('width', width.toString());
      borderTop.setAttribute('height', uncapturabledHeight.toString());
      borderTop.setAttribute('x', '0');
      borderTop.setAttribute('y', '0');
      borderTop.setAttribute('fill', 'url(#border-pattern)');

      descText.setAttribute('font-size', '60');
      descText.setAttribute('x', ((uncapturabledHeight - 60) / 2).toString());
      descText.setAttribute('y', ((uncapturabledHeight + 60) / 2 - 10).toString());
      this.setTextStyle(descText as SVGTextElement);

      const textNode = document.createTextNode(LANG.unpreviewable_area);
      descText.appendChild(textNode);
      borderPattern.appendChild(patternRect);
      borderPattern.appendChild(patternLine);
      boundaryGroup.appendChild(borderTop);
      if (
        BeamboxPreference.read('enable-diode') &&
        Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
      ) {
        const { hybridBorder, hybridDescText } =
          this.getHybridModulePreviewBoundary(uncapturabledHeight);
        boundaryGroup.appendChild(hybridBorder);
        boundaryGroup.appendChild(hybridDescText);
      } else if (BeamboxPreference.read('borderless')) {
        const { openBottomBoundary, openBottomDescText } =
          this.getOpenBottomModulePreviewBoundary(uncapturabledHeight);
        boundaryGroup.appendChild(openBottomBoundary);
        boundaryGroup.appendChild(openBottomDescText);
      }
      boundaryGroup.appendChild(borderPattern);
      boundaryGroup.appendChild(descText);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  clearBoundary() {
    const previewBoundary = document.getElementById('previewBoundary');
    previewBoundary?.remove();
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

  preprocessFullWorkareaImg = async (imgUrl: string, callBack = () => {}) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const imgDpmm = 5;
        const canvasDpmm = 10;
        const imageRatio = canvasDpmm / imgDpmm;
        // assuming the left-top corner of the image is the correct
        this.canvas
          .getContext('2d')
          .drawImage(img, 0, 0, img.naturalWidth * imageRatio, img.naturalHeight * imageRatio);
        this.coordinates.minX = 0;
        this.coordinates.minY = 0;
        this.coordinates.maxX = img.naturalWidth * imageRatio;
        this.coordinates.maxY = img.naturalHeight * imageRatio;
        this.canvas.toBlob((blob) => {
          resolve(blob);
          setTimeout(callBack, 1000);
        });
      };
      img.src = imgUrl;
    });

  prepareCroppedAndRotatedImgBlob(imgUrl, x, y, last = false, callBack = () => {}) {
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
        this.canvas
          .getContext('2d')
          .drawImage(regulatedImg, minX, minY, width * canvasRatio, height * canvasRatio);
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
    const { angle, scaleRatioX, scaleRatioY } = this.cameraOffset;

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

  // eslint-disable-next-line class-methods-use-this
  getOpenBottomModulePreviewBoundary(uncapturabledHeight) {
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const openBottomBoundary = svgdoc.createElementNS(NS.SVG, 'rect');
    const openBottomDescText = svgdoc.createElementNS(NS.SVG, 'text');
    const { width, height } = workareaManager;
    svgedit.utilities.assignAttributes(openBottomBoundary, {
      width: Constant.borderless.safeDistance.X * Constant.dpmm,
      height,
      x: width - Constant.borderless.safeDistance.X * Constant.dpmm,
      y: 0,
      fill: 'url(#border-pattern)',
      style: 'pointer-events:none',
    });

    this.setTextStyle(openBottomDescText as SVGTextElement);
    svgedit.utilities.assignAttributes(openBottomDescText, {
      'font-size': 60,
      x: width - (uncapturabledHeight - 60) / 2,
      y: (uncapturabledHeight + 60) / 2 - 10,
      'text-anchor': 'end',
    });
    const textNode = document.createTextNode(LANG.borderless_blind_area);
    openBottomDescText.appendChild(textNode);
    return { openBottomBoundary, openBottomDescText };
  }

  // eslint-disable-next-line class-methods-use-this
  getHybridModulePreviewBoundary(uncapturabledHeight) {
    const svgdoc = document.getElementById('svgcanvas').ownerDocument;
    const hybridBorder = svgdoc.createElementNS(NS.SVG, 'rect');
    const hybridDescText = svgdoc.createElementNS(NS.SVG, 'text');
    const { width, height } = workareaManager;

    svgedit.utilities.assignAttributes(hybridBorder, {
      width: Constant.diode.safeDistance.X * Constant.dpmm,
      height,
      x: width - Constant.diode.safeDistance.X * Constant.dpmm,
      y: 0,
      fill: 'url(#border-pattern)',
      style: 'pointer-events:none',
    });
    svgedit.utilities.assignAttributes(hybridDescText, {
      'font-size': 60,
      x: width - (uncapturabledHeight - 60) / 2,
      y: (uncapturabledHeight + 60) / 2 - 10,
      'text-anchor': 'end',
      style: 'pointer-events:none',
    });
    this.setTextStyle(hybridDescText as SVGTextElement);
    const textNode = document.createTextNode(LANG.diode_blind_area);
    hybridDescText.appendChild(textNode);
    return { hybridBorder, hybridDescText };
  }
}

const instance = new PreviewModeBackgroundDrawer();

export default instance;
