import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as TutorialController from 'app/views/tutorials/tutorialController';
import TutorialConstants from 'app/constants/tutorial-constants';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import useForceUpdate from 'helpers/use-force-update';
import { getSVGAsync } from 'helpers/svg-editor-helper';
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
  selectedElem: Element | null,
  setDisplayLayer: (displayLayer: boolean) => void;
  setIsPathPreviewing: (displayLayer: boolean) => void;
  setIsPreviewing: (displayLayer: boolean) => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void,
  setStartPreviewCallback: (callback: () => void | null) => void,
  setTopBarPreviewMode: (topBarPreviewMode: boolean) => void,
  shouldStartPreviewController: boolean,
  showCameraPreviewDeviceList: () => void,
  setShowCameraPreviewDeviceList: (callback: () => void | null) => void,
  startPreviewCallback: () => void | null,
  togglePathPreview: () => void,
  updateCanvasContext: () => void,
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
  selectedElem: null,
  setDisplayLayer: () => {},
  setIsPathPreviewing: () => {},
  setIsPreviewing: () => {},
  setShouldStartPreviewController: () => {},
  setStartPreviewCallback: () => {},
  setTopBarPreviewMode: () => {},
  shouldStartPreviewController: false,
  showCameraPreviewDeviceList: () => {},
  setShowCameraPreviewDeviceList: () => {},
  startPreviewCallback: () => {},
  togglePathPreview: () => {},
  updateCanvasContext: () => {},
});

const CanvasProvider = (props: React.PropsWithChildren<Record<string, unknown>>): JSX.Element => {
  const forceUpdate = useForceUpdate();
  const isMobile = useIsMobile();
  const [displayLayer, setDisplayLayer] = useState<boolean>(!isMobile);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isPathPreviewing, setIsPathPreviewing] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser>(null);
  const [fileName, setFileName] = useState<string>(null);
  const [selectedElem, setSelectedElem] = useState<Element>(null);
  const [hasUnsavedChange, setHasUnsavedChange] = useState<boolean>(false);
  const [startPreviewCallback, setStartPreviewCallback] = useState<() => void | null>(null);
  const [shouldStartPreviewController, setShouldStartPreviewController] = useState<boolean>(false);
  const [showCameraPreviewDeviceList, setShowCameraPreviewDeviceList] = useState<() => void | null>(null);

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

  useEffect(() => {
    // Listen to events from TopBarControllers (non-react parts)
    fluxIDEventEmitter.on('update-user', setCurrentUser);
    topBarEventEmitter.on('SET_ELEMENT', setSelectedElem);
    topBarEventEmitter.on('SET_FILE_NAME', setFileName);
    topBarEventEmitter.on('SET_HAS_UNSAVED_CHANGE', setHasUnsavedChange);
    topBarEventEmitter.on('SET_SHOULD_START_PREVIEW_CONTROLLER', setShouldStartPreviewController);
    topBarEventEmitter.on('SET_START_PREVIEW_CALLBACK', setStartPreviewCallback);
    topBarEventEmitter.on('GET_TOP_BAR_PREVIEW_MODE', (response: {
      isPreviewMode: boolean,
    }): void => {
      response.isPreviewMode = isPreviewing;
    });
    window.addEventListener('update-user', (e: CustomEvent) => {
      setCurrentUser(e.detail.user);
    });
    return () => {
      fluxIDEventEmitter.removeListener('update-user', setCurrentUser);
      topBarEventEmitter.removeAllListeners();
    };
  }, [setCurrentUser, isPreviewing]);

  const updateCanvasContext = useCallback(() => {
    console.log('force update');
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
          selectedElem,
          setDisplayLayer,
          setIsPathPreviewing,
          setIsPreviewing,
          setShouldStartPreviewController,
          setShowCameraPreviewDeviceList,
          setStartPreviewCallback,
          setTopBarPreviewMode,
          shouldStartPreviewController,
          showCameraPreviewDeviceList,
          startPreviewCallback,
          togglePathPreview,
          updateCanvasContext,
        }
      }
    >
      {children}
    </CanvasContext.Provider>
  );
};

export { CanvasContextType, CanvasContext, CanvasProvider };
