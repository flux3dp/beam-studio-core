import { BBox } from 'interfaces/ICurveEngraving';
import { WorkAreaModel } from 'app/constants/workarea-constants';

export interface IBaseConfig {
  model: WorkAreaModel;
  travelSpeed: number;
  enableAutoFocus: boolean;
  enableDiode: boolean;
  shouldUseFastGradient: boolean;
  shouldMockFastGradient: boolean;
  vectorSpeedConstraint: boolean;
  paddingAccel: number | null;
}

export interface IFcodeConfig {
  model: WorkAreaModel;
  hardware_name: string;
  acc: number;
  spinning_axis_coord?: number;
  rotary_y_ratio?: number;
  prespray?: [number, number, number, number];
  multipass_compensation?: boolean;
  one_way_printing?: boolean;
  blade_radius?: number;
  precut_at?: [number, number];
  enable_autofocus?: boolean;
  z_offset?: number;
  support_diode?: boolean;
  diode_offset?: [number, number];
  diode_one_way_engraving?: boolean;
  clip?: [number, number, number, number]; // top right bottom left
  support_fast_gradient?: boolean;
  mock_fast_gradient?: boolean;
  has_vector_speed_constraint?: boolean;
  min_speed?: number;
  is_reverse_engraving?: boolean;
  custom_backlash?: boolean;
  min_engraving_padding?: number;
  min_printing_padding?: number;
  nozzle_votage?: number;
  nozzle_pulse_width?: number;
  travel_speed: number;
  path_travel_speed: number;
  a_travel_speed?: number;
  printing_top_padding?: number;
  printing_bot_padding?: number;
  module_offsets?: { [key: number]: [number, number] };
  loop_compensation?: number;
  curve_engraving?: {
    bbox: BBox;
    points: [number, number, number][];
    gap: [number, number];
  };
}
