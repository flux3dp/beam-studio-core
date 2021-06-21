import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

interface ILayerPanelContext {
  selectedLayers: string[];
  setSelectedLayers: (selectedLayers: string[]) => void,
}

export const LayerPanelContext = React.createContext<ILayerPanelContext>({
  selectedLayers: [],
  setSelectedLayers: () => { },
});
const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

interface State {
  selectedLayers: string[];
}

export class LayerPanelContextProvider extends React.PureComponent<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLayers: [],
    };
  }

  componentDidMount() {
    layerPanelEventEmitter.on('UPDATE_LAYER_PANEL', this.updateLayerPanel.bind(this));
    layerPanelEventEmitter.on('SET_SELECTED_LAYERS', this.setSelectedLayers.bind(this));
    layerPanelEventEmitter.on('GET_SELECTED_LAYERS', this.getSelectedLayers.bind(this));
  }

  componentWillUnmount() {
    layerPanelEventEmitter.removeAllListeners();
  }

  setSelectedLayers = (selectedLayers: string[]): void => {
    this.setState({
      selectedLayers: [...selectedLayers],
    });
  };

  getSelectedLayers = (response: {
    selectedLayers: string[],
  }): void => {
    const { selectedLayers } = this.state;
    response.selectedLayers = selectedLayers;
  };

  updateLayerPanel = (): void => {
    this.forceUpdate();
  };

  render(): JSX.Element {
    const { children } = this.props;
    const { selectedLayers } = this.state;
    const { setSelectedLayers } = this;
    return (
      <LayerPanelContext.Provider value={{
        selectedLayers,
        setSelectedLayers,
      }}
      >
        {children}
      </LayerPanelContext.Provider>
    );
  }
}
