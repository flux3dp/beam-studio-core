import constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import findDefs from 'app/svgedit/utils/findDef';
import NS from 'app/constants/namespaces';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import wheelEventHandlerGenerator from 'app/svgedit/interaction/wheelEventHandler';
import workareaManager from 'app/svgedit/workarea';

import styles from './PassThrough.module.scss';

const zoomBlockEventEmitter = eventEmitterFactory.createEventEmitter('zoom-block');

class PassThroughCanvas {
  private container: HTMLDivElement;

  private root: SVGSVGElement;

  private svgcontent: SVGSVGElement;

  private background: SVGSVGElement;

  private width: number;

  private height: number;

  private passThroughHeight: number;

  private passThroughContainer: SVGSVGElement;

  private passThroughSeparator: SVGGElement;

  private passThroughGuideStart: SVGLineElement;

  private passThroughGuideEnd: SVGLineElement;

  zoomRatio = 1;

  canvasExpansion = 3; // extra space

  clear = () => {
    this.root?.remove();
    this.root = null;
    this.svgcontent = null;
    this.background = null;
    this.container = null;
  };

  render = (container: HTMLDivElement) => {
    this.width = workareaManager.width;
    this.height = workareaManager.height;
    this.container = container;
    this.root = document.createElementNS(NS.SVG, 'svg') as SVGSVGElement;
    this.root.setAttribute('xlinkns', NS.XLINK);
    this.root.setAttribute('xmlns', NS.SVG);
    this.background = document.createElementNS(NS.SVG, 'svg') as SVGSVGElement;
    const backgroundRect = document.createElementNS(NS.SVG, 'rect');
    backgroundRect.setAttribute('x', '0');
    backgroundRect.setAttribute('y', '0');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');
    backgroundRect.setAttribute('fill', '#fff');
    backgroundRect.setAttribute('stroke', '#000');
    backgroundRect.setAttribute('stroke-width', '1');
    backgroundRect.setAttribute('vector-effect', 'non-scaling-stroke');
    this.background.classList.add(styles.background);
    this.background.appendChild(backgroundRect);
    const canvasGrid = document.querySelector('#canvasGrid') as SVGSVGElement;
    if (canvasGrid) this.background.appendChild(canvasGrid.cloneNode(true));
    this.root.appendChild(this.background);
    this.container.appendChild(this.root);
    this.initPassThroughContainer();
    const svgcontent = document.getElementById('svgcontent') as unknown as SVGSVGElement;
    if (svgcontent) {
      this.svgcontent = svgcontent.cloneNode(true) as SVGSVGElement;
      this.svgcontent.id = '#pass-through-svgcontent';
      this.root.appendChild(this.svgcontent);
    }
    this.resetView();

    const wheelHandler = wheelEventHandlerGenerator(() => this.zoomRatio, this.zoom, {
      maxZoom: 10,
      getCenter: (e) => ({ x: e.layerX ?? e.clientX, y: e.layerY ?? e.clientY }),
    });
    this.container.addEventListener('wheel', wheelHandler);
  };

  initPassThroughContainer = () => {
    this.passThroughContainer = document.createElementNS(NS.SVG, 'svg') as SVGSVGElement;
    this.passThroughContainer.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    this.passThroughContainer.classList.add(styles.passthrough);
    this.background.appendChild(this.passThroughContainer);
    this.passThroughSeparator = document.createElementNS(NS.SVG, 'g') as SVGGElement;
    this.passThroughSeparator.classList.add(styles.separator);
    this.passThroughContainer.appendChild(this.passThroughSeparator);
    this.passThroughGuideStart = document.createElementNS(NS.SVG, 'line') as SVGLineElement;
    this.passThroughGuideStart.classList.add(styles.guide);
    this.passThroughContainer.appendChild(this.passThroughGuideStart);
    this.passThroughGuideEnd = document.createElementNS(NS.SVG, 'line') as SVGLineElement;
    this.passThroughGuideEnd.classList.add(styles.guide);
    this.passThroughContainer.appendChild(this.passThroughGuideEnd);
  };

  zoom = (zoomRatio: number, staticPoint?: { x: number; y: number }) => {
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
    this.root?.setAttribute('x', x.toString());
    this.root?.setAttribute('y', y.toString());
    this.root?.setAttribute('width', rootW.toString());
    this.root?.setAttribute('height', rootH.toString());

    this.background?.setAttribute('x', x.toString());
    this.background?.setAttribute('y', y.toString());
    this.background?.setAttribute('width', w.toString());
    this.background?.setAttribute('height', h.toString());

    this.svgcontent?.setAttribute('x', x.toString());
    this.svgcontent?.setAttribute('y', y.toString());
    this.svgcontent?.setAttribute('width', w.toString());
    this.svgcontent?.setAttribute('height', h.toString());

    // eslint-disable-next-line no-param-reassign
    staticPoint = staticPoint ?? {
      x: this.container.clientWidth / 2,
      y: this.container.clientHeight / 2,
    };
    const oldScroll = { x: this.container.scrollLeft, y: this.container.scrollTop };
    const zoomChanged = targetZoom / oldZoomRatio;
    this.container.scrollLeft = (oldScroll.x + staticPoint.x) * zoomChanged - staticPoint.x;
    this.container.scrollTop = (oldScroll.y + staticPoint.y) * zoomChanged - staticPoint.y;
    zoomBlockEventEmitter.emit('UPDATE_ZOOM_BLOCK');
  };

  zoomIn = (ratio = 1.1): void => {
    this.zoom(this.zoomRatio * ratio);
  };

  zoomOut = (ratio = 1.1): void => {
    this.zoom(this.zoomRatio / ratio);
  };

  resetView = () => {
    const { width, height } = this;
    const { clientWidth, clientHeight } = this.container;
    const workareaToDimensionRatio = Math.min(clientWidth / width, clientHeight / height);
    const zoomLevel = workareaToDimensionRatio * 0.95;
    const workAreaWidth = width * zoomLevel;
    const workAreaHeight = height * zoomLevel;
    const offsetX = (clientWidth - workAreaWidth) / 2;
    const offsetY = (clientHeight - workAreaHeight) / 2;
    this.zoom(zoomLevel);
    const x = parseFloat(this.background.getAttribute('x'));
    const y = parseFloat(this.background.getAttribute('y'));
    const defaultScroll = {
      x: (x - offsetX) / zoomLevel,
      y: (y - offsetY) / zoomLevel,
    };
    this.container.scrollLeft = defaultScroll.x * zoomLevel;
    this.container.scrollTop = defaultScroll.y * zoomLevel;
  };

  setPassThroughHeight = (val: number) => {
    this.passThroughHeight = val;
    if (this.passThroughSeparator) {
      this.passThroughSeparator.innerHTML = '';
      for (let i = 0; i < Math.ceil(this.height / this.passThroughHeight); i += 1) {
        const start = i * this.passThroughHeight;
        const end = Math.min(start + this.passThroughHeight, this.height);
        const line = document.createElementNS(NS.SVG, 'line');
        line.setAttribute('x1', '-50');
        line.setAttribute('x2', (this.width + 50).toString());
        line.setAttribute('y1', end.toString());
        line.setAttribute('y2', end.toString());
        this.passThroughSeparator.appendChild(line);
        const text = document.createElementNS(NS.SVG, 'text');
        text.setAttribute('x', '-50');
        text.setAttribute('y', ((start + end) / 2).toString());
        text.textContent = `Work Area ${i + 1}`;
        this.passThroughSeparator.appendChild(text);
      }
    }
    this.passThroughGuideEnd?.setAttribute('y1', this.passThroughHeight.toString());
    this.passThroughGuideEnd?.setAttribute('y2', this.passThroughHeight.toString());
  };

  setGuideLine = (show: boolean, x: number, width: number) => {
    if (!show) {
      this.passThroughGuideStart.style.display = 'none';
      this.passThroughGuideEnd.style.display = 'none';
    } else {
      this.passThroughGuideStart.style.display = 'block';
      this.passThroughGuideEnd.style.display = 'block';
      this.passThroughGuideStart.setAttribute('x1', x.toString());
      this.passThroughGuideStart.setAttribute('x2', (x + width).toString());
      this.passThroughGuideStart.setAttribute('y1', '0');
      this.passThroughGuideStart.setAttribute('y2', '0');
      this.passThroughGuideEnd.setAttribute('x1', x.toString());
      this.passThroughGuideEnd.setAttribute('x2', (x + width).toString());
      this.passThroughGuideEnd.setAttribute('y1', this.passThroughHeight.toString());
      this.passThroughGuideEnd.setAttribute('y2', this.passThroughHeight.toString());
    }
  };

  /**
   * generateRefImage
   * @param refHeight height of the reference image (px)
   */
  generateRefImage = async (refHeight: number): Promise<(string | null)[]> => {
    const scale = constant.dpmm;
    const clonedDefs = findDefs()?.cloneNode(true) as SVGDefsElement;
    if (clonedDefs) {
      const uses = this.svgcontent.querySelectorAll('use');
      const promises: Promise<void>[] = [];
      uses.forEach((use) => {
        const href = use.getAttributeNS(NS.XLINK, 'href');
        if (href) {
          const symbol = clonedDefs.querySelector(href);
          const image = symbol?.querySelector('image');
          const imageHref = image?.getAttribute('href');
          if (imageHref?.startsWith('blob:file://')) {
            promises.push(
              // eslint-disable-next-line no-async-promise-executor
              new Promise<void>(async (resolve) => {
                const response = await fetch(imageHref);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onload = () => {
                  image.setAttribute('href', reader.result as string);
                  resolve();
                };
                reader.readAsDataURL(blob);
              })
            );
          }
        }
      });
      await Promise.allSettled(promises);
    }
    const svgString = `
    <svg
      width="${this.width}"
      height="${this.height}"
      viewBox="0 0 ${this.width} ${this.height}"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${clonedDefs?.outerHTML || ''}
      ${this.svgcontent.innerHTML}
    </svg>`;
    const canvas = await svgStringToCanvas(
      svgString,
      Math.round(this.width / scale),
      Math.round(this.height / scale)
    );
    const refImages: (string | null)[] = [];
    for (let i = 0; i < Math.ceil(this.height / this.passThroughHeight); i += 1) {
      if (i === 0) refImages.push(null);
      else {
        const y = Math.round((i * this.passThroughHeight - refHeight) / scale);
        const height = Math.round(refHeight / scale);
        const refCanvas = document.createElement('canvas');
        refCanvas.width = canvas.width;
        refCanvas.height = height;
        const refCtx = refCanvas.getContext('2d');
        refCtx.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);
        refImages.push(refCanvas.toDataURL('image/png'));
      }
    }
    return refImages;
  };
}

const canvasManager = new PassThroughCanvas();

export default canvasManager;
