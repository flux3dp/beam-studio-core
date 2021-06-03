import * as React from 'react';
import { ILayerPanelContext } from 'interfaces/IContext';

export const LayerPanelContext = React.createContext<ILayerPanelContext>(null);

interface Props {
  children: React.ReactNode;
}

export class LayerPanelContextProvider extends React.Component<Props> {
  private contextValue = null;

  private selectedLayers: string[] = [];

  constructor(props) {
    super(props);
    this.updateContextValue();
  }

  updateContextValue = (): void => {
    const {
      selectedLayers,
      setSelectedLayers,
      updateLayerPanel,
    } = this;
    this.contextValue = {
      selectedLayers,
      setSelectedLayers,
      updateLayerPanel,
    };
  };

  setSelectedLayers = (selectedLayers: string[]): null => {
    this.selectedLayers = [...selectedLayers];
    this.updateContextValue();
    this.forceUpdate();
    return null;
  };

  updateLayerPanel = (): void => {
    this.forceUpdate();
  };

  render() {
    const { children } = this.props;
    return (
      <LayerPanelContext.Provider value={this.contextValue}>
        {children}
      </LayerPanelContext.Provider>
    );
  }
}
