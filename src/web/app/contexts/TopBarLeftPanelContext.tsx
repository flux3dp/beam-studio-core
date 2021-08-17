import * as React from 'react';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import TutorialConstants from 'app/constants/tutorial-constants';
import { IUser } from 'interfaces/IUser';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

export const TopBarLeftPanelContext = React.createContext({});
const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
const fluxIDEventEmitter = eventEmitterFactory.createEventEmitter('flux-id');

export interface TopBarLeftPanelContextInterface {
  updateTopBar: () => void,
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void,
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void,
  setStartPreviewCallback: (callback: () => void | null) => void,
  startPreviewCallback: () => void | null,
  setIsPreviewing: () => void;
  endPreviewMode: () => void;
  currentUser: IUser,
  fileName: string | null,
  selectedElem: Element | null,
  hasUnsavedChange: boolean,
  shouldStartPreviewController: boolean,
  isPreviewing: boolean;
}

interface State {
  fileName: string | null;
  selectedElem: Element | null;
  hasUnsavedChange: boolean;
  shouldStartPreviewController: boolean;
  currentUser?: IUser;
  isPreviewing: boolean;
}

export class TopBarLeftPanelContextProvider extends React.Component<any, State> {
  private isPreviewMode: boolean;

  private startPreviewCallback: () => void | null;

  constructor(props) {
    super(props);
    this.state = {
      fileName: null,
      selectedElem: null,
      hasUnsavedChange: false,
      shouldStartPreviewController: false,
      currentUser: null,
      isPreviewing: false,
    };
    this.startPreviewCallback = null;
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
      this.startPreviewCallback = callback;
    } else {
      this.startPreviewCallback = null;
    }
  };

  setCurrentUser = (user: IUser): void => {
    this.setState({ currentUser: user });
  };

  setIsPreviewing = (isPreviewing: boolean): void => {
    this.setState({ isPreviewing });
  };

  endPreviewMode = (): void => {
    const { setTopBarPreviewMode, setIsPreviewing } = this;
    try {
      if (PreviewModeController.isPreviewMode()) {
        PreviewModeController.end();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_EDIT_MODE) {
        TutorialController.handleNextStep();
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      FnWrapper.useSelectTool();
      $('#workarea').off('contextmenu');
      svgEditor.setWorkAreaContextMenu();
      setTopBarPreviewMode(false);
      setIsPreviewing(false);
    }
  };

  render() {
    const {
      updateTopBar,
      setTopBarPreviewMode,
      setShouldStartPreviewController,
      setStartPreviewCallback,
      startPreviewCallback,
      setIsPreviewing,
      endPreviewMode,
    } = this;
    const {
      fileName,
      selectedElem,
      hasUnsavedChange,
      shouldStartPreviewController,
      currentUser,
      isPreviewing,
    } = this.state;
    const { children } = this.props;
    return (
      <TopBarLeftPanelContext.Provider value={{
        updateTopBar,
        setTopBarPreviewMode,
        setShouldStartPreviewController,
        setStartPreviewCallback,
        startPreviewCallback,
        setIsPreviewing,
        endPreviewMode,
        fileName,
        selectedElem,
        hasUnsavedChange,
        shouldStartPreviewController,
        currentUser,
        isPreviewing,
      }}
      >
        {children}
      </TopBarLeftPanelContext.Provider>
    );
  }
}

export default { TopBarLeftPanelContextProvider, TopBarLeftPanelContext };
