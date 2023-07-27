// Default value of module offset
import LayerModule from 'app/constants/layer-module/layer-modules';

// Module Boundary for ador
const moduleOffsets = {
  [LayerModule.LASER]: [0, 0],
  [LayerModule.PRINTER]: [0, -13.37],
  [LayerModule.LASER_20W]: [0, 0],
  [LayerModule.LASER_1064]: [0, 26.95],
};

export default moduleOffsets;