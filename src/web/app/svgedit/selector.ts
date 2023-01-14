/* eslint-disable max-classes-per-file */
/**
 * Package: svedit.select
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 * Copyright(c) 2010 Jeff Schiller
 */

const { svgedit } = window;

if (!svgedit.select) {
  svgedit.select = {};
}
const { NS } = svgedit;

type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

let svgFactory;
let config;
const gripRadius = svgedit.browser.isTouch() ? 8 : 4;

const SELECTOR_MAP_RESERVE_SIZE = 5;

const init = (injectedConfig, injectedSvgFactory): void => {
  config = injectedConfig;
  svgFactory = injectedSvgFactory;
};

/**
 * Class: svgedit.select.Selector
 * Private class for DOM element selection boxes
 */
class Selector {
  public elem: Element;

  public inUse: boolean;

  public selectorGroup: SVGGElement;

  private selectorRect: SVGPathElement;

  private gripsGroup: SVGGElement;

  private resizeGrips: {
    n?: SVGCircleElement;
    s?: SVGCircleElement;
    w?: SVGCircleElement;
    e?: SVGCircleElement;
    nw?: SVGCircleElement;
    ne?: SVGCircleElement;
    sw?: SVGCircleElement;
    se?: SVGCircleElement;
  };

  private rotateGripConnector: SVGLineElement;

  private rotateGrip: SVGCircleElement;

  private dimension: {
    angle: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  private isShowing: boolean;

  /**
   *
   * @param elem DOM element associated with this selector
   * @param bbox Optional bbox to use for initialization (prevents duplicate getBBox call).
   */
  constructor(elem: Element, bbox?: BBox) {
    this.elem = elem;

    this.selectorGroup = svgFactory.createSVGElement({
      element: 'g',
      attr: { id: `selectorGroup_${elem.id}` },
    });
    this.selectorRect = svgFactory.createSVGElement({
      element: 'path',
      attr: {
        id: `selectedBox_${elem.id}`,
        fill: 'none',
        stroke: '#0000FF',
        'stroke-width': '1',
        'stroke-dasharray': '5,5',
        // need to specify this so that the rect is not selectable
        style: 'pointer-events:none',
      },
    });
    this.selectorGroup.appendChild(this.selectorRect);

    this.reset(elem, bbox);
  }

  generateGripGroup() {
    this.gripsGroup = document.createElementNS(NS.SVG, 'g') as unknown as SVGGElement;
    // this.selectorParentGroup.appendChild(this.gripsGroup);
    this.resizeGrips = {
      n: null,
      s: null,
      w: null,
      e: null,
      nw: null,
      ne: null,
      sw: null,
      se: null,
    };

    const dirs = Object.keys(this.resizeGrips);
    for (let i = 0; i < dirs.length; i += 1) {
      const dir = dirs[i];
      const grip = document.createElementNS(NS.SVG, 'circle') as unknown as SVGCircleElement;
      grip.setAttribute('id', `selectorGrip_resize_${dir}`);
      grip.setAttribute('r', gripRadius.toString());
      grip.setAttribute('fill', '#fff');
      grip.setAttribute('stroke', '#000');
      grip.setAttribute('stroke-width', '2');
      grip.setAttribute('style', `cursor:${dir}-resize`);
      grip.setAttribute('pointer-events', 'all');

      // jQuery Data for svgCanvas mouse event
      $.data(grip, 'dir', dir);
      $.data(grip, 'type', 'resize');

      this.gripsGroup.appendChild(grip);
      this.resizeGrips[dir] = grip;
    }

    this.rotateGripConnector = document.createElementNS(NS.SVG, 'line') as unknown as SVGLineElement;
    this.rotateGripConnector.setAttribute('id', 'selectorGrip_rotateconnector');
    this.rotateGripConnector.setAttribute('stroke', '#0000FF');
    this.rotateGripConnector.setAttribute('stroke-width', '1');
    this.gripsGroup.appendChild(this.rotateGripConnector);

    this.rotateGrip = document.createElementNS(NS.SVG, 'circle') as unknown as SVGCircleElement;
    this.rotateGrip.setAttribute('id', 'selectorGrip_rotate');
    this.rotateGrip.setAttribute('r', gripRadius.toString());
    this.rotateGrip.setAttribute('fill', '#12B700');
    this.rotateGrip.setAttribute('stroke', '#0000FF');
    this.rotateGrip.setAttribute('stroke-width', '2');
    this.rotateGrip.setAttribute('style', `cursor:url(${config.imgPath}rotate.png) 12 12, auto;`);
    this.gripsGroup.appendChild(this.rotateGrip);
    $.data(this.rotateGrip, 'type', 'rotate');
  }

  reset(elem: Element, bbox?: BBox) {
    this.inUse = true;
    this.elem = elem;
    this.calculateDimesion(bbox);
    this.selectorRect.setAttribute('id', `selectedBox_${elem.id}`);
    this.selectorGroup.setAttribute('id', `selectorGroup_${elem.id}`);
  }

  resize(bbox?: BBox) {
    if (!this.isShowing) return;
    this.calculateDimesion(bbox);
    this.applyDimensions();
  }

  /**
   * Calculate the selector to match the element's size
   * @param bbox Optional bbox to use for resize (prevents duplicate getBBox call).
   */
  calculateDimesion(bbox?: BBox) {
    const { elem } = this;
    const strokeWidth = Number(elem.getAttribute('stroke-width'));
    const currentZoom = svgFactory.currentZoom();
    const { tagName } = elem;
    // Offset between element and select rect
    let offset = tagName === 'text' ? 3 : 1;
    if (elem.getAttribute('stroke') !== 'none' && !Number.isNaN(strokeWidth)) {
      offset += (strokeWidth / 2) * currentZoom;
    }

    const tlist = svgedit.transformlist.getTransformList(elem);
    let m = svgedit.math.transformListToTransform(tlist).matrix;

    // This should probably be handled somewhere else, but for now
    // it keeps the selection box correctly positioned when zoomed
    m.e *= currentZoom;
    m.f *= currentZoom;

    let elemBBox = bbox || svgedit.utilities.getBBox(elem);
    if (tagName === 'g' && !$.data(elem, 'gsvg')) {
      // The bbox for a group does not include stroke vals, so we
      // get the bbox based on its children.
      const strokedBBox = svgFactory.getStrokedBBox(elem.childNodes);
      if (strokedBBox) {
        elemBBox = strokedBBox;
      }
    }
    if (!elemBBox) {
      // eslint-disable-next-line no-console
      console.warn('Selector Resize without bbox', elem, elemBBox);
      this.dimension = null;
      return;
    }

    const {
      x, y, width, height,
    } = elemBBox;

    let transformedBBox = svgedit.math.transformBox(
      x * currentZoom,
      y * currentZoom,
      width * currentZoom,
      height * currentZoom,
      m,
    );
    let { aabox } = transformedBBox;

    const angle = svgedit.utilities.getRotationAngle(elem);
    if (angle) {
      const cx = aabox.x + aabox.width / 2;
      const cy = aabox.y + aabox.height / 2;
      // now if the shape is rotated, un-rotate it
      const rot = svgFactory.svgRoot().createSVGTransform();
      rot.setRotate(-angle, cx, cy);
      m = rot.matrix.multiply(m);
      transformedBBox = svgedit.math.transformBox(
        x * currentZoom,
        y * currentZoom,
        width * currentZoom,
        height * currentZoom,
        m,
      );
      aabox = transformedBBox.aabox;
    }
    this.dimension = {
      x: aabox.x - offset,
      y: aabox.y - offset,
      width: aabox.width + (2 * offset),
      height: aabox.height + (2 * offset),
      angle,
    };
  }

  show(show: boolean, showGrips = true) {
    const { elem } = this;
    const display = (show && elem) ? 'inline' : 'none';
    this.selectorGroup.setAttribute('display', display);
    if (show && elem) {
      if (!this.gripsGroup) this.generateGripGroup();
      this.applyDimensions();
      if (showGrips) {
        if (this.gripsGroup.parentNode !== this.selectorGroup) {
          this.selectorGroup.appendChild(this.gripsGroup);
        }
      } else {
        this.gripsGroup.remove();
      }
      this.isShowing = true;
    } else if (this.gripsGroup) {
      this.gripsGroup.remove();
      this.isShowing = false;
    }
  }

  applyDimensions() {
    if (!this.dimension) return;
    const {
      x, y, width, height, angle,
    } = this.dimension;
    const cx = x + (width / 2);
    const cy = y + (height / 2);
    const dStr = `M${x},${y}L${x + width},${y}L${x + width},${y + height}L${x},${y + height}z`;
    this.selectorRect.setAttribute('d', dStr);
    const xform = angle ? `rotate(${angle} ${cx} ${cy})` : '';
    this.selectorGroup.setAttribute('transform', xform);

    const positionMap = {
      n: [cx, y],
      s: [cx, y + height],
      w: [x, cy],
      e: [x + width, cy],
      nw: [x, y],
      ne: [x + width, y],
      sw: [x, y + height],
      se: [x + width, y + height],
    };
    const dirs = Object.keys(positionMap);
    for (let i = 0; i < dirs.length; i += 1) {
      const dir = dirs[i];
      this.resizeGrips[dir].setAttribute('cx', positionMap[dir][0].toString());
      this.resizeGrips[dir].setAttribute('cy', positionMap[dir][1].toString());
    }
    this.rotateGripConnector.setAttribute('x1', cx.toString());
    this.rotateGripConnector.setAttribute('x2', cx.toString());
    this.rotateGripConnector.setAttribute('y1', y.toString());
    this.rotateGripConnector.setAttribute('y2', (y - 5 * gripRadius).toString());
    this.rotateGrip.setAttribute('cx', cx.toString());
    this.rotateGrip.setAttribute('cy', (y - 5 * gripRadius).toString());
    this.updateGripCursors();
  }

  updateGripCursors() {
    const { angle } = this.dimension;
    let step = Math.round(angle / 45);
    if (step < 0) step += 8;
    const directionMap = {
      nw: 0,
      n: 1,
      ne: 2,
      e: 3,
      se: 4,
      s: 5,
      sw: 6,
      w: 7,
    };
    const cursorMap = {
      0: 'nwse',
      1: 'ns',
      2: 'nesw',
      3: 'ew',
    };
    const dirs = Object.keys(this.resizeGrips);
    for (let i = 0; i < dirs.length; i += 1) {
      const dir = dirs[i];
      const cursorDir = cursorMap[(directionMap[dir] + step) % 4];
      this.resizeGrips[dir].setAttribute('style', `cursor:${cursorDir}-resize`);
    }
  }

  cleanUp() {
    this.selectorGroup.remove();
  }
}

svgedit.select.Selector = Selector;

export class SelectorManager {
  public selectorParentGroup: SVGGElement;

  private rubberBandBox: SVGRectElement;

  private selectorMap: { [id: string]: Selector };

  constructor() {
    this.initGroup();
  }

  initGroup() {
    if (this.selectorParentGroup) {
      this.selectorParentGroup.remove();
    }
    this.selectorParentGroup = document.createElementNS(NS.SVG, 'g') as unknown as SVGGElement;
    this.selectorParentGroup.setAttribute('id', 'selectorParentGroup');

    svgFactory.svgRoot().appendChild(this.selectorParentGroup);

    this.selectorMap = {};
    this.rubberBandBox?.remove();
    this.rubberBandBox = null;
  }

  resizeSelectors(elems: Element[]): void {
    for (let i = 0; i < elems.length; i += 1) {
      const elem = elems[i];
      if (this.selectorMap[elem.id] && this.selectorMap[elem.id].inUse) {
        this.selectorMap[elem.id].resize();
      }
    }
  }

  requestSelector(elem: Element, bbox?: BBox): Selector {
    if (!elem) return null;
    if (this.selectorMap[elem.id] && this.selectorMap[elem.id].inUse) {
      return this.selectorMap[elem.id];
    }
    const ids = Object.keys(this.selectorMap);
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const selector = this.selectorMap[id];
      if (!selector.inUse) {
        delete this.selectorMap[id];
        selector.reset(elem, bbox);
        selector.show(true);
        this.selectorMap[elem.id] = selector;
        return selector;
      }
    }
    const selector = new Selector(elem, bbox);
    this.selectorParentGroup.appendChild(selector.selectorGroup);
    this.selectorMap[elem.id] = selector;
    return selector;
  }

  releaseSelector(elem: Element) {
    if (!elem) return;
    const selector = this.selectorMap[elem.id];
    if (selector && selector.inUse) {
      const selectorMapSize = Object.keys(this.selectorMap).length;
      if (selectorMapSize <= SELECTOR_MAP_RESERVE_SIZE) {
        selector.inUse = false;
        selector.elem = null;
        selector.show(false);
      } else {
        delete this.selectorMap[elem.id];
        selector.cleanUp();
      }
    }
  }

  getRubberBandBox() {
    if (!this.rubberBandBox) {
      this.rubberBandBox = document.createElementNS(NS.SVG, 'rect') as unknown as SVGRectElement;
      this.rubberBandBox.setAttribute('id', 'selectorRubberBand');
      this.rubberBandBox.setAttribute('stroke', '#0000FF');
      this.rubberBandBox.setAttribute('stroke-width', '0.5');
      this.rubberBandBox.setAttribute('fill', '#0000FF');
      this.rubberBandBox.setAttribute('fill-opacity', '0.15');
      this.rubberBandBox.setAttribute('display', 'none');
      this.rubberBandBox.setAttribute('style', 'pointer-events:none;will-change: transform, x, y, width, height, scroll-position;');
      this.selectorParentGroup.appendChild(this.rubberBandBox);
    }
    return this.rubberBandBox;
  }
}

svgedit.select.SelectorManager = SelectorManager;

let selectorManagerSingleton: SelectorManager;
const getSelectorManager = (): SelectorManager => {
  if (!selectorManagerSingleton) {
    selectorManagerSingleton = new SelectorManager();
  }
  return selectorManagerSingleton;
};
svgedit.select.getSelectorManager = getSelectorManager;

export default {
  init,
  getSelectorManager,
};
