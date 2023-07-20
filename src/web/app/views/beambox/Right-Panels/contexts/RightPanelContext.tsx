import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

export type RightPanelMode = 'element' | 'path-edit';
interface IRightPanelContext {
  mode: RightPanelMode;
}

export const RightPanelContext = React.createContext<IRightPanelContext>({
  mode: 'element',
});
const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

interface State {
  mode: RightPanelMode;
}

export class RightPanelContextProvider extends React.Component<any, State> {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'element',
    };
  }

  componentDidMount() {
    rightPanelEventEmitter.on('SET_MODE', this.setMode.bind(this));
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

  render(): JSX.Element {
    const { children } = this.props;
    const {
      mode,
    } = this.state;
    return (
      <RightPanelContext.Provider value={{ mode }}>
        {children}
      </RightPanelContext.Provider>
    );
  }
}
