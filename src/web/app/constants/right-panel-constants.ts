import LayerModule from 'app/constants/layer-modules';

const constants = {
  BEAMO: {
    wood_3mm_cutting: {
      power: 45,
      speed: 5,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting: {
      power: 55,
      speed: 4,
      repeat: 2,
      name: 'wood_5mm_cutting',
    },
    wood_engraving: {
      power: 25,
      speed: 150,
      name: 'wood_engraving',
    },
    acrylic_3mm_cutting: {
      power: 55,
      speed: 4,
      name: 'acrylic_3mm_cutting',
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 5,
      repeat: 2,
      name: 'acrylic_5mm_cutting',
    },
    acrylic_engraving: {
      power: 25,
      speed: 150,
      name: 'acrylic_engraving',
    },
    leather_3mm_cutting: {
      power: 60,
      speed: 3,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting: {
      power: 60,
      speed: 3,
      repeat: 2,
      name: 'leather_5mm_cutting',
    },
    leather_engraving: {
      power: 30,
      speed: 150,
      name: 'leather_engraving',
    },
    fabric_3mm_cutting: {
      power: 50,
      speed: 20,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting: {
      power: 50,
      speed: 20,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving: {
      power: 20,
      speed: 150,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving: {
      power: 50,
      speed: 100,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving: {
      power: 35,
      speed: 150,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving: {
      power: 50,
      speed: 80,
      name: 'metal_bw_engraving',
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
      name: 'stainless_steel_bw_engraving_diode',
    },
  },
  BEAMBOX: {
    wood_3mm_cutting: {
      power: 60,
      speed: 6,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting: {
      power: 60,
      speed: 3,
      name: 'wood_5mm_cutting',
    },
    wood_engraving: {
      power: 25,
      speed: 150,
      name: 'wood_engraving',
    },
    acrylic_3mm_cutting: {
      power: 60,
      speed: 8,
      name: 'acrylic_3mm_cutting',
    },
    acrylic_5mm_cutting: {
      power: 60,
      speed: 4,
      name: 'acrylic_5mm_cutting',
    },
    acrylic_engraving: {
      power: 25,
      speed: 150,
      name: 'acrylic_engraving',
    },
    leather_3mm_cutting: {
      power: 65,
      speed: 3,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting: {
      power: 65,
      speed: 1,
      name: 'leather_5mm_cutting',
    },
    leather_engraving: {
      power: 30,
      speed: 150,
      name: 'leather_engraving',
    },
    fabric_3mm_cutting: {
      power: 60,
      speed: 20,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting: {
      power: 60,
      speed: 20,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving: {
      power: 20,
      speed: 150,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving: {
      power: 45,
      speed: 130,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving: {
      power: 30,
      speed: 150,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving: {
      power: 50,
      speed: 120,
      name: 'metal_bw_engraving',
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
      name: 'stainless_steel_bw_engraving_diode',
    },
  },
  BEAMBOX_PRO: {
    wood_3mm_cutting: {
      power: 55,
      speed: 7,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting: {
      power: 55,
      speed: 4,
      name: 'wood_5mm_cutting',
    },
    wood_engraving: {
      power: 20,
      speed: 150,
      name: 'wood_engraving',
    },
    acrylic_3mm_cutting: {
      power: 55,
      speed: 7,
      name: 'acrylic_3mm_cutting',
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 4,
      name: 'acrylic_5mm_cutting',
    },
    acrylic_engraving: {
      power: 15,
      speed: 150,
      name: 'acrylic_engraving',
    },
    leather_3mm_cutting: {
      power: 55,
      speed: 4,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting: {
      power: 55,
      speed: 2,
      name: 'leather_5mm_cutting',
    },
    leather_engraving: {
      power: 20,
      speed: 150,
      name: 'leather_engraving',
    },
    fabric_3mm_cutting: {
      power: 35,
      speed: 20,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting: {
      power: 35,
      speed: 20,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving: {
      power: 15,
      speed: 150,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving: {
      power: 40,
      speed: 150,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving: {
      power: 25,
      speed: 150,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving: {
      power: 50,
      speed: 140,
      name: 'metal_bw_engraving',
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
      name: 'stainless_steel_bw_engraving_diode',
    },
  },
  HEXA: {
    wood_3mm_cutting: {
      power: 40,
      speed: 6,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting: {
      power: 65,
      speed: 3,
      name: 'wood_5mm_cutting',
    },
    wood_8mm_cutting: {
      power: 65,
      speed: 3,
      repeat: 2,
      name: 'wood_8mm_cutting',
    },
    wood_10mm_cutting: {
      power: 65,
      speed: 3,
      repeat: 3,
      name: 'wood_10mm_cutting',
    },
    wood_engraving: {
      power: 20,
      speed: 300,
      name: 'wood_engraving',
    },
    acrylic_3mm_cutting: {
      power: 40,
      speed: 6,
      name: 'acrylic_3mm_cutting',
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 3,
      name: 'acrylic_5mm_cutting',
    },
    acrylic_8mm_cutting: {
      power: 50,
      speed: 3,
      repeat: 2,
      name: 'acrylic_8mm_cutting',
    },
    acrylic_10mm_cutting: {
      power: 55,
      speed: 3,
      repeat: 2,
      name: 'acrylic_10mm_cutting',
    },
    acrylic_engraving: {
      power: 15,
      speed: 300,
      name: 'acrylic_engraving',
    },
    leather_3mm_cutting: {
      power: 40,
      speed: 6,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting: {
      power: 55,
      speed: 3,
      name: 'leather_5mm_cutting',
    },
    leather_engraving: {
      power: 20,
      speed: 300,
      name: 'leather_engraving',
    },
    fabric_3mm_cutting: {
      power: 15,
      speed: 25,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting: {
      power: 20,
      speed: 20,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving: {
      power: 15,
      speed: 250,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving: {
      power: 45,
      speed: 300,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving: {
      power: 35,
      speed: 150,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving: {
      power: 20,
      speed: 150,
      name: 'metal_bw_engraving',
    },
  },
  ADOR: {
    wood_3mm_cutting_10w: {
      power: 100,
      speed: 6,
      module: LayerModule.LASER,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting_10w: {
      power: 100,
      speed: 3,
      module: LayerModule.LASER,
      name: 'wood_5mm_cutting',
    },
    wood_engraving_10w: {
      power: 100,
      speed: 150,
      module: LayerModule.LASER,
      name: 'wood_engraving',
    },
    acrylic_3mm_cutting_10w: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER,
      name: 'acrylic_3mm_cutting',
    },
    acrylic_5mm_cutting_10w: {
      power: 100,
      speed: 2,
      repeat: 2,
      module: LayerModule.LASER,
      name: 'acrylic_5mm_cutting',
    },
    acrylic_engraving_10w: {
      power: 90,
      speed: 175,
      module: LayerModule.LASER,
      name: 'acrylic_engraving',
    },
    mdf_3mm_cutting_10w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER,
      name: 'mdf_3mm_cutting',
    },
    mdf_5mm_cutting_10w: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER,
      name: 'mdf_5mm_cutting',
    },
    mdf_engraving_10w: {
      power: 30,
      speed: 100,
      module: LayerModule.LASER,
      name: 'mdf_engraving',
    },
    leather_3mm_cutting_10w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting_10w: {
      power: 100,
      speed: 3,
      repeat: 2,
      module: LayerModule.LASER,
      name: 'leather_5mm_cutting',
    },
    leather_engraving_10w: {
      power: 30,
      speed: 100,
      module: LayerModule.LASER,
      name: 'leather_engraving',
    },
    denim_1mm_cutting_name: {
      power: 100,
      speed: 14,
      module: LayerModule.LASER,
      name: 'denim_1mm_cutting',
    },
    fabric_3mm_cutting_10w: {
      power: 100,
      speed: 6,
      module: LayerModule.LASER,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting_10w: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving_10w: {
      power: 30,
      speed: 125,
      module: LayerModule.LASER,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving_10w: {
      power: 100,
      speed: 15,
      module: LayerModule.LASER,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving_10w: {
      power: 40,
      speed: 20,
      module: LayerModule.LASER,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving_10w: {
      power: 100,
      speed: 20,
      module: LayerModule.LASER,
      name: 'metal_bw_engraving',
    },
  }
};

const modelsWithModules = ['fad1'];
const modelMap = {
  fbm1: 'BEAMO',
  fbb1b: 'BEAMBOX',
  fbb1p: 'BEAMBOX_PRO',
  fhexa1: 'HEXA',
  fad1: 'ADOR',
};

export const getAllPresets = (model: string): {
  [key: string]: { name: string; power: number; speed: number; repeat?: number, module?: LayerModule };
} => {
  const modelName = modelMap[model] || 'BEAMO';
  return constants[modelName];
};

export const getModulePresets = (
  model: string, module = LayerModule.LASER
): { [key: string]: { name: string; power: number; speed: number; repeat?: number } } => {
  const modelName = modelMap[model] || 'BEAMO';
  if (modelsWithModules.includes(model)) {
    const data = Object.keys(constants[modelName]).reduce((acc, key) => {
      const { module: m, ...rest } = constants.ADOR[key];
      if (m === module) {
        acc[key] = rest;
      }
      return acc;
    }, {});
    return data;
  }
  return constants[modelName];
};

const allKeys = new Set<string>();
Object.values(constants).forEach((parameterSet) => {
  Object.keys(parameterSet).forEach((key) => allKeys.add(key));
});
export const getAllKeys = (): Set<string> => allKeys;

export default constants;
