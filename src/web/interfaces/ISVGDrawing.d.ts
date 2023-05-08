import ISVGLayer from "interfaces/ISVGLayer";

export default interface ISVGDrawing {
  all_layers: ISVGLayer[];
  copyElem: (elem: Element) => Element;
  getCurrentLayer: () => ISVGLayer | null;
  setCurrentLayer: (layerName: string) => boolean;
  getCurrentLayerName: () => string | null;
  getLayerVisibility: (layerName: string) => boolean;
  getLayerColor: (layerName: string) => string;
  getLayerName: (index: number) => string | null;
  hasLayer: (layerName: string) => boolean;
  getLayerByName: (layerName: string) => ISVGLayer | null;
  getNumLayers: () => number;
  identifyLayers: () => void;
  setLayerOpacity: (name: string, opacity: number) => void;
  releaseId: (id: string) => void;
  draw: {
    Layer: () => ISVGLayer;
  }
}
