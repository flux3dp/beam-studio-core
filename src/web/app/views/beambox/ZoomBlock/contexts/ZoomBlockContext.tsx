import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

export const ZoomBlockContext = React.createContext({});
export const eventEmitter = eventEmitterFactory.createEventEmitter();

export class ZoomBlockContextProvider extends React.Component<any> {
  componentDidMount() {
    eventEmitter.on('UPDATE_ZOOM_BLOCK', this.forceUpdate.bind(this));
  }

  render() {
    const { children } = this.props;
    return (
      <ZoomBlockContext.Provider value={{}}>
        {children}
      </ZoomBlockContext.Provider>
    );
  }
}
