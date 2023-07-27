import LayerModule from 'app/constants/layer-module/layer-modules';

// Module Boundary for ador
const moduleBoundary = {
  [LayerModule.LASER]: { top: 0, left: 0, bottom: 0, right: 0 },
  [LayerModule.PRINTER]: { top: 12.7, left: 0, bottom: 30, right: 0 },
  [LayerModule.LASER_20W]: { top: 0, left: 0, bottom: 0, right: 0 },
  [LayerModule.LASER_1064]: { top: 26.95, left: 0, bottom: 18, right: 0 },
};

export default moduleBoundary;
