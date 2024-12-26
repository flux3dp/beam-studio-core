/* eslint-disable no-case-declarations */
/* eslint-disable import/prefer-default-export */
import { useCallback, useReducer } from 'react';

import { Filter } from 'konva/lib/Node';

interface LineItem {
  points: number[];
  strokeWidth: number;
}

interface HistoryItem {
  lines: Array<LineItem>;
  filters: Array<Filter>;
}

interface HistoryState {
  items: Array<HistoryItem>;
  index: number;
  hasUndid?: boolean;
}

interface HistoryAction {
  type: 'PUSH' | 'UNDO' | 'REDO';
  payload?: HistoryItem;
}

interface HistoryContext {
  history: HistoryState;
  push: (item: HistoryItem) => void;
  undo: () => HistoryItem;
  redo: () => HistoryItem;
}

const historyReducer = (state: HistoryState, { type, payload }: HistoryAction) => {
  const { items, index, hasUndid } = state;

  switch (type) {
    case 'PUSH':
      const itemsToKeep = hasUndid ? items.slice(0, index + 1) : items;

      return { items: itemsToKeep.concat(payload), index: index + 1, hasUndid: false };
    case 'UNDO':
      return index > 0 ? { items, index: index - 1, hasUndid: true } : state;
    case 'REDO':
      return index < items.length - 1 ? { items, index: index + 1, hasUndid } : state;
    default:
      return state;
  }
};

// History management
export const useHistory = (initialState: HistoryState): HistoryContext => {
  const [history, dispatch] = useReducer(historyReducer, initialState);

  const push = useCallback((payload: HistoryItem) => dispatch({ type: 'PUSH', payload }), []);
  const undo = useCallback(() => {
    // return the initial state if there is no history to undo
    if (history.index === 0) {
      return { lines: [], filters: [] };
    }

    const lastItem = history.items[history.index - 1];

    dispatch({ type: 'UNDO' });

    return lastItem;
  }, [history]);
  const redo = useCallback(() => {
    // return the last state if there is no history to redo
    if (history.index === history.items.length - 1) {
      return history.items[history.index];
    }

    const nextItem = history.items[history.index + 1];

    dispatch({ type: 'REDO' });

    return nextItem;
  }, [history]);

  return { history, push, undo, redo };
};
