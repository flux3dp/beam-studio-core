import React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

interface IObjectPanelContext {
  dimensionValues: any;
  updateDimensionValues: (newValues: any) => void;
  getDimensionValues: (response: {
    dimensionValues: any,
  }, key?: string,) => any;
  updateObjectPanel: () => void;
}

export const ObjectPanelContext = React.createContext<IObjectPanelContext>({
  dimensionValues: {},
  updateDimensionValues: () => { },
  getDimensionValues: () => { },
  updateObjectPanel: () => { },
});
const objectPanelEventEmitter = eventEmitterFactory.createEventEmitter('object-panel');
const minRenderInterval = 200;

interface State {
  lastUpdateTime: number;
}

export class ObjectPanelContextProvider extends React.Component<any, State> {
  private dimensionValues: any;

  private updateTimeout: NodeJS.Timeout;

  constructor(props) {
    super(props);
    this.dimensionValues = {};
    this.state = {
      lastUpdateTime: Date.now(),
    };
  }

  componentDidMount() {
    objectPanelEventEmitter.on('UPDATE_DIMENSION_VALUES', this.updateDimensionValues.bind(this));
    objectPanelEventEmitter.on('GET_DIMENSION_VALUES', this.getDimensionValues.bind(this));
    objectPanelEventEmitter.on('UPDATE_OBJECT_PANEL', this.updateObjectPanel.bind(this));
  }

  componentWillUnmount() {
    objectPanelEventEmitter.removeAllListeners();
  }

  updateDimensionValues = (newValues: any): void => {
    this.dimensionValues = {
      ...this.dimensionValues,
      ...newValues,
    };
  };

  getDimensionValues = (response: {
    dimensionValues: any,
  }, key?: string): void => {
    response.dimensionValues = key ? this.dimensionValues[key] : this.dimensionValues;
  };

  updateObjectPanel = (): void => {
    clearTimeout(this.updateTimeout);
    const time = Date.now();
    const { lastUpdateTime } = this.state;
    if (time - lastUpdateTime >= minRenderInterval) {
      this.setState({ lastUpdateTime: time });
    } else {
      this.updateTimeout = setTimeout(() => {
        this.setState({
          lastUpdateTime: lastUpdateTime + minRenderInterval,
        });
      }, lastUpdateTime + minRenderInterval - time);
    }
  };

  render(): JSX.Element {
    const { children } = this.props;
    const {
      dimensionValues,
      updateDimensionValues,
      getDimensionValues,
      updateObjectPanel,
    } = this;
    return (
      <ObjectPanelContext.Provider value={{
        dimensionValues,
        updateDimensionValues,
        getDimensionValues,
        updateObjectPanel,
      }}
      >
        {children}
      </ObjectPanelContext.Provider>
    );
  }
}
