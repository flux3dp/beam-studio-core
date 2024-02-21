import React, { createContext, useCallback, useEffect, useState } from 'react';
import ReactDomServer from 'react-dom/server';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import TutorialConstants from 'app/constants/tutorial-constants';
import FileName from 'app/components/beambox/top-bar/FileName';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import useForceUpdate from 'helpers/use-force-update';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { IUser } from 'interfaces/IUser';
import { useIsMobile } from 'helpers/system-helper';

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');
const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
const fluxIDEventEmitter = eventEmitterFactory.createEventEmitter('flux-id');
const workareaEventEmitter = eventEmitterFactory.createEventEmitter('workarea');

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const workareaEvents = eventEmitterFactory.createEventEmitter('workarea');

interface CanvasContextType {
  changeToPreviewMode: () => void,
  currentUser: IUser,
  displayLayer: boolean;
  endPreviewMode: () => void;
  fileName: string | null,
  hasUnsavedChange: boolean,
  isPathPreviewing: boolean,
  isPreviewing: boolean,
  setDisplayLayer: (displayLayer: boolean) => void;
  setIsPathPreviewing: (displayLayer: boolean) => void;
  setIsPreviewing: (displayLayer: boolean) => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void,
  setStartPreviewCallback: (callback: () => void | null) => void,
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void,
  shouldStartPreviewController: boolean,
  setupPreviewMode: () => void,
  setSetupPreviewMode: (callback: () => void | null) => void,
  startPreviewCallback: () => void | null,
  togglePathPreview: () => void,
  updateCanvasContext: () => void,
  selectedDevice: IDeviceInfo | null,
  setSelectedDevice: (IDeviceInfo) => void,
  updateTopBar: () => void,
}

const CanvasContext = createContext<CanvasContextType>({
  changeToPreviewMode: () => {},
  currentUser: null,
  displayLayer: false,
  endPreviewMode: () => {},
  fileName: null,
  hasUnsavedChange: false,
  isPathPreviewing: false,
  isPreviewing: false,
  setDisplayLayer: () => {},
  setIsPathPreviewing: () => {},
  setIsPreviewing: () => {},
  setShouldStartPreviewController: () => {},
  setStartPreviewCallback: () => {},
  setTopBarPreviewMode: () => {},
  shouldStartPreviewController: false,
  setupPreviewMode: () => {},
  setSetupPreviewMode: () => {},
  startPreviewCallback: () => {},
  togglePathPreview: () => {},
  updateCanvasContext: () => {},
  selectedDevice: null,
  setSelectedDevice: () => {},
  updateTopBar: () => {},
});

const CanvasProvider = (props: React.PropsWithChildren<Record<string, unknown>>): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const isMobile = useIsMobile();
  const [displayLayer, setDisplayLayer] = useState<boolean>(!isMobile);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isPathPreviewing, setIsPathPreviewing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser>(null);
  const [fileName, setFileName] = useState<string>(null);
  const [hasUnsavedChange, setHasUnsavedChange] = useState<boolean>(false);
  const [startPreviewCallback, setStartPreviewCallback] = useState<() => void | null>(null);
  const [shouldStartPreviewController, setShouldStartPreviewController] = useState<boolean>(false);
  const [setupPreviewMode, setSetupPreviewMode] = useState<() => void | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<IDeviceInfo | null>(null);

  const setTopBarPreviewMode = (preview: boolean): void => {
    const allLayers = document.querySelectorAll('g.layer');
    for (let i = 0; i < allLayers.length; i += 1) {
      const g = allLayers[i] as SVGGElement;
      if (preview) {
        g.style.pointerEvents = 'none';
      } else {
        g.style.pointerEvents = '';
      }
    }
    setIsPreviewing(preview);
  };

  const endPreviewMode = (): void => {
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
      workareaEventEmitter.emit('update-context-menu', { menuDisabled: false });
      setTopBarPreviewMode(false);
      setIsPreviewing(false);
    }
  };

  const updateTopBar = useCallback((): void => {
    console.log('Force update?');
    forceUpdate();
  }, [forceUpdate]);

  const setUser = useCallback((user) => setCurrentUser({ ...user }), []);

  const setTitle = (newFileName: string) => {
    setFileName(newFileName);
    if (window.os === 'Windows' && window.titlebar) {
      const title = ReactDomServer.renderToStaticMarkup(
        <FileName fileName={newFileName} hasUnsavedChange={false} isTitle />
      );
      window.titlebar._title.innerHtml = title;
    }
  };

  useEffect(() => {
    // Listen to events from TopBarControllers (non-react parts)
    fluxIDEventEmitter.on('update-user', setUser);
    topBarEventEmitter.on('UPDATE_TOP_BAR', updateTopBar); // This force rerender the context
    topBarEventEmitter.on('SET_FILE_NAME', setTitle);
    topBarEventEmitter.on('SET_HAS_UNSAVED_CHANGE', setHasUnsavedChange);
    topBarEventEmitter.on('SET_SHOULD_START_PREVIEW_CONTROLLER', setShouldStartPreviewController);
    topBarEventEmitter.on('SET_START_PREVIEW_CALLBACK', (callback) => {
      // wrap callback with a function to prevent calling it immediately
      setStartPreviewCallback(() => callback);
    });
    topBarEventEmitter.on('GET_TOP_BAR_PREVIEW_MODE', (response: {
      isPreviewMode: boolean,
    }): void => {
      response.isPreviewMode = isPreviewing;
    });
    topBarEventEmitter.on(
      'GET_SELECTED_DEVICE',
      (response: { selectedDevice: IDeviceInfo | null }): void => {
        response.selectedDevice = selectedDevice;
      }
    );
    topBarEventEmitter.on('SET_SELECTED_DEVICE', setSelectedDevice);
    window.addEventListener('update-user', (e: CustomEvent) => {
      setUser(e.detail.user);
    });
    return () => {
      fluxIDEventEmitter.removeListener('update-user', setUser);
      topBarEventEmitter.removeAllListeners();
    };
  }, [setUser, isPreviewing, selectedDevice, updateTopBar]);

  const updateCanvasContext = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    canvasEventEmitter.on('UPDATE_CONTEXT', updateCanvasContext); // This force rerender the context
    return () => {
      canvasEventEmitter.removeListener('UPDATE_CONTEXT', updateCanvasContext);
    };
  }, [updateCanvasContext]);

  const changeToPreviewMode = () => {
    svgCanvas.setMode('select');
    workareaEvents.emit('update-context-menu', { menuDisabled: true });
    $('#workarea').contextmenu(() => {
      endPreviewMode();
      return false;
    });
    setTopBarPreviewMode(true);
    const workarea = document.getElementById('workarea');
    if (workarea) {
      $(workarea).css('cursor', 'url(img/camera-cursor.svg), cell');
    }
    setIsPreviewing(true);
    if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_PREVIEW_MODE) {
      TutorialController.handleNextStep();
    }
  };

  const togglePathPreview = () => { setIsPathPreviewing(!isPathPreviewing); };

  const { children } = props;
  return (
    <CanvasContext.Provider
      value={
        {
          changeToPreviewMode,
          currentUser,
          displayLayer,
          endPreviewMode,
          fileName,
          hasUnsavedChange,
          isPathPreviewing,
          isPreviewing,
          setDisplayLayer,
          setIsPathPreviewing,
          setIsPreviewing,
          setShouldStartPreviewController,
          setSetupPreviewMode,
          setStartPreviewCallback,
          setTopBarPreviewMode,
          shouldStartPreviewController,
          setupPreviewMode,
          startPreviewCallback,
          togglePathPreview,
          updateCanvasContext,
          selectedDevice,
          setSelectedDevice,
          updateTopBar,
        }
      }
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContextType, CanvasContext, CanvasProvider };
