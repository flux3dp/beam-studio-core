import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';

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
    wood_3mm_cutting: {
      power: 100,
      speed: 6,
      module: LayerModule.LASER_10W_DIODE,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting: {
      power: 100,
      speed: 3,
      module: LayerModule.LASER_10W_DIODE,
      name: 'wood_5mm_cutting',
    },
    wood_engraving: {
      power: 100,
      speed: 150,
      module: LayerModule.LASER_10W_DIODE,
      name: 'wood_engraving',
    },
    black_acrylic_3mm_cutting: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER_10W_DIODE,
      name: 'black_acrylic_3mm_cutting',
    },
    black_acrylic_5mm_cutting: {
      power: 100,
      speed: 2,
      repeat: 2,
      module: LayerModule.LASER_10W_DIODE,
      name: 'black_acrylic_5mm_cutting',
    },
    black_acrylic_engraving: {
      power: 90,
      speed: 175,
      module: LayerModule.LASER_10W_DIODE,
      name: 'black_acrylic_engraving',
    },
    mdf_3mm_cutting: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_10W_DIODE,
      name: 'mdf_3mm_cutting',
    },
    mdf_5mm_cutting: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER_10W_DIODE,
      name: 'mdf_5mm_cutting',
    },
    mdf_engraving: {
      power: 30,
      speed: 100,
      module: LayerModule.LASER_10W_DIODE,
      name: 'mdf_engraving',
    },
    leather_3mm_cutting: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_10W_DIODE,
      name: 'leather_3mm_cutting',
    },
    leather_5mm_cutting: {
      power: 100,
      speed: 3,
      repeat: 2,
      module: LayerModule.LASER_10W_DIODE,
      name: 'leather_5mm_cutting',
    },
    leather_engraving: {
      power: 30,
      speed: 100,
      module: LayerModule.LASER_10W_DIODE,
      name: 'leather_engraving',
    },
    denim_1mm_cutting: {
      power: 100,
      speed: 14,
      module: LayerModule.LASER_10W_DIODE,
      name: 'denim_1mm_cutting',
    },
    fabric_3mm_cutting: {
      power: 100,
      speed: 6,
      module: LayerModule.LASER_10W_DIODE,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER_10W_DIODE,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving: {
      power: 30,
      speed: 125,
      module: LayerModule.LASER_10W_DIODE,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving: {
      power: 100,
      speed: 15,
      module: LayerModule.LASER_10W_DIODE,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving: {
      power: 40,
      speed: 20,
      module: LayerModule.LASER_10W_DIODE,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving: {
      power: 100,
      speed: 20,
      module: LayerModule.LASER_10W_DIODE,
      name: 'metal_bw_engraving',
    },
    wood_3mm_cutting_20w: {
      power: 100,
      speed: 8,
      module: LayerModule.LASER_20W_DIODE,
      name: 'wood_3mm_cutting',
    },
    wood_5mm_cutting_20w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_20W_DIODE,
      name: 'wood_5mm_cutting',
    },
    wood_7mm_cutting_20w: {
      power: 100,
      speed: 2,
      module: LayerModule.LASER_20W_DIODE,
      name: 'wood_7mm_cutting',
    },
    wood_engraving_20w: {
      power: 70,
      speed: 150,
      module: LayerModule.LASER_20W_DIODE,
      name: 'wood_engraving',
    },
    black_acrylic_3mm_cutting_20w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_20W_DIODE,
      name: 'black_acrylic_3mm_cutting',
    },
    black_acrylic_5mm_cutting_20w: {
      power: 100,
      speed: 2,
      repeat: 1,
      module: LayerModule.LASER_20W_DIODE,
      name: 'black_acrylic_5mm_cutting',
    },
    black_acrylic_engraving_20w: {
      power: 65,
      speed: 175,
      module: LayerModule.LASER_20W_DIODE,
      name: 'black_acrylic_engraving',
    },
    mdf_3mm_cutting_20w: {
      power: 100,
      speed: 8,
      module: LayerModule.LASER_20W_DIODE,
      name: 'mdf_3mm_cutting',
    },
    mdf_5mm_cutting_20w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_20W_DIODE,
      name: 'mdf_5mm_cutting',
    },
    mdf_engraving_20w: {
      power: 70,
      speed: 100,
      module: LayerModule.LASER_20W_DIODE,
      name: 'mdf_engraving',
    },
    leather_3mm_cutting_20w: {
      power: 100,
      speed: 8,
      module: LayerModule.LASER_20W_DIODE,
      name: 'leather_3mm_cutting',
    },
    leather_engraving_20w: {
      power: 30,
      speed: 125,
      module: LayerModule.LASER_20W_DIODE,
      name: 'leather_engraving',
    },
    denim_1mm_cutting_20w: {
      power: 50,
      speed: 10,
      module: LayerModule.LASER_20W_DIODE,
      name: 'denim_1mm_cutting',
    },
    fabric_3mm_cutting_20w: {
      power: 100,
      speed: 10,
      module: LayerModule.LASER_20W_DIODE,
      name: 'fabric_3mm_cutting',
    },
    fabric_5mm_cutting_20w: {
      power: 100,
      speed: 4,
      module: LayerModule.LASER_20W_DIODE,
      name: 'fabric_5mm_cutting',
    },
    fabric_engraving_20w: {
      power: 40,
      speed: 150,
      module: LayerModule.LASER_20W_DIODE,
      name: 'fabric_engraving',
    },
    rubber_bw_engraving_20w: {
      power: 100,
      speed: 25,
      module: LayerModule.LASER_20W_DIODE,
      name: 'rubber_bw_engraving',
    },
    glass_bw_engraving_20w: {
      power: 40,
      speed: 30,
      module: LayerModule.LASER_20W_DIODE,
      name: 'glass_bw_engraving',
    },
    metal_bw_engraving_20w: {
      power: 90,
      speed: 20,
      module: LayerModule.LASER_20W_DIODE,
      name: 'metal_bw_engraving',
    },
    gold_engraving_1064: {
      power: 95,
      speed: 10,
      module: LayerModule.LASER_1064,
      name: 'gold_engraving',
    },
    brass_engraving_1064: {
      power: 85,
      speed: 30,
      module: LayerModule.LASER_1064,
      name: 'brass_engraving',
    },
    ti_engraving_1064: {
      power: 75,
      speed: 30,
      module: LayerModule.LASER_1064,
      name: 'ti_engraving',
    },
    stainless_steel_engraving_1064: {
      power: 90,
      speed: 20,
      module: LayerModule.LASER_1064,
      name: 'stainless_steel_engraving',
    },
    aluminum_engraving_1064: {
      power: 80,
      speed: 20,
      module: LayerModule.LASER_1064,
      name: 'aluminum_engraving',
    },
    black_acrylic_engraving_1064: {
      power: 50,
      speed: 40,
      module: LayerModule.LASER_1064,
      name: 'black_acrylic_engraving',
    },
    silver_engraving_1064: {
      power: 95,
      speed: 20,
      module: LayerModule.LASER_1064,
      name: 'silver_engraving',
    },
    iron_engraving_1064: {
      power: 90,
      speed: 20,
      module: LayerModule.LASER_1064,
      name: 'iron_engraving',
    },
    fabric_printing: {
      ink: 3,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'fabric_printing',
    },
    canvas_printing: {
      ink: 3,
      speed: 60,
      multipass: 4,
      module: LayerModule.PRINTER,
      name: 'canvas_printing',
    },
    cardstock_printing: {
      ink: 2,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'cardstock_printing',
    },
    wood_printing: {
      ink: 2,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'wood_printing',
    },
    bamboo_printing: {
      ink: 2,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'bamboo_printing',
    },
    cork_printing: {
      ink: 2,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'cork_printing',
    },
    flat_stone_printing: {
      ink: 3,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'flat_stone_printing',
    },
    acrylic_printing: {
      ink: 2,
      speed: 30,
      multipass: 4,
      module: LayerModule.PRINTER,
      name: 'acrylic_printing',
    },
    pc_printing: {
      ink: 2,
      speed: 30,
      multipass: 4,
      module: LayerModule.PRINTER,
      name: 'pc_printing',
    },
    stainless_steel_printing: {
      ink: 3,
      speed: 30,
      multipass: 4,
      module: LayerModule.PRINTER,
      name: 'stainless_steel_printing',
    },
    gloss_leather_printing: {
      ink: 3,
      speed: 60,
      multipass: 3,
      module: LayerModule.PRINTER,
      name: 'gloss_leather_printing',
    },
    glass_printing: {
      ink: 3,
      speed: 30,
      multipass: 4,
      module: LayerModule.PRINTER,
      name: 'glass_printing',
    },
  },
};

const modelMap = {
  fbm1: 'BEAMO',
  fbb1b: 'BEAMBOX',
  fbb1p: 'BEAMBOX_PRO',
  fhexa1: 'HEXA',
  fad1: 'ADOR',
  ado1: 'ADOR',
};

export const getAllPresets = (
  model: string
): {
  [key: string]: {
    name: string;
    power?: number;
    ink?: number;
    multipass?: number;
    speed: number;
    repeat?: number;
    module?: LayerModule;
  };
} => {
  const modelName = modelMap[model] || 'BEAMO';
  return constants[modelName];
};

export const getModulePresets = (
  model: string,
  module = LayerModule.LASER_10W_DIODE
): {
  [key: string]: {
    name: string;
    power?: number;
    ink?: number;
    multipass?: number;
    speed: number;
    repeat?: number;
  };
} => {
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
