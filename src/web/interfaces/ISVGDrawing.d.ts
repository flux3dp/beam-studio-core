export default interface ISVGDrawing {
  getCurrentLayer: () => SVGGElement | null;
  getCurrentLayerName: () => string | null;
  releaseId: (id: string) => void;
}
