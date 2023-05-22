export interface ISVGLayerConscrtuctor{
  new (name: string, group: SVGGElement | null, svgElem: Element, color: string): ISVGLayer;
}

declare class ISVGLayer {
  constructor(name: string, group: SVGGElement | null, svgElem: Element, color: string);

  group_: SVGGElement;

  name_: string;

  getGroup: () => SVGGElement;
}

export default ISVGLayer;
