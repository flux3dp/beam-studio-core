export interface ISVGPathSeg {
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: number;
  pathSegType: number;
  toString: () => string;
  _asPathString: () => string;
  clone: () => ISVGPathSeg;
}

export interface ISVGSegment {
  startPoint: INodePoint;
  endPoint: INodePoint;
  next: ISVGSegment;
  prev: ISVGSegment;
  type: number;
  index: number;
  item: ISVGPathSeg;
  controlPoints: ISVGControlPoint[];
  select: (isSelected: boolean) => void;
}

export interface ISVGControlPoint {
  x: number;
  y: number;
  index: number;
  seg: ISVGSegment;
  nodePoint: INodePoint;
  moveAbs: (x: number, y: number) => any; // Return changes
  hide: () => void;
  show: () => void;
  update: () => void;
}

export interface INodePoint {
  x: number;
  y: number;
  mSeg: ISVGSegment;
  prevSeg?: ISVGSegment;
  nextSeg?: ISVGSegment;
  next: INodePoint;
  prev: INodePoint;
  path: ISVGPath;
  controlPoints: ISVGControlPoint[];
  linkType: number;
  isSelected: boolean;
  index: number;
  setSelected: (isSelected: boolean) => void;
  getDisplayPosition: () => { x: number, y: number };
}

export interface ISVGPath {
  elem: SVGPathElement;
  segs: ISVGSegment[];
  selected_pts: number[];
  selectedPointIndex: number;
  selectedControlPoint: ISVGControlPoint;
  nodePoints: INodePoint[];
  first_seg: ISVGSegment;
  matrix: SVGMatrix;
  dragging: number[];
  addPtsToSelection: (index: number | number[]) => void;
  addSeg: (index: number, interpolation: number) => void;
  clearSelection: () => void;
  endChanges: (log: string) => void;
  init: () => ISVGPath;
  removePtFromSelection: (index: number) => void;
  storeD: () => void;
  show: (display: boolean) => ISVGPath;
  update: () => void;
  moveCtrl: (x: number, y: number) => void;
  movePts: (x: number, y: number) => void;
}
