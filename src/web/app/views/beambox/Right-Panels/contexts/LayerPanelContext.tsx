import React, { createContext, useEffect, useState, memo, useCallback } from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import useForceUpdate from 'helpers/use-force-update';

interface ILayerPanelContext {
  selectedLayers: string[];
  setSelectedLayers: (selectedLayers: string[]) => void;
  forceUpdate: () => void;
}

export const LayerPanelContext = createContext<ILayerPanelContext>({
  selectedLayers: [],
  setSelectedLayers: () => { },
  forceUpdate: () => { },
});
const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

interface Props {
  children?: React.ReactNode;
}

export const LayerPanelContextProvider = memo(({ children }: Props): JSX.Element => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const forceUpdate = useForceUpdate();
  const lazySetSelectedLayers = useCallback((newLayers: string[]) => {
    if (newLayers.length === selectedLayers.length && newLayers.every((name, i) => name === selectedLayers[i])) {
      return;
    }
    setSelectedLayers(newLayers);
  }, [selectedLayers, setSelectedLayers]);

  useEffect(() => {
    layerPanelEventEmitter.on('UPDATE_LAYER_PANEL', forceUpdate);
    return () => {
      layerPanelEventEmitter.removeListener('UPDATE_LAYER_PANEL', forceUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    layerPanelEventEmitter.on('SET_SELECTED_LAYERS', lazySetSelectedLayers);
    return () => {
      layerPanelEventEmitter.removeListener('SET_SELECTED_LAYERS', lazySetSelectedLayers);
    };
  }, [lazySetSelectedLayers]);

  useEffect(() => {
    const getSelectedLayers = (response: { selectedLayers: string[] }) => {
      response.selectedLayers = selectedLayers;
    };
    layerPanelEventEmitter.on('GET_SELECTED_LAYERS', getSelectedLayers);
    return () => {
      layerPanelEventEmitter.removeListener('GET_SELECTED_LAYERS', getSelectedLayers);
    };
  }, [selectedLayers]);

  return (
    <LayerPanelContext.Provider value={{
      selectedLayers,
      setSelectedLayers: lazySetSelectedLayers,
      forceUpdate,
    }}
    >
      {children}
    </LayerPanelContext.Provider>
  );
});
