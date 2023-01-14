import { IBatchCommand, ICommand, IUndoManager } from 'interfaces/IHistory';
import IShapeStyle from 'interfaces/IShapeStyle';
import ISVGConfig from 'interfaces/ISVGConfig';
import ISVGDrawing from 'interfaces/ISVGDrawing';
import { SelectorManager } from '../app/svgedit/selector';

export interface IPoint {
  x: number,
  y: number
}

export default interface ISVGCanvas {
  addedNew: boolean;
  addAlignPoint: (x: number, y: number) => void;
  addToSelection: (elemsToAdd: SVGElement[], showGrips?: boolean, noCall?: boolean) => void;
  addSvgElementFromJson: (obj: {
    element: string,
    curStyles?: boolean,
    attr: any,
  }) => SVGElement;
  addCommandToHistory: (command: ICommand) => void;
  call: (eventName: string, args?: SVGElement[] | any) => void;
  cleanupElement: (elem: SVGElement) => void;
  clearSelection: (noCall?: boolean) => void;
  clearBoundingBox: () => void;
  clear: () => void;
  deleteSelectedElements: () => void;
  drawAlignLine: (x: number, y: number, xMatchPoint: IPoint, yMatchPoint: IPoint) => void;
  isBezierPathAlignToEdge: boolean;
  isUsingLayerColor: boolean;
  getId: () => string;
  getNextId: () => string;
  getContainer: () => SVGElement,
  getCurrentConfig: () => ISVGConfig,
  getCurrentShape: () => IShapeStyle,
  getCurrentDrawing: () => ISVGDrawing;
  getCurrentGroup: () => SVGGElement;
  getCurrentMode: () => string,
  getCurrentZoom: () => number, // New getter for current_zoom
  getZoom: () => number, // Old getter for current_zoom
  getCurrentResizeMode: () => string,
  getStarted: () => boolean,
  getRubberBox: () => SVGRectElement,
  getRoot: () => SVGSVGElement,
  getRootScreenMatrix: () => SVGMatrix;
  getMouseTarget: (evt: MouseEvent, allowTempGroup?: boolean) => SVGElement;
  getIntersectionList: () => SVGElement[];
  getSelectedElements: () => SVGElement[];
  getStartTransform: () => any;
  getGoodImage: () => string;
  getSvgRealLocation: (elem: SVGElement) => {
    x: number,
    y: number,
    width: number,
    height: number
  };
  getTempGroup: () => SVGGElement;
  findMatchPoint: (x: number, y: number) => { xMatchPoint: IPoint, yMatchPoint: IPoint };
  setHref: (elem: SVGImageElement, href: string) => void;
  leaveContext: () => void;
  opacityAnimation: SVGAnimateElement;
  pathActions: any;
  reorientGrads: (elem: SVGElement, matrix: SVGMatrix) => void;
  removeFromTempGroup: (elem: SVGElement) => void;
  removeFromSelection: (elems: SVGElement[]) => void;
  resetOrientation: (elem: SVGElement) => void;
  runExtensions: (eventName: string, args: any, returnArray?: boolean) => any;
  recalculateAllSelectedDimensions: (isSubCommand?: boolean) => IBatchCommand;
  setCurrentResizeMode: (mode: string) => void;
  setMode: (mode: string) => void;
  setRotationAngle: (val: number, preventUndo: boolean, elem?: SVGElement) => void;
  selectOnly: (elems: SVGElement[], showGrips?: boolean) => void;
  setCurrentLayer: (layerName: string) => void;
  setRootScreenMatrix: (matrix: SVGMatrix) => void;
  selectorManager: SelectorManager;
  spaceKey: boolean;
  setLastClickPoint: (point: { x: number, y: number }) => void;
  setCurrentStyleProperties: (key: string, val: string | number) => void;
  sensorAreaInfo: { x: number, y: number, dx: number, dy: number, elem: SVGElement };
  textActions: any;
  toSelectMode: () => void;
  tempGroupSelectedElements: () => SVGElement[];
  updateElementColor: (elem: SVGElement) => void;
  undoMgr: IUndoManager;
  unsafeAccess: {
    setCurrentMode: (v: string) => void,
    setRubberBox: (v: SVGRectElement) => void,
    setStarted: (v: boolean) => void,
    setMode: (v: string) => void;
    setSelectedElements: (elems: SVGElement[]) => void;
    setStartTransform: (transform: any) => void;
  };
}
