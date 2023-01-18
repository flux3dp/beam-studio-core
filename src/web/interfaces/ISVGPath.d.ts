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

export interface ISegment {
  startPoint: IPathNodePoint;
  endPoint: IPathNodePoint;
  next?: ISegment;
  prev?: ISegment;
  type: number;
  index: number;
  item: ISVGPathSeg;
  controlPoints: ISegmentControlPoint[];
  select: (isSelected: boolean) => void;
}

export interface ISegmentControlPoint {
  x: number;
  y: number;
  index: number;
  seg: ISegment;
  nodePoint: IPathNodePoint;
  moveAbs: (x: number, y: number) => any; // Return changes
  hide: () => void;
  show: () => void;
  update: () => void;
}

export interface IPathNodePoint {
  x: number;
  y: number;
  mSeg: ISegment;
  prevSeg?: ISegment;
  nextSeg?: ISegment;
  next: IPathNodePoint;
  prev: IPathNodePoint;
  path: ISVGPath;
  controlPoints: ISegmentControlPoint[];
  linkType: number;
  isSelected: boolean;
  index: number;
  setSelected: (isSelected: boolean) => void;
  getDisplayPosition: () => { x: number, y: number };
  isSharp: () => boolean;
  isRound: () => boolean;
}

export interface ISVGPath {
  elem: SVGPathElement;
  segs: ISegment[];
  selected_pts: number[];
  selectedPointIndex: number;
  selectedControlPoint: ISegmentControlPoint;
  nodePoints: IPathNodePoint[];
  first_seg: ISegment;
  matrix: SVGMatrix;
  dragging: number[] | boolean;
  dragctrl: boolean;
  addPtsToSelection: (index: number | number[]) => void;
  addSeg: (index: number, interpolation: number) => void;
  clearSelection: () => void;
  createControlPointsAtGrip: (index: number) => void;
  endChanges: (log: string) => void;
  init: () => ISVGPath;
  removePtFromSelection: (index: number) => void;
  storeD: () => void;
  show: (display: boolean) => ISVGPath;
  update: () => void;
  moveCtrl: (x: number, y: number) => void;
  movePts: (x: number, y: number) => void;
  stripCurveFromSegment: (index: number) => void;
  disconnectNode: (index: number) => number;
}
