import LayerModule from 'app/constants/layer-module/layer-modules';
import { Preset } from 'interfaces/ILayerConfig';

import { WorkAreaModel } from './workarea-constants';

export const presets: {
  [model in WorkAreaModel]?: {
    [key: string]: {
      [module in LayerModule]?: Preset;
    };
  };
} = {
  fbm1: {
    wood_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 45,
        speed: 5,
        name: 'wood_3mm_cutting',
      },
    },
    wood_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 4,
        repeat: 2,
        name: 'wood_5mm_cutting',
      },
    },
    wood_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 25,
        speed: 150,
        name: 'wood_engraving',
      },
    },
    acrylic_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 4,
        name: 'acrylic_3mm_cutting',
      },
    },
    acrylic_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 5,
        repeat: 2,
        name: 'acrylic_5mm_cutting',
      },
    },
    acrylic_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 25,
        speed: 150,
        name: 'acrylic_engraving',
      },
    },
    leather_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 3,
        name: 'leather_3mm_cutting',
      },
    },
    leather_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 3,
        repeat: 2,
        name: 'leather_5mm_cutting',
      },
    },
    leather_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 30,
        speed: 150,
        name: 'leather_engraving',
      },
    },
    fabric_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 20,
        name: 'fabric_3mm_cutting',
      },
    },
    fabric_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 20,
        name: 'fabric_5mm_cutting',
      },
    },
    fabric_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 150,
        name: 'fabric_engraving',
      },
    },
    rubber_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 100,
        name: 'rubber_bw_engraving',
      },
    },
    glass_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 35,
        speed: 150,
        name: 'glass_bw_engraving',
      },
    },
    metal_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 80,
        name: 'steel_engraving_spray_engraving',
      },
    },
    stainless_steel_bw_engraving_diode: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 100,
        speed: 10,
        name: 'stainless_steel_bw_engraving_diode',
      },
    },
  },
  fbb1b: {
    wood_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 6,
        name: 'wood_3mm_cutting',
      },
    },
    wood_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 3,
        name: 'wood_5mm_cutting',
      },
    },
    wood_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 25,
        speed: 150,
        name: 'wood_engraving',
      },
    },
    acrylic_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 8,
        name: 'acrylic_3mm_cutting',
      },
    },
    acrylic_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 4,
        name: 'acrylic_5mm_cutting',
      },
    },
    acrylic_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 25,
        speed: 150,
        name: 'acrylic_engraving',
      },
    },
    leather_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 65,
        speed: 3,
        name: 'leather_3mm_cutting',
      },
    },
    leather_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 65,
        speed: 1,
        name: 'leather_5mm_cutting',
      },
    },
    leather_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 30,
        speed: 150,
        name: 'leather_engraving',
      },
    },
    fabric_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 20,
        name: 'fabric_3mm_cutting',
      },
    },
    fabric_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 60,
        speed: 20,
        name: 'fabric_5mm_cutting',
      },
    },
    fabric_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 150,
        name: 'fabric_engraving',
      },
    },
    rubber_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 45,
        speed: 130,
        name: 'rubber_bw_engraving',
      },
    },
    glass_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 30,
        speed: 150,
        name: 'glass_bw_engraving',
      },
    },
    metal_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 120,
        name: 'steel_engraving_spray_engraving',
      },
    },
    stainless_steel_bw_engraving_diode: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 100,
        speed: 10,
        name: 'stainless_steel_bw_engraving_diode',
      },
    },
  },
  fbb1p: {
    wood_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 7,
        name: 'wood_3mm_cutting',
      },
    },
    wood_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 4,
        name: 'wood_5mm_cutting',
      },
    },
    wood_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 150,
        name: 'wood_engraving',
      },
    },
    acrylic_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 7,
        name: 'acrylic_3mm_cutting',
      },
    },
    acrylic_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 4,
        name: 'acrylic_5mm_cutting',
      },
    },
    acrylic_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 15,
        speed: 150,
        name: 'acrylic_engraving',
      },
    },
    leather_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 4,
        name: 'leather_3mm_cutting',
      },
    },
    leather_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 2,
        name: 'leather_5mm_cutting',
      },
    },
    leather_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 150,
        name: 'leather_engraving',
      },
    },
    fabric_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 35,
        speed: 20,
        name: 'fabric_3mm_cutting',
      },
    },
    fabric_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 35,
        speed: 20,
        name: 'fabric_5mm_cutting',
      },
    },
    fabric_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 15,
        speed: 150,
        name: 'fabric_engraving',
      },
    },
    rubber_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 40,
        speed: 150,
        name: 'rubber_bw_engraving',
      },
    },
    glass_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 25,
        speed: 150,
        name: 'glass_bw_engraving',
      },
    },
    metal_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 140,
        name: 'steel_engraving_spray_engraving',
      },
    },
    stainless_steel_bw_engraving_diode: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 100,
        speed: 10,
        name: 'stainless_steel_bw_engraving_diode',
      },
    },
  },
  fhexa1: {
    wood_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 40,
        speed: 6,
        name: 'wood_3mm_cutting',
      },
    },
    wood_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 65,
        speed: 3,
        name: 'wood_5mm_cutting',
      },
    },
    wood_8mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 65,
        speed: 3,
        repeat: 2,
        name: 'wood_8mm_cutting',
      },
    },
    wood_10mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 65,
        speed: 3,
        repeat: 3,
        name: 'wood_10mm_cutting',
      },
    },
    wood_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 300,
        name: 'wood_engraving',
      },
    },
    acrylic_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 40,
        speed: 6,
        name: 'acrylic_3mm_cutting',
      },
    },
    acrylic_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 3,
        name: 'acrylic_5mm_cutting',
      },
    },
    acrylic_8mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 50,
        speed: 3,
        repeat: 2,
        name: 'acrylic_8mm_cutting',
      },
    },
    acrylic_10mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 3,
        repeat: 2,
        name: 'acrylic_10mm_cutting',
      },
    },
    acrylic_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 15,
        speed: 300,
        name: 'acrylic_engraving',
      },
    },
    leather_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 40,
        speed: 6,
        name: 'leather_3mm_cutting',
      },
    },
    leather_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 55,
        speed: 3,
        name: 'leather_5mm_cutting',
      },
    },
    leather_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 300,
        name: 'leather_engraving',
      },
    },
    fabric_3mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 15,
        speed: 25,
        name: 'fabric_3mm_cutting',
      },
    },
    fabric_5mm_cutting: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 20,
        name: 'fabric_5mm_cutting',
      },
    },
    fabric_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 15,
        speed: 250,
        name: 'fabric_engraving',
      },
    },
    rubber_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 45,
        speed: 300,
        name: 'rubber_bw_engraving',
      },
    },
    glass_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 35,
        speed: 150,
        name: 'glass_bw_engraving',
      },
    },
    metal_bw_engraving: {
      [LayerModule.LASER_UNIVERSAL]: {
        power: 20,
        speed: 150,
        name: 'steel_engraving_spray_engraving',
      },
    },
  },
  ado1: {
    wood_3mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 6,
        module: LayerModule.LASER_10W_DIODE,
        name: 'wood_3mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 8,
        module: LayerModule.LASER_20W_DIODE,
        name: 'wood_3mm_cutting',
      },
    },
    wood_5mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 3,
        module: LayerModule.LASER_10W_DIODE,
        name: 'wood_5mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_20W_DIODE,
        name: 'wood_5mm_cutting',
      },
    },
    wood_7mm_cutting: {
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 2,
        module: LayerModule.LASER_20W_DIODE,
        name: 'wood_7mm_cutting',
      },
    },
    wood_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 150,
        module: LayerModule.LASER_10W_DIODE,
        name: 'wood_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 70,
        speed: 150,
        module: LayerModule.LASER_20W_DIODE,
        name: 'wood_engraving',
      },
    },
    black_acrylic_3mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 2,
        module: LayerModule.LASER_10W_DIODE,
        name: 'black_acrylic_3mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_20W_DIODE,
        name: 'black_acrylic_3mm_cutting',
      },
    },
    black_acrylic_5mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 2,
        repeat: 2,
        module: LayerModule.LASER_10W_DIODE,
        name: 'black_acrylic_5mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 2,
        repeat: 1,
        module: LayerModule.LASER_20W_DIODE,
        name: 'black_acrylic_5mm_cutting',
      },
    },
    black_acrylic_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 90,
        speed: 175,
        module: LayerModule.LASER_10W_DIODE,
        name: 'black_acrylic_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 65,
        speed: 175,
        module: LayerModule.LASER_20W_DIODE,
        name: 'black_acrylic_engraving',
      },
      [LayerModule.LASER_1064]: {
        power: 50,
        speed: 40,
        module: LayerModule.LASER_1064,
        name: 'black_acrylic_engraving',
      },
    },
    mdf_3mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_10W_DIODE,
        name: 'mdf_3mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 8,
        module: LayerModule.LASER_20W_DIODE,
        name: 'mdf_3mm_cutting',
      },
    },
    mdf_5mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 2,
        module: LayerModule.LASER_10W_DIODE,
        name: 'mdf_5mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_20W_DIODE,
        name: 'mdf_5mm_cutting',
      },
    },
    mdf_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 30,
        speed: 100,
        module: LayerModule.LASER_10W_DIODE,
        name: 'mdf_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 70,
        speed: 100,
        module: LayerModule.LASER_20W_DIODE,
        name: 'mdf_engraving',
      },
    },
    leather_3mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_10W_DIODE,
        name: 'leather_3mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 8,
        module: LayerModule.LASER_20W_DIODE,
        name: 'leather_3mm_cutting',
      },
    },
    leather_5mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 3,
        repeat: 2,
        module: LayerModule.LASER_10W_DIODE,
        name: 'leather_5mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 6,
        repeat: 2,
        module: LayerModule.LASER_20W_DIODE,
        name: 'leather_5mm_cutting',
      },
    },
    leather_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 30,
        speed: 100,
        module: LayerModule.LASER_10W_DIODE,
        name: 'leather_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 30,
        speed: 125,
        module: LayerModule.LASER_20W_DIODE,
        name: 'leather_engraving',
      },
    },
    denim_1mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 14,
        module: LayerModule.LASER_10W_DIODE,
        name: 'denim_1mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 50,
        speed: 10,
        module: LayerModule.LASER_20W_DIODE,
        name: 'denim_1mm_cutting',
      },
    },
    fabric_3mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 6,
        module: LayerModule.LASER_10W_DIODE,
        name: 'fabric_3mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 10,
        module: LayerModule.LASER_20W_DIODE,
        name: 'fabric_3mm_cutting',
      },
    },
    fabric_5mm_cutting: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 2,
        module: LayerModule.LASER_10W_DIODE,
        name: 'fabric_5mm_cutting',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 4,
        module: LayerModule.LASER_20W_DIODE,
        name: 'fabric_5mm_cutting',
      },
    },
    fabric_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 30,
        speed: 125,
        module: LayerModule.LASER_10W_DIODE,
        name: 'fabric_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 40,
        speed: 150,
        module: LayerModule.LASER_20W_DIODE,
        name: 'fabric_engraving',
      },
    },
    rubber_bw_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 15,
        module: LayerModule.LASER_10W_DIODE,
        name: 'rubber_bw_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 100,
        speed: 25,
        module: LayerModule.LASER_20W_DIODE,
        name: 'rubber_bw_engraving',
      },
    },
    glass_bw_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 40,
        speed: 20,
        module: LayerModule.LASER_10W_DIODE,
        name: 'glass_bw_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 40,
        speed: 30,
        module: LayerModule.LASER_20W_DIODE,
        name: 'glass_bw_engraving',
      },
    },
    metal_bw_engraving: {
      [LayerModule.LASER_10W_DIODE]: {
        power: 100,
        speed: 20,
        module: LayerModule.LASER_10W_DIODE,
        name: 'metal_bw_engraving',
      },
      [LayerModule.LASER_20W_DIODE]: {
        power: 90,
        speed: 20,
        module: LayerModule.LASER_20W_DIODE,
        name: 'metal_bw_engraving',
      },
    },

    gold_engraving: {
      [LayerModule.LASER_1064]: {
        power: 95,
        speed: 10,
        module: LayerModule.LASER_1064,
        name: 'gold_engraving',
      },
    },
    brass_engraving: {
      [LayerModule.LASER_1064]: {
        power: 85,
        speed: 30,
        module: LayerModule.LASER_1064,
        name: 'brass_engraving',
      },
    },
    ti_engraving: {
      [LayerModule.LASER_1064]: {
        power: 75,
        speed: 30,
        module: LayerModule.LASER_1064,
        name: 'ti_engraving',
      },
    },
    stainless_steel_engraving: {
      [LayerModule.LASER_1064]: {
        power: 90,
        speed: 20,
        module: LayerModule.LASER_1064,
        name: 'stainless_steel_engraving',
      },
    },
    aluminum_engraving: {
      [LayerModule.LASER_1064]: {
        power: 80,
        speed: 20,
        module: LayerModule.LASER_1064,
        name: 'aluminum_engraving',
      },
    },
    silver_engraving: {
      [LayerModule.LASER_1064]: {
        power: 95,
        speed: 20,
        module: LayerModule.LASER_1064,
        name: 'silver_engraving',
      },
    },
    iron_engraving: {
      [LayerModule.LASER_1064]: {
        power: 90,
        speed: 20,
        module: LayerModule.LASER_1064,
        name: 'iron_engraving',
      },
    },

    fabric_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'fabric_printing',
      },
    },
    canvas_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 60,
        multipass: 4,
        module: LayerModule.PRINTER,
        name: 'canvas_printing',
      },
    },
    cardstock_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'cardstock_printing',
      },
    },
    wood_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'wood_printing',
      },
    },
    bamboo_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'bamboo_printing',
      },
    },
    cork_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'cork_printing',
      },
    },
    flat_stone_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'flat_stone_printing',
      },
    },
    acrylic_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 30,
        multipass: 4,
        module: LayerModule.PRINTER,
        name: 'acrylic_printing',
      },
    },
    pc_printing: {
      [LayerModule.PRINTER]: {
        ink: 2,
        speed: 30,
        multipass: 4,
        module: LayerModule.PRINTER,
        name: 'pc_printing',
      },
    },
    stainless_steel_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 30,
        multipass: 4,
        module: LayerModule.PRINTER,
        name: 'stainless_steel_printing',
      },
    },
    gloss_leather_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 60,
        multipass: 3,
        module: LayerModule.PRINTER,
        name: 'gloss_leather_printing',
      },
    },
    glass_printing: {
      [LayerModule.PRINTER]: {
        ink: 3,
        speed: 30,
        multipass: 4,
        module: LayerModule.PRINTER,
        name: 'glass_printing',
      },
    },
  },
  fbb2: {},
};

const allKeys = new Set<string>();
Object.keys(presets).forEach((model) => {
  Object.keys(presets[model]).forEach((key) => {
    allKeys.add(key);
  });
});
export const getAllKeys = (): Set<string> => allKeys;

export default presets;
