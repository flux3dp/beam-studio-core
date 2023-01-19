export default interface ISVGDrawing {
  getCurrentLayer: () => SVGGElement | null;
  getCurrentLayerName: () => string | null;
  getLayerName: (index: number) => string | null;
  getNumLayers: () => number;
  setLayerOpacity: (name: string, opacity: number) => void;
  releaseId: (id: string) => void;
}
