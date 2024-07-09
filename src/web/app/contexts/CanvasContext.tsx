import React, { createContext, useCallback, useEffect, useState } from 'react';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import curveEngravingModeController from 'app/actions/canvas/curveEngravingModeController';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import TutorialConstants from 'app/constants/tutorial-constants';
import useForceUpdate from 'helpers/use-force-update';
import workareaManager from 'app/svgedit/workarea';
import * as TutorialController from 'app/views/tutorials/tutorialController';
import { getSupportInfo } from 'app/constants/add-on';
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

export enum CanvasMode {
  Draw = 1,
  Preview = 2,
  PathPreview = 3,
  CurveEngraving = 4,
}

interface CanvasContextType {
  changeToPreviewMode: () => void;
  currentUser: IUser;
  endPreviewMode: () => void;
  hasUnsavedChange: boolean;
  mode: CanvasMode;
  setMode: (mode: CanvasMode) => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
  setStartPreviewCallback: (callback: () => void | null) => void;
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
  hasPassthroughExtension: boolean;
}

const CanvasContext = createContext<CanvasContextType>({
  changeToPreviewMode: () => {},
  currentUser: null,
  endPreviewMode: () => {},
  hasUnsavedChange: false,
  mode: CanvasMode.Draw,
  setMode: () => {},
  setShouldStartPreviewController: () => {},
  setStartPreviewCallback: () => {},
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
  hasPassthroughExtension: false,
});

const CanvasProvider = (props: React.PropsWithChildren<Record<string, unknown>>): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const [mode, setMode] = useState<CanvasMode>(CanvasMode.Draw);
  const [isColorPreviewing, setIsColorPreviewing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser>(null);
  const [hasUnsavedChange, setHasUnsavedChange] = useState<boolean>(false);
  const [startPreviewCallback, setStartPreviewCallback] = useState<() => void | null>(null);
  const [shouldStartPreviewController, setShouldStartPreviewController] = useState<boolean>(false);
  const [setupPreviewMode, setSetupPreviewMode] = useState<() => void | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<IDeviceInfo | null>(null);
  const [isPathEditing, setIsPathEditing] = useState<boolean>(false);
  const [hasPassthroughExtension, setHasPassthroughExtension] = useState<boolean>(false);

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
      setMode(CanvasMode.Draw);
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
      topBarEventEmitter.removeListener(
        'SET_SHOULD_START_PREVIEW_CONTROLLER',
        setShouldStartPreviewController
      );
      topBarEventEmitter.removeListener('SET_SELECTED_DEVICE', setSelectedDevice);
      topBarEventEmitter.removeListener(
        'SET_START_PREVIEW_CALLBACK',
        setStartPreviewCallbackHandler
      );
    };
  }, []);
  useEffect(() => {
    const handler = (response: { isPreviewMode: boolean }): void => {
      response.isPreviewMode = mode === CanvasMode.Preview;
    };
    topBarEventEmitter.on('GET_TOP_BAR_PREVIEW_MODE', handler);
    return () => {
      topBarEventEmitter.removeListener('GET_TOP_BAR_PREVIEW_MODE', handler);
    };
  }, [mode]);
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
    canvasEventEmitter.on('SET_MODE', setMode);
    const canvasChangeHandler = () =>
      setHasPassthroughExtension(
        beamboxPreference.read('pass-through') && getSupportInfo(workareaManager.model).passThrough
      );
    canvasChangeHandler();
    canvasEventEmitter.on('canvas-change', canvasChangeHandler);
    return () => {
      canvasEventEmitter.removeListener('SET_COLOR_PREVIEWING', setIsColorPreviewing);
      canvasEventEmitter.removeListener('SET_PATH_EDITING', setIsPathEditing);
      canvasEventEmitter.removeListener('SET_MODE', setMode);
      canvasEventEmitter.removeListener('canvas-change', canvasChangeHandler);
    };
  }, []);

  useEffect(() => {
    if (mode !== CanvasMode.CurveEngraving && curveEngravingModeController.started) {
      curveEngravingModeController.end();
    }
    const allLayers = document.querySelectorAll('g.layer');
    for (let i = 0; i < allLayers.length; i += 1) {
      const g = allLayers[i] as SVGGElement;
      if (mode === CanvasMode.Preview) {
        g.style.pointerEvents = 'none';
      } else {
        g.style.pointerEvents = '';
      }
    }
  }, [mode]);

  const changeToPreviewMode = () => {
    svgCanvas.setMode('select');
    workareaEvents.emit('update-context-menu', { menuDisabled: true });
    const workarea = document.getElementById('workarea');
    $('#workarea').contextmenu(() => {
      endPreviewMode();
      return false;
    });
    setMode(CanvasMode.Preview);
    if (workarea) {
      workarea.style.cursor = 'url(img/camera-cursor.svg), cell';
    }
    if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_PREVIEW_MODE) {
      TutorialController.handleNextStep();
    }
  };

  const togglePathPreview = () => {
    setMode(mode === CanvasMode.PathPreview ? CanvasMode.Draw : CanvasMode.PathPreview);
  };

  const { children } = props;
  return (
    <CanvasContext.Provider
      value={{
        changeToPreviewMode,
        currentUser,
        endPreviewMode,
        hasUnsavedChange,
        mode,
        setMode,
        setShouldStartPreviewController,
        setSetupPreviewMode,
        setStartPreviewCallback,
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
        hasPassthroughExtension,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContextType, CanvasContext, CanvasProvider };
