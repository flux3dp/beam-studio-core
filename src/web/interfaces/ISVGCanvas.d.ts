import { Units } from 'helpers/units';
import { IBatchCommand, ICommand, IUndoManager } from 'interfaces/IHistory';
import IShapeStyle from 'interfaces/IShapeStyle';
import ISVGConfig from 'interfaces/ISVGConfig';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import { EventEmitter } from 'events';
import { IPathActions } from 'app/svgedit/operations/pathActions';
import { SelectorManager } from 'app/svgedit/selector';

export interface IPoint {
  x: number,
  y: number
}

interface IRect {
  x: number,
  y: number,
  width: number,
  height: number,
}

export default interface ISVGCanvas {
  addAlignPoint: (x: number, y: number) => void;
  addCommandToHistory: (command: ICommand) => void;
  addedNew: boolean;
  addExtension: any;
  addSvgElementFromJson<T = SVGElement>(obj: { element: string, curStyles?: boolean, attr: any, }): T;
  addToSelection: (elemsToAdd: SVGElement[], showGrips?: boolean, noCall?: boolean) => void;
  alignSelectedElements(
    type: 'l' | 'c' | 'r' | 't' | 'm' | 'b',
    relativeTo: 'selected' | 'largest' | 'smallest' | 'page'
  ): void;
  assignAttributes(element: HTMLElement, args: any): void;
  bind: (eventName: string, callback: boolean | ((win: any, elem: any) => void)) => void;
  calculateTransformedBBox(elem: Element): IRect;
  call: (eventName: string, args?: SVGElement[] | any) => void;
  changeSelectedAttribute(attr: string, val: string | number): void;
  cleanupElement: (elem: SVGElement) => void;
  clear: () => void;
  clearBoundingBox: () => void;
  clearSelection: (noCall?: boolean) => void;
  contentH: number;
  contentW: number;
  convertToNum(attr: string, val: number): number;
  createLayer: (layerName: string, hexCode?: string, isFullColor?: boolean) => void;
  currentFilePath: string;
  deleteSelectedElements: () => void;
  drawAlignLine: (x: number, y: number, xMatchPoint: IPoint, yMatchPoint: IPoint) => void;
  drawing: ISVGDrawing;
  embedImage(url: string, callback: (dataURI: string) => void): void;
  events: EventEmitter;
  findMatchPoint: (x: number, y: number) => { xMatchPoint: IPoint, yMatchPoint: IPoint };
  getVisibleElementsAndBBoxes: () => { elem: Element, bbox: IRect }[];
  getColor: (key: string) => string;
  getContainer: () => SVGElement,
  getCurrentConfig: () => ISVGConfig,
  getCurrentDrawing: () => ISVGDrawing;
  getCurrentGroup: () => SVGGElement;
  getCurrentMode: () => string,
  getCurrentResizeMode: () => string,
  getCurrentShape: () => IShapeStyle,
  getCurrentZoom: () => number, // New getter for current_zoom
  getDocumentTitle: () => string;
  getGoodImage: () => string;
  getHref: (elem: SVGElement) => string;
  getId: () => string;
  getIntersectionList: () => SVGElement[];
  getLatestImportFileName(): string;
  getMode: () => string;
  getMouseTarget: (evt: MouseEvent, allowTempGroup?: boolean) => SVGElement;
  getNextId: () => string;
  getPaintOpacity: (pickerType: string) => number;
  getRefElem(refString: string): Element;
  getRoot: () => SVGSVGElement,
  getRootScreenMatrix: () => SVGMatrix;
  getRotationAngle(elem: Element): void;
  getRubberBox: () => SVGRectElement,
  getSelectedElems: () => SVGElement[];
  getStarted: () => boolean,
  getStartTransform: () => any;
  getStrokedBBox(elems: Element[]): IRect;
  getSvgRealLocation: (elem: SVGElement) => IRect;
  removeUnusedDefs: () => void;
  getSvgString: (opts?: { unit?: Units }) => string;
  getTempGroup: () => SVGGElement;
  getTitle: () => string;
  getZoom: () => number, // Old getter for current_zoom
  groupSelectedElements: () => void;
  handleGenerateSensorArea: (evt: MouseEvent) => void;
  importSvgString(modifiedSvgString: string, type: 'color' | 'layer' | 'none', layerName: string): void;
  isBezierPathAlignToEdge: boolean;
  isUsingLayerColor: boolean;
  leaveContext: () => void;
  makeHyperlink(url: string): void;
  mergeLayer: () => void;
  mergeAllLayers: () => void;
  moveDownSelectedElement(): void;
  moveTopBottomSelected(direction: 'top' | 'bottom'): void;
  moveUpSelectedElement(): void;
  offsetElements: (
    dir: number, dist: number, cornerType: string, elem: SVGElement, skipUndoStack?: boolean,
  ) => Promise<SVGElement>;
  opacityAnimation: SVGAnimateElement;
  open: () => void;
  pathActions: IPathActions;
  pushGroupProperties: (g: SVGGElement, undoable: boolean) => void;
  randomizeIds(enableRandomization: boolean): string;
  ready: (arg0: () => void) => any;
  recalculateAllSelectedDimensions: (isSubCommand?: boolean) => IBatchCommand;
  removeDefaultLayerIfEmpty(): void;
  removeFromSelection: (elems: SVGElement[]) => void;
  removeFromTempGroup: (elem: SVGElement) => void;
  renameCurrentLayer: (layerName: string) => void;
  reorientGrads: (elem: SVGElement, matrix: SVGMatrix) => void;
  resetOrientation: (elem: SVGElement) => void;
  runExtensions: (eventName: string, args?: any, returnArray?: boolean) => any;
  selectAll: () => void;
  selectOnly: (elems: SVGElement[], showGrips?: boolean) => void;
  selectorManager: SelectorManager;
  sensorAreaInfo: { x: number, y: number, dx: number, dy: number, elem: SVGElement };
  setBackground: (color: string, url: string) => void;
  setBlur(blurValue: number, shouldComplete: boolean): void;
  setBlurNoUndo(blurValue: number): void;
  setColor: (pickerType: string, color: string, preventUndo?: boolean) => void;
  setConfig(curConfig: ISVGConfig): void;
  setContext(element: Element): void;
  setCurrentLayer: (layerName: string) => boolean;
  setCurrentResizeMode: (mode: string) => void;
  setCurrentStyleProperties: (key: string, val: string | number) => void;
  setHasUnsavedChange(hasUnsavedChange: boolean): void;
  setHref: (elem: SVGImageElement | SVGElement, href: string) => void;
  setImageURL: (url: string) => void;
  setLastClickPoint: (point: { x: number, y: number }) => void;
  setLatestImportFileName(fileName: string): void;
  setLayerVisibility(layerName: string, visible: boolean): void;
  setMode: (mode: string) => void;
  setOpacity: (opacity: number) => void;
  setPaint(picker: string, paint: any): void;
  setPaintOpacity: (pickerType: string, opacity: number, preventUndo?: boolean) => void;
  setRootScreenMatrix: (matrix: SVGMatrix) => void;
  setRotaryMode: (rotaryMode: boolean) => void;
  setRotationAngle: (val: number, preventUndo: boolean, elem?: SVGElement) => void;
  setStrokeAttr(attrKey: string, value: string): void;
  setStrokeWidth(width: number): void;
  setSvgElemSize: (type: 'width' | 'height' | 'rx' | 'ry', val: number, addToHistory?: boolean) => IBatchCommand | null;
  setSvgString: (content: string) => boolean;
  setUiStrings(allStrings: Record<string, string>): void;
  setZoom: (zoom: number) => void;
  sortTempGroupByLayer: () => void;
  spaceKey: boolean;
  svgToString(elem: Element, indent: number, units?: Units): string;
  tempGroupSelectedElements: () => SVGElement[];
  textActions: any;
  ungroupTempGroup(elem?: SVGElement): SVGElement[];
  undoMgr: IUndoManager;
  ungroupSelectedElement(): void;
  updateCanvas: (width: number, height: number) => void;
  updateElementColor: (elem: Element) => void;
  updateLayerColor: (layerElement: Element) => void;
  updateRecentFiles(path: string): void;
  unsafeAccess: {
    setCurrentMode: (v: string) => void,
    setRubberBox: (v: SVGRectElement) => void,
    setStarted: (v: boolean) => void,
    setSelectedElements: (elems: SVGElement[]) => void;
    setStartTransform: (transform: any) => void;
  };
}
