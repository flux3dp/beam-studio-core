import { getLayerName } from 'helpers/layer/layer-helper';

import Layer from './layer';

/**
 * TODO: add layer manager
 * which has a list of layer orders
 * and a object with key as layer name and value as layer element, so that we can get layer element by name
 * also access layer data by name
 * replace svgedit.draw.layer with layer manager
 */
class LayerManager {
  private layerList: Layer[] = [];

  private layerMap: Record<string, Layer> = {};

  private currentLayerName: string;

  private selectedLayers: string[] = [];

  identifyLayer(svgcontent: SVGElement): void {
    const layerList = [...svgcontent.querySelectorAll(':scope > g.layer')];
    this.layerList = [];
    this.layerMap = {};
    for (let i = 0; i < layerList.length; i += 1) {
      const layerElement = layerList[i];
      const instance = new Layer(layerElement as SVGGElement);
      const { name } = instance;
      this.layerList.push(instance);
      this.layerMap[name] = instance;
    }
    // collect orphans or delete all orphans?
  }

  createLayer(name: string, opts?: { hexCode?: string; isFullColor?: boolean; isSubCmd?: boolean }): void {
    const { hexCode, isFullColor = false, isSubCmd = false } = opts || {};
  };

  changeLayerName(oldName: string, newName: string): void {
    const layer = this.layerMap[oldName];
    if (!layer) return;
    const res = layer.setName(newName);
    if (!res) return;
    const { name, cmd } = res;
    delete this.layerMap[oldName];
    this.layerMap[name] = layer;
    // add cmd into history
  };
}

export default LayerManager;
