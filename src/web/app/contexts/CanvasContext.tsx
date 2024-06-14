import React, { createContext, useCallback, useEffect, useState } from 'react';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import TutorialConstants from 'app/constants/tutorial-constants';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import useForceUpdate from 'helpers/use-force-update';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { IUser } from 'interfaces/IUser';

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
  changeToPreviewMode: () => void;
  currentUser: IUser;
  endPreviewMode: () => void;
  hasUnsavedChange: boolean;
  isPathPreviewing: boolean;
  isPreviewing: boolean;
  setIsPathPreviewing: (displayLayer: boolean) => void;
  setIsPreviewing: (displayLayer: boolean) => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
  setStartPreviewCallback: (callback: () => void | null) => void;
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void;
  shouldStartPreviewController: boolean;
  setupPreviewMode: () => void;
  setSetupPreviewMode: (callback: () => void | null) => void;
  startPreviewCallback: () => void | null;
  togglePathPreview: () => void;
  updateCanvasContext: () => void;
  selectedDevice: IDeviceInfo | null;
  setSelectedDevice: (IDeviceInfo) => void;
  isColorPreviewing: boolean;
  setIsColorPreviewing: (isColorPreviewing: boolean) => void;
  isPathEditing: boolean;
  setIsPathEditing: (isPathEditing: boolean) => void;
}

const CanvasContext = createContext<CanvasContextType>({
  changeToPreviewMode: () => {},
  currentUser: null,
  endPreviewMode: () => {},
  hasUnsavedChange: false,
  isPathPreviewing: false,
  isPreviewing: false,
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
  isColorPreviewing: false,
  setIsColorPreviewing: () => {},
  isPathEditing: false,
  setIsPathEditing: () => {},
});

const CanvasProvider = (props: React.PropsWithChildren<Record<string, unknown>>): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isPathPreviewing, setIsPathPreviewing] = useState<boolean>(false);
  const [isColorPreviewing, setIsColorPreviewing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser>(null);
  const [hasUnsavedChange, setHasUnsavedChange] = useState<boolean>(false);
  const [startPreviewCallback, setStartPreviewCallback] = useState<() => void | null>(null);
  const [shouldStartPreviewController, setShouldStartPreviewController] = useState<boolean>(false);
  const [setupPreviewMode, setSetupPreviewMode] = useState<() => void | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<IDeviceInfo | null>(null);
  const [isPathEditing, setIsPathEditing] = useState<boolean>(false);

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

  const setUser = useCallback((user) => setCurrentUser({ ...user }), []);
  useEffect(() => {
    fluxIDEventEmitter.on('update-user', setUser);
    const handler = (e: CustomEvent) => {
      setUser(e.detail.user);
    };
    window.addEventListener('update-user', handler);
    return () => {
      fluxIDEventEmitter.removeListener('update-user', setUser);
      window.removeEventListener('update-user', handler);
    };
  }, [setUser]);
  useEffect(() => {
    topBarEventEmitter.on('SET_HAS_UNSAVED_CHANGE', setHasUnsavedChange);
    topBarEventEmitter.on('SET_SHOULD_START_PREVIEW_CONTROLLER', setShouldStartPreviewController);
    topBarEventEmitter.on('SET_SELECTED_DEVICE', setSelectedDevice);
    const setStartPreviewCallbackHandler = (callback) => {
      // wrap callback with a function to prevent calling it immediately
      setStartPreviewCallback(() => callback);
    };
    topBarEventEmitter.on('SET_START_PREVIEW_CALLBACK', setStartPreviewCallbackHandler);
    return () => {
      topBarEventEmitter.removeListener('SET_HAS_UNSAVED_CHANGE', setHasUnsavedChange);
      topBarEventEmitter.removeListener('SET_SHOULD_START_PREVIEW_CONTROLLER', setShouldStartPreviewController);
      topBarEventEmitter.removeListener('SET_SELECTED_DEVICE', setSelectedDevice);
      topBarEventEmitter.removeListener('SET_START_PREVIEW_CALLBACK', setStartPreviewCallbackHandler);
    };
  }, []);
  useEffect(() => {
    const handler = (response: { isPreviewMode: boolean }): void => {
      response.isPreviewMode = isPreviewing;
    };
    topBarEventEmitter.on('GET_TOP_BAR_PREVIEW_MODE', handler);
    return () => {
      topBarEventEmitter.removeListener('GET_TOP_BAR_PREVIEW_MODE', handler);
    };
  }, [isPreviewing]);
  useEffect(() => {
    const handler = (response: { selectedDevice: IDeviceInfo | null }): void => {
      response.selectedDevice = selectedDevice;
    };
    topBarEventEmitter.on('GET_SELECTED_DEVICE', handler);
    return () => {
      topBarEventEmitter.removeListener('GET_SELECTED_DEVICE', handler);
    };
  }, [selectedDevice]);

  const updateCanvasContext = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    canvasEventEmitter.on('UPDATE_CONTEXT', updateCanvasContext); // This force rerender the context
    return () => {
      canvasEventEmitter.removeListener('UPDATE_CONTEXT', updateCanvasContext);
    };
  }, [updateCanvasContext]);

  useEffect(() => {
    canvasEventEmitter.on('SET_COLOR_PREVIEWING', setIsColorPreviewing);
    canvasEventEmitter.on('SET_PATH_EDITING', setIsPathEditing);
    return () => {
      canvasEventEmitter.removeListener('SET_COLOR_PREVIEWING', setIsColorPreviewing);
      canvasEventEmitter.removeListener('SET_PATH_EDITING', setIsPathEditing);
    };
  }, []);

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

  const togglePathPreview = () => {
    setIsPathPreviewing(!isPathPreviewing);
  };

  const { children } = props;
  return (
    <CanvasContext.Provider
      value={{
        changeToPreviewMode,
        currentUser,
        endPreviewMode,
        hasUnsavedChange,
        isPathPreviewing,
        isPreviewing,
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
        isColorPreviewing,
        setIsColorPreviewing,
        isPathEditing,
        setIsPathEditing,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContextType, CanvasContext, CanvasProvider };
