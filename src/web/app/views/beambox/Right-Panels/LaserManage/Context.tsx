import React, { Dispatch } from 'react';

import i18n from 'helpers/i18n';
import isObjectEmpty from 'helpers/is-object-empty';
import storage from 'implementations/storage';
import { getDefaultPresetData } from 'helpers/presets/preset-helper';
import { ILaserConfig, ILaserDataChanges } from 'interfaces/ILaserConfig';

interface State {
  configs: ILaserConfig[];
  selectedItem : {
    name: string;
    isCustomized: boolean;
  };
  presetsInUse: { [name: string]: boolean };
  dataChanges: { [key: string]: ILaserDataChanges };
  displayValues: {
    speed: number;
    power: number;
    repeat: number;
    zStep: number;
  };
}

interface SelectPayload {
  name: string;
  isCustomized: boolean;
}
interface ChangePayload {
  name: string;
  key: 'speed' | 'power' | 'repeat' | 'zStep';
  value: number;
}
interface AddConfigPayload {
  name: string;
}
interface SwapConfigPayload {
  orig: number;
  dist: number;
}

type Action = {
  type: 'select';
  payload: SelectPayload;
} | {
  type: 'change';
  payload: ChangePayload;
} | {
  type: 'add-config';
  payload: AddConfigPayload;
} | {
  type: 'swap-config';
  payload: SwapConfigPayload;
} | {
  type: 'add-preset';
  payload?: never;
} | {
  type: 'remove-preset';
  payload?: never;
} | {
  type: 'delete';
  payload?: never;
} | {
  type: 'reset';
  payload?: never;
};

export const getInitState = (selectingConfigName: string): State => {
  const configs: ILaserConfig[] = storage.get('customizedLaserConfigs') || [];
  const presetsInUse = storage.get('defaultLaserConfigsInUse');
  const selectedConfig = configs.find((c) => c.name === selectingConfigName);
  const { speed, power, repeat, zStep } = selectedConfig || {};
  return {
    configs,
    selectedItem: { name: selectingConfigName, isCustomized: true },
    presetsInUse,
    dataChanges: {},
    displayValues: {
      speed: speed || 1,
      power: power || 0,
      repeat: repeat || 1,
      zStep: zStep || 0,
    },
  };
};

const selectAction = (state: State, payload: SelectPayload): State => {
  const { name, isCustomized } = payload;
  if (isCustomized) {
    const { configs, dataChanges } = state;
    const selectedConfig = configs.find((c) => c.name === name);
    const { speed, power, repeat, zStep } = { ...selectedConfig, ...dataChanges[name] };
    return {
      ...state,
      selectedItem: { name, isCustomized },
      displayValues: { speed, power, repeat, zStep },
    };
  }
  // selecting presets
  const { speed, power, repeat } = getDefaultPresetData(name);
  const zStep = 0;
  return {
    ...state,
    selectedItem: { name, isCustomized },
    displayValues: { speed, power, repeat, zStep },
  };
};

const changeAction = (state: State, payload: ChangePayload): State => {
  const { name, key, value } = payload;
  const { configs, dataChanges, displayValues } = state;
  const selectedConfig = configs.find((c) => c.name === name);
  if (selectedConfig[key] !== value) {
    if (!dataChanges[name]) {
      const change = {};
      change[key] = value;
      dataChanges[name] = change;
    } else {
      dataChanges[name][key] = value;
    }
  } else {
    if (dataChanges[name]) {
      delete dataChanges[name][key];
    }
    if (isObjectEmpty(dataChanges[name])) {
      delete dataChanges[name];
    }
  }
  return {
    ...state,
    dataChanges,
    displayValues: {
      ...displayValues,
      [key]: value,
    },
  };
};

const addConfigAction = (state: State, payload: AddConfigPayload): State => {
  const { name } = payload;
  const { configs } = state;
  configs.push({ name, speed: 20, power: 15, repeat: 1, zStep: 0 });
  return {
    ...state,
    selectedItem: { name, isCustomized: true },
    displayValues: { speed: 20, power: 15, repeat: 1, zStep: 0 },
  };
};

const swapConfigAction = (state: State, payload: SwapConfigPayload): State => {
  const { orig, dist } = payload;
  const { configs } = state;
  [configs[orig], configs[dist]] = [configs[dist], configs[orig]];
  return {
    ...state,
    configs,
  };
};

const addPresetAction = (state: State): State => {
  const { selectedItem: { name: key, isCustomized }, configs, presetsInUse } = state;
  if (!isCustomized && key !== '') {
    const unit = storage.get('default-units') || 'mm';
    const displayName = i18n.lang.beambox.right_panel.laser_panel.dropdown[unit][key];
    if (presetsInUse[key]) {
      return { ...state, selectedItem: { name: displayName, isCustomized: true } };
    }
    const { speed, power, repeat } = getDefaultPresetData(key);
    presetsInUse[key] = true;
    configs.push({ name: displayName, speed, power, repeat, zStep: 0, isDefault: true, key });
    return {
      ...state,
      selectedItem: { name: displayName, isCustomized: true },
      configs,
      presetsInUse,
    };
  }
  return state;
};

const removePresetAction = (state: State): State => {
  const { selectedItem: { name, isCustomized }, configs, presetsInUse, dataChanges } = state;
  const unit = storage.get('default-units') || 'mm';
  const configName = isCustomized ? name : i18n.lang.beambox.right_panel.laser_panel.dropdown[unit][name];
  const index = configs.findIndex((c) => c.name === configName);

  if (index < 0 || !configs[index].isDefault) return state;
  const { key } = configs[index];
  presetsInUse[key] = false;
  configs.splice(index, 1);
  if (configs.length > 0) {
    // if custom config list is not empty, selecting config above
    const newIndex = Math.min(index, configs.length - 1);
    const newConfig = configs[newIndex];
    const { name: newConfgName, speed, power, repeat, zStep } = { ...newConfig, ...dataChanges[newConfig.name] };
    return {
      ...state,
      configs,
      presetsInUse,
      selectedItem: { name: newConfgName, isCustomized: true },
      displayValues: { speed, power, repeat: repeat || 1, zStep: zStep || 0 },
    };
  }
  // selecting remove preset in preset list
  return {
    ...state,
    configs,
    presetsInUse,
    selectedItem: { name, isCustomized: false },
  };
};

const deleteAction = (state: State): State => {
  const { selectedItem: { name, isCustomized }, configs, dataChanges } = state;
  if (!isCustomized) return state;
  const idx = configs.findIndex((c) => c.name === name);
  if (idx < 0) return state;
  if (configs[idx].isDefault) return removePresetAction(state);
  configs.splice(idx, 1);
  if (configs.length > 0) {
    // if custom config list is not empty, selecting config above
    const newIndex = Math.min(idx, configs.length - 1);
    const newConfig = configs[newIndex];
    const { name: newConfgName, speed, power, repeat, zStep } = { ...newConfig, ...dataChanges[newConfig.name] };
    return {
      ...state,
      configs,
      selectedItem: { name: newConfgName, isCustomized: true },
      displayValues: { speed, power, repeat: repeat || 1, zStep: zStep || 0 },
    };
  }
  return {
    ...state,
    configs,
    selectedItem: { name: '', isCustomized: false },
    displayValues: { speed: 1, power: 0, repeat: 1, zStep: 0 },
  };
};

const resetAction = (state: State): State => {
  const configs = storage.get('customizedLaserConfigs') || [];
  const presetsInUse = storage.get('defaultLaserConfigsInUse') || {};
  return { ...state, configs, presetsInUse };
};

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;
  switch (type) {
    case 'select':
      return selectAction(state, payload);
    case 'change':
      return changeAction(state, payload);
    case 'add-config':
      return addConfigAction(state, payload);
    case 'swap-config':
      return swapConfigAction(state, payload);
    case 'add-preset':
      return addPresetAction(state);
    case 'remove-preset':
      return removePresetAction(state);
    case 'delete':
      return deleteAction(state);
    case 'reset':
      return resetAction(state);
    default:
      break;
  }
  return state;
};

interface Context {
  state: State;
  dispatch: Dispatch<Action>;
}

export default React.createContext<Context>({} as Context);
