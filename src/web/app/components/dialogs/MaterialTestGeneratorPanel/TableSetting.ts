import { promarkModels } from 'app/actions/beambox/constant';
import { LaserType } from 'app/constants/promark-constants';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { getPromarkLimit } from 'helpers/layer/layer-config-helper';

export interface Detail {
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  // default value is used when the param is not set
  default: number;
  // selected is used to determine which param is selected
  // by order, 0 for column, 1 for row, 2 for static param with default value
  selected: 0 | 1 | 2;
}

export const tableParams = ['strength', 'speed', 'repeat'] as const;
export const mopaTableParams = ['pulseWidth', 'frequency'] as const;
export type TableSetting = { [key in (typeof tableParams)[number]]: Detail } & {
  [key in (typeof mopaTableParams)[number]]?: Detail;
};

const defaultTableSetting = (workarea: WorkAreaModel): TableSetting => {
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

const mopaTableSetting = (workarea: WorkAreaModel): TableSetting => {
  const { minSpeed, maxSpeed } = getWorkarea(workarea);
  const limit = getPromarkLimit();

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
      minValue: minSpeed,
      maxValue: maxSpeed,
      min: minSpeed,
      max: maxSpeed,
      default: 1000,
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
    pulseWidth: {
      minValue: limit.pulseWidth.min,
      maxValue: limit.pulseWidth.max,
      min: limit.pulseWidth.min,
      max: limit.pulseWidth.max,
      default: 350,
      selected: 2,
    },
    frequency: {
      minValue: limit.frequency.min,
      maxValue: limit.frequency.max,
      min: limit.frequency.min,
      max: limit.frequency.max,
      default: 25,
      selected: 2,
    },
  };
};

export const tableSetting = (workarea: WorkAreaModel, laserType?: LaserType): TableSetting => {
  if (promarkModels.has(workarea) && laserType === LaserType.MOPA) {
    return mopaTableSetting(workarea);
  }

  return defaultTableSetting(workarea);
};
