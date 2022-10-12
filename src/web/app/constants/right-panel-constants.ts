const constants = {
  BEAMO: {
    wood_3mm_cutting: {
      power: 45,
      speed: 5,
    },
    wood_5mm_cutting: {
      power: 55,
      speed: 4,
      repeat: 2,
    },
    wood_engraving: {
      power: 25,
      speed: 150,
    },
    acrylic_3mm_cutting: {
      power: 55,
      speed: 4,
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 5,
      repeat: 2,
    },
    acrylic_engraving: {
      power: 25,
      speed: 150,
    },
    leather_3mm_cutting: {
      power: 60,
      speed: 3,
    },
    leather_5mm_cutting: {
      power: 60,
      speed: 3,
      repeat: 2,
    },
    leather_engraving: {
      power: 30,
      speed: 150,
    },
    fabric_3mm_cutting: {
      power: 50,
      speed: 20,
    },
    fabric_5mm_cutting: {
      power: 50,
      speed: 20,
    },
    fabric_engraving: {
      power: 20,
      speed: 150,
    },
    rubber_bw_engraving: {
      power: 50,
      speed: 140,
    },
    glass_bw_engraving: {
      power: 35,
      speed: 150,
    },
    metal_bw_engraving: {
      power: 50,
      speed: 80,
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
    },
  },
  BEAMBOX: {
    wood_3mm_cutting: {
      power: 60,
      speed: 6,
    },
    wood_5mm_cutting: {
      power: 60,
      speed: 3,
    },
    wood_engraving: {
      power: 25,
      speed: 150,
    },
    acrylic_3mm_cutting: {
      power: 60,
      speed: 8,
    },
    acrylic_5mm_cutting: {
      power: 60,
      speed: 4,
    },
    acrylic_engraving: {
      power: 25,
      speed: 150,
    },
    leather_3mm_cutting: {
      power: 65,
      speed: 3,
    },
    leather_5mm_cutting: {
      power: 65,
      speed: 1,
    },
    leather_engraving: {
      power: 30,
      speed: 150,
    },
    fabric_3mm_cutting: {
      power: 60,
      speed: 20,
    },
    fabric_5mm_cutting: {
      power: 60,
      speed: 20,
    },
    fabric_engraving: {
      power: 20,
      speed: 150,
    },
    rubber_bw_engraving: {
      power: 45,
      speed: 130,
    },
    glass_bw_engraving: {
      power: 30,
      speed: 150,
    },
    metal_bw_engraving: {
      power: 50,
      speed: 120,
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
    },
  },
  BEAMBOX_PRO: {
    wood_3mm_cutting: {
      power: 55,
      speed: 7,
    },
    wood_5mm_cutting: {
      power: 55,
      speed: 4,
    },
    wood_engraving: {
      power: 20,
      speed: 150,
    },
    acrylic_3mm_cutting: {
      power: 55,
      speed: 7,
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 4,
    },
    acrylic_engraving: {
      power: 15,
      speed: 150,
    },
    leather_3mm_cutting: {
      power: 55,
      speed: 4,
    },
    leather_5mm_cutting: {
      power: 55,
      speed: 2,
    },
    leather_engraving: {
      power: 20,
      speed: 150,
    },
    fabric_3mm_cutting: {
      power: 35,
      speed: 20,
    },
    fabric_5mm_cutting: {
      power: 35,
      speed: 20,
    },
    fabric_engraving: {
      power: 15,
      speed: 150,
    },
    rubber_bw_engraving: {
      power: 40,
      speed: 150,
    },
    glass_bw_engraving: {
      power: 25,
      speed: 150,
    },
    metal_bw_engraving: {
      power: 50,
      speed: 140,
    },
    stainless_steel_bw_engraving_diode: {
      power: 100,
      speed: 10,
    },
  },
  HEXA: {
    wood_3mm_cutting: {
      power: 40,
      speed: 6,
    },
    wood_5mm_cutting: {
      power: 65,
      speed: 3,
    },
    wood_8mm_cutting: {
      power: 65,
      speed: 3,
      repeat: 2,
    },
    wood_10mm_cutting: {
      power: 65,
      speed: 3,
      repeat: 3,
    },
    wood_engraving: {
      power: 30,
      speed: 500,
    },
    acrylic_3mm_cutting: {
      power: 40,
      speed: 6,
    },
    acrylic_5mm_cutting: {
      power: 55,
      speed: 3,
    },
    acrylic_8mm_cutting: {
      power: 50,
      speed: 3,
      repeat: 2,
    },
    acrylic_10mm_cutting: {
      power: 55,
      speed: 3,
      repeat: 2,
    },
    acrylic_engraving: {
      power: 25,
      speed: 500,
    },
    leather_3mm_cutting: {
      power: 40,
      speed: 6,
    },
    leather_5mm_cutting: {
      power: 55,
      speed: 3,
    },
    leather_engraving: {
      power: 20,
      speed: 180,
    },
    fabric_3mm_cutting: {
      power: 15,
      speed: 25,
    },
    fabric_5mm_cutting: {
      power: 20,
      speed: 20,
    },
    fabric_engraving: {
      power: 35,
      speed: 400,
    },
    rubber_bw_engraving: {
      power: 45,
      speed: 300,
    },
    glass_bw_engraving: {
      power: 30,
      speed: 150,
    },
    metal_bw_engraving: {
      power: 25,
      speed: 200,
    },
  },
};

export const getParametersSet = (model: string): { [name: string]: { [key: string]: number } } => {
  const modelMap = {
    fbm1: 'BEAMO',
    fbb1b: 'BEAMBOX',
    fbb1p: 'BEAMBOX_PRO',
    fhexa1: 'HEXA',
  };
  const modelName = modelMap[model] || 'BEAMO';
  return constants[modelName];
};

const allKeys = new Set<string>();
Object.values(constants).forEach((parameterSet) => {
  Object.keys(parameterSet).forEach((key) => allKeys.add(key));
});
export const getAllKeys = (): Set<string> => allKeys;

export default constants;
