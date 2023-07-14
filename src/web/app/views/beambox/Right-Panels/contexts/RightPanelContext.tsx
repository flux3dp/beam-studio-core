import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

export type RightPanelMode = 'element' | 'path-edit';
interface IRightPanelContext {
  mode: RightPanelMode;
  selectedElement: Element;
}

export const RightPanelContext = React.createContext<IRightPanelContext>({
  mode: 'element',
  selectedElement: null,
});
const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

interface State {
  mode: RightPanelMode;
  selectedElement: Element;
}

export class RightPanelContextProvider extends React.Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'element',
      selectedElement: null,
    };
  }

  componentDidMount() {
    rightPanelEventEmitter.on('SET_MODE', this.setMode.bind(this));
    rightPanelEventEmitter.on('SET_SELECTED_ELEMENT', this.setSelectedElement.bind(this));
  }

  componentWillUnmount() {
    rightPanelEventEmitter.removeAllListeners();
  }

  setMode = (mode: RightPanelMode): void => {
    const { mode: currentMode } = this.state;
    if (mode === 'path-edit' || currentMode !== mode) {
      this.setState({ mode });
    }
  };

  setSelectedElement = (elems: Element): void => {
    const { selectedElement } = this.state;
    if (elems !== selectedElement) {
      (document.activeElement as HTMLInputElement).blur();
      this.setState({ selectedElement: elems });
    }
  };

  render(): JSX.Element {
    const { children } = this.props;
    const {
      mode,
      selectedElement,
    } = this.state;
    return (
      <RightPanelContext.Provider value={{
        mode,
        selectedElement,
      }}
      >
        {children}
      </RightPanelContext.Provider>
    );
  }
}
