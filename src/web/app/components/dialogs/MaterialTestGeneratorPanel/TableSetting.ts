import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import { getWorkarea } from 'app/constants/workarea-constants';

export interface Detail {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  // default value is used when the param is not set
  default: number;
  // selected is used to determine which param is selected
  // by order, 0 for column, 1 for row, 2 for static param with default value
  selected: number;
}

export const tableParams = ['strength', 'speed', 'repeat'] as const;
export type TableSetting = Record<(typeof tableParams)[number], Detail>;

export const tableSetting = (): TableSetting => {
  const workarea = BeamboxPreference.read('workarea');
  const { maxSpeed } = getWorkarea(workarea);

  return {
    strength: {
      minValue: 15,
      maxValue: 100,
      min: 1,
      max: 100,
      default: 15,
      selected: 0,
    },
    speed: {
      minValue: 20,
      maxValue: maxSpeed,
      min: 1,
      max: maxSpeed,
      default: 20,
      selected: 1,
    },
    repeat: {
      minValue: 1,
      maxValue: 5,
      min: 1,
      max: 100,
      default: 1,
      selected: 2,
    },
  };
};
