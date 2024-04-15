import { createContext, Dispatch } from 'react';

import { DataType, dataKey, defaultConfig } from 'helpers/layer/layer-config-helper';
import { ILayerConfig } from 'interfaces/ILayerConfig';

interface State extends ILayerConfig {
  selectedItem?: string;
}

export const getDefaultState = (): State => {
  const keys = Object.keys(defaultConfig);
  const initState = {} as State;
  keys.forEach((key) => {
    // Handle DataType and state type mismatch
    initState[dataKey[key]] = { value: defaultConfig[key as DataType] };
  });
  return initState;
};

export type Action = {
  type: 'update';
  payload: State;
} | {
  type: 'change';
  payload: {
    selectedItem?: string;
  } & {
    [key in keyof ILayerConfig]?: number | string;
  };
} | {
  type: 'rename';
  payload: string;
};

export const reducer = (state: State, action: Action): State => {
  if (action.type === 'update') return { ...state, ...action.payload };
  if (action.type === 'change') {
    const { payload } = action;
    const newState = { ...state };
    Object.keys(payload).forEach((key) => {
      if (key !== 'selectedItem') newState[key] = { value: payload[key] };
      else newState[key] = payload[key];
    });
    return newState;
  }
  if (action.type === 'rename') {
    const { payload } = action;
    const newState = { ...state };
    newState.configName = { value: payload };
    newState.selectedItem = payload;
    return newState;
  }
  return state;
};

interface Context {
  state: State;
  selectedLayers: string[];
  dispatch: Dispatch<Action>;
  simpleMode?: boolean;
  initState: (layers?: string[]) => void;
}

export default createContext<Context>({} as Context);
