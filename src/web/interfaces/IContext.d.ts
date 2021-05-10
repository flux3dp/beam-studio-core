export interface ILayerPanelContext {
  selectedLayers?: string[],
  updateLayerPanel: () => void,
  setSelectedLayers: (layers: string[]) => null,
}
