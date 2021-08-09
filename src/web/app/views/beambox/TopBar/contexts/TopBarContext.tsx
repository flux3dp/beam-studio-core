import * as React from 'react';

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { IUser } from 'interfaces/IUser';

export const TopBarContext = React.createContext({});
const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
const fluxIDEventEmitter = eventEmitterFactory.createEventEmitter('flux-id');

export interface ITopBarContext {
  updateTopBar: () => void,
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void,
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void,
  setStartPreviewCallback: (callback: () => void | null) => void,
  startPreivewCallback: () => void | null,
  currentUser: IUser,
  fileName: string | null,
  selectedElem: Element | null,
  hasUnsavedChange: boolean,
  shouldStartPreviewController: boolean,
}

interface State {
  fileName: string | null;
  selectedElem: Element | null;
  hasUnsavedChange: boolean;
  shouldStartPreviewController: boolean;
  currentUser?: IUser;
}

export class TopBarContextProvider extends React.Component<any, State> {
  private isPreviewMode: boolean;

  private startPreivewCallback: () => void | null;

  constructor(props) {
    super(props);
    this.state = {
      fileName: null,
      selectedElem: null,
      hasUnsavedChange: false,
      shouldStartPreviewController: false,
      currentUser: null,
    };
    this.startPreivewCallback = null;
  }

  componentDidMount() {
    fluxIDEventEmitter.on('update-user', this.setCurrentUser);
    topBarEventEmitter.on('UPDATE_TOP_BAR', this.updateTopBar.bind(this));
    topBarEventEmitter.on('SET_ELEMENT', this.setElement.bind(this));
    topBarEventEmitter.on('SET_FILE_NAME', this.setFileName.bind(this));
    topBarEventEmitter.on('SET_HAS_UNSAVED_CHANGE', this.setHasUnsavedChange.bind(this));
    topBarEventEmitter.on('GET_TOP_BAR_PREVIEW_MODE', this.getTopBarPreviewMode.bind(this));
    topBarEventEmitter.on('SET_SHOULD_START_PREVIEW_CONTROLLER', this.setShouldStartPreviewController.bind(this));
    topBarEventEmitter.on('SET_START_PREVIEW_CALLBACK', this.setStartPreviewCallback.bind(this));
    window.addEventListener('update-user', (e: CustomEvent) => {
      this.setCurrentUser.call(this, e.detail.user);
    });
  }

  componentWillUnmount() {
    fluxIDEventEmitter.removeListener('update-user', this.setCurrentUser);
    topBarEventEmitter.removeAllListeners();
  }

  updateTopBar = (): void => {
    this.setState(this.state);
  };

  setHasUnsavedChange = (hasUnsavedChange: boolean): void => {
    this.setState({ hasUnsavedChange });
  };

  setElement = (elem: Element | null): void => {
    this.setState({ selectedElem: elem });
  };

  setFileName = (fileName: string): void => {
    this.setState({ fileName });
  };

  setTopBarPreviewMode = (isPreviewMode: boolean): void => {
    const allLayers = document.querySelectorAll('g.layer');
    for (let i = 0; i < allLayers.length; i += 1) {
      const g = allLayers[i] as SVGGElement;
      if (isPreviewMode) {
        g.style.pointerEvents = 'none';
      } else {
        g.style.pointerEvents = '';
      }
    }
    this.isPreviewMode = isPreviewMode;
  };

  getTopBarPreviewMode = (response: {
    isPreviewMode: boolean,
  }): void => {
    response.isPreviewMode = this.isPreviewMode;
  };

  setShouldStartPreviewController = (shouldStartPreviewController: boolean): void => {
    this.setState({ shouldStartPreviewController });
  };

  setStartPreviewCallback = (callback: () => void | null): void => {
    if (callback) {
      this.startPreivewCallback = callback;
    } else {
      this.startPreivewCallback = null;
    }
  };

  setCurrentUser = (user: IUser): void => {
    this.setState({ currentUser: user });
  };

  render() {
    const {
      updateTopBar,
      setTopBarPreviewMode,
      setShouldStartPreviewController,
      setStartPreviewCallback,
      startPreivewCallback,
    } = this;
    const {
      fileName,
      selectedElem,
      hasUnsavedChange,
      shouldStartPreviewController,
      currentUser,
    } = this.state;
    const { children } = this.props;
    return (
      <TopBarContext.Provider value={{
        updateTopBar,
        setTopBarPreviewMode,
        setShouldStartPreviewController,
        setStartPreviewCallback,
        startPreivewCallback,
        fileName,
        selectedElem,
        hasUnsavedChange,
        shouldStartPreviewController,
        currentUser,
      }}
      >
        {children}
      </TopBarContext.Provider>
    );
  }
}

export default { TopBarContextProvider, TopBarContext };
