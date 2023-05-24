import { createContext, Dispatch } from 'react';

import { ILayerConfig } from 'interfaces/ILayerConfig';

interface State extends ILayerConfig {
  selectedItem?: string;
}

export const getDefaultState = (): State => ({
  speed: { value: 3 },
  power: { value: 1 },
  ink: { value: 3 },
  repeat: { value: 1 },
  height: { value: -3 },
  zStep: { value: 0 },
  diode: { value: 0 },
  type: { value: 1 },
  configName: { value: '' },
});

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
      newState[key] = { value: payload[key] };
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
}

export default createContext<Context>({} as Context);
