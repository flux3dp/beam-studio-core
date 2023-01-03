import * as React from 'react';

import AboutBeamStudio from 'app/components/dialogs/AboutBeamStudio';
import ColorPickerPanel from 'app/components/beambox/right-panel/ColorPickerPanel';
import ChangeLog from 'app/components/dialogs/ChangeLog';
import ConfirmPrompt from 'app/views/dialogs/ConfirmPrompt';
import DeviceSelector from 'app/views/dialogs/DeviceSelector';
import DialogBox from 'app/widgets/Dialog-Box';
import DocumentSettings from 'app/components/dialogs/DocumentSettings';
import DxfDpiSelector from 'app/views/beambox/DxfDpiSelector';
import FluxIdLogin from 'app/components/dialogs/FluxIdLogin';
import i18n from 'helpers/i18n';
import InputLightBox from 'app/widgets/InputLightbox';
import LayerColorConfigPanel from 'app/views/beambox/Layer-Color-Config';
import MediaTutorial from 'app/components/dialogs/MediaTutorial';
import Modal from 'app/widgets/Modal';
import NetworkTestingPanel from 'app/views/beambox/NetworkTestingPanel';
import NounProjectPanel from 'app/views/beambox/Noun-Project-Panel';
import PhotoEditPanel, { PhotoEditMode } from 'app/views/beambox/Photo-Edit-Panel';
import Prompt from 'app/views/dialogs/Prompt';
import RatingPanel from 'app/components/dialogs/RatingPanel';
import SvgNestButtons from 'app/views/beambox/SvgNestButtons';
import FirmwareUpdate from 'app/components/dialogs/FirmwareUpdate';
import { eventEmitter } from 'app/contexts/DialogContext';
import { getCurrentUser } from 'helpers/api/flux-id';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { IDialogBoxStyle, IInputLightBox, IPrompt } from 'interfaces/IDialog';
import { IMediaTutorial, ITutorial } from 'interfaces/ITutorial';
import Tutorial from 'app/views/tutorials/Tutorial';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const addDialogComponent = (id: string, component: JSX.Element): void => {
  eventEmitter.emit('ADD_DIALOG_COMPONENT', id, component);
};

const clearAllDialogComponents = (): void => {
  eventEmitter.emit('CLEAR_ALL_DIALOG_COMPONENTS');
};

const isIdExist = (id: string): boolean => {
  const response = {
    isIdExist: false,
  };
  eventEmitter.emit('CHECK_ID_EXIST', id, response);
  return response.isIdExist;
};

const popDialogById = (id: string): void => {
  eventEmitter.emit('POP_DIALOG_BY_ID', id);
};

let promptIndex = 0;

const showDeviceSelector = (onSelect) => {
  addDialogComponent('device-selector',
    <DeviceSelector
      onSelect={onSelect}
      onClose={() => popDialogById('device-selector')}
    />);
};

const showLoginDialog = (callback?: () => void, silent = false): void => {
  if (isIdExist('flux-id-login')) return;
  if (window.FLUX.version === 'web' && callback) {
    window.addEventListener('DISMISS_FLUX_LOGIN', callback);
  }
  addDialogComponent('flux-id-login',
    <FluxIdLogin
      silent={silent}
      onClose={() => {
        window.removeEventListener('DISMISS_FLUX_LOGIN', callback);
        popDialogById('flux-id-login');
        if (callback) callback();
      }}
    />);
};

export default {
  addDialogComponent,
  clearAllDialogComponents,
  isIdExist,
  popDialogById,
  selectDevice: (): Promise<IDeviceInfo> => new Promise<IDeviceInfo>((resolve) => {
    showDeviceSelector(resolve);
  }),
  showAboutBeamStudio: (): void => {
    if (isIdExist('about-bs')) return;
    addDialogComponent('about-bs',
      <AboutBeamStudio
        onClose={() => popDialogById('about-bs')}
      />);
  },
  showColorPicker: (
    originalColor: string,
    left: number,
    top: number,
    onNewColor: (color: string) => void,
  ): void => {
    if (isIdExist('color-picker')) return;
    addDialogComponent('color-picker',
      <ColorPickerPanel
        originalColor={originalColor}
        left={left}
        top={top}
        onNewColor={onNewColor}
        onClose={() => popDialogById('color-picker')}
      />);
  },
  showDocumentSettings: (): void => {
    if (isIdExist('docu-setting')) return;
    const unmount = () => popDialogById('docu-setting');
    addDialogComponent('docu-setting',
      <DocumentSettings
        unmount={unmount}
      />);
  },
  showDxfDpiSelector: (defaultValue: number): Promise<number> => new Promise<number>((resolve) => {
    addDialogComponent('dxf-dpi-select',
      <Modal>
        <DxfDpiSelector
          defaultDpiValue={defaultValue}
          onSubmit={(val: number) => {
            popDialogById('dxf-dpi-select');
            resolve(val);
          }}
          onCancel={() => {
            popDialogById('dxf-dpi-select');
            resolve(null);
          }}
        />
      </Modal>);
  }),
  showNetworkTestingPanel: (ip?: string): void => {
    if (isIdExist('network-test')) return;
    addDialogComponent('network-test',
      <NetworkTestingPanel
        ip={ip}
        onClose={() => popDialogById('network-test')}
      />);
  },
  showNounProjectPanel: (): void => {
    if (isIdExist('noun-project')) return;
    addDialogComponent('noun-project',
      <NounProjectPanel
        onClose={() => popDialogById('noun-project')}
      />);
  },
  showPhotoEditPanel: (mode: PhotoEditMode): void => {
    if (isIdExist('photo-edit')) return;
    const selectedElements = svgCanvas.getSelectedElems();
    let len = selectedElements.length;
    for (let i = 0; i < selectedElements.length; i += 1) {
      if (!selectedElements[i]) {
        len = i;
        break;
      }
    }
    if (len > 1) {
      return;
    }
    const element = selectedElements[0];
    const src = element.getAttribute('origImage') || element.getAttribute('xlink:href');
    addDialogComponent('photo-edit',
      <PhotoEditPanel
        mode={mode}
        element={element}
        src={src}
        unmount={() => popDialogById('photo-edit')}
      />);
  },
  showLayerColorConfig: (): void => {
    if (isIdExist('layer-color-config')) return;
    addDialogComponent('layer-color-config',
      <LayerColorConfigPanel
        onClose={() => popDialogById('layer-color-config')}
      />);
  },
  showRatingDialog: (onSubmit: (score: number) => void): void => {
    if (isIdExist('rating-dialog')) return;
    addDialogComponent('rating-dialog',
      <RatingPanel
        onSubmit={onSubmit}
        onClose={() => popDialogById('rating-dialog')}
      />);
  },
  showSvgNestButtons: (): void => {
    if (isIdExist('svg-nest')) return;
    addDialogComponent('svg-nest',
      <SvgNestButtons
        onClose={() => popDialogById('svg-nest')}
      />);
  },
  showTutorial: (tutorial: ITutorial, callback: () => void): void => {
    const { id } = tutorial;
    if (isIdExist(id)) return;
    svgCanvas.clearSelection();
    addDialogComponent(id,
      <Tutorial
        hasNextButton={tutorial.hasNextButton}
        end_alert={tutorial.end_alert}
        dialogStylesAndContents={tutorial.dialogStylesAndContents}
        onClose={() => {
          popDialogById(id);
          callback();
        }}
      />);
  },
  promptDialog: (args: IPrompt): void => {
    const id = `prompt-${promptIndex}`;
    promptIndex = (promptIndex + 1) % 10000;
    addDialogComponent(id,
      <Prompt
        caption={args.caption}
        defaultValue={args.defaultValue}
        onYes={args.onYes}
        onCancel={args.onCancel}
        onClose={() => popDialogById(id)}
      />);
  },
  showConfirmPromptDialog: (
    args: { caption?: string, message?: string, confirmValue?: string },
  ): Promise<boolean> => new Promise((resolve) => {
    const id = `prompt-${promptIndex}`;
    promptIndex = (promptIndex + 1) % 10000;
    addDialogComponent(id,
      <ConfirmPrompt
        caption={args.caption}
        message={args.message}
        confirmValue={args.confirmValue}
        onConfirmed={() => resolve(true)}
        onCancel={() => resolve(false)}
        onClose={() => popDialogById(id)}
      />);
  }),
  showChangLog: (args: { callback?: () => void } = {}): void => {
    if (isIdExist('change-log')) return;
    const { callback } = args;
    addDialogComponent('change-log',
      <ChangeLog
        onClose={() => {
          popDialogById('change-log');
          if (callback) callback();
        }}
      />);
  },
  showInputLightbox: (id: string, args: IInputLightBox): void => {
    addDialogComponent(id,
      <InputLightBox
        isOpen
        caption={args.caption}
        type={args.type || 'TEXT_INPUT'}
        inputHeader={args.inputHeader}
        defaultValue={args.defaultValue}
        confirmText={args.confirmText}
        maxLength={args.maxLength}
        onSubmit={(value) => {
          args.onSubmit(value);
        }}
        onClose={(from: string) => {
          popDialogById(id);
          if (from !== 'submit') args.onCancel();
        }}
      />);
  },
  showLoginDialog,
  forceLoginWrapper: (callback: () => void | Promise<void>): void => {
    let user = getCurrentUser();
    if (!user) {
      showLoginDialog(() => {
        user = getCurrentUser();
        if (user) callback();
      });
    } else {
      callback();
    }
  },
  showDialogBox: (id: string, style: IDialogBoxStyle, content: string): void => {
    if (isIdExist(id)) return;
    console.log(style);
    addDialogComponent(id,
      <DialogBox
        position={style.position}
        arrowDirection={style.arrowDirection}
        arrowWidth={style.arrowWidth}
        arrowHeight={style.arrowHeight}
        arrowPadding={style.arrowPadding}
        arrowColor={style.arrowColor}
        content={content}
        onClose={() => popDialogById(id)}
      />);
  },
  showFirmwareUpdateDialog: (
    device: IDeviceInfo,
    updateInfo: {
      changelog_en: string,
      changelog_zh: string,
      latestVersion: string,
    },
    onDownload: () => void,
    onInstall: () => void,
  ): void => {
    if (isIdExist('update-dialog')) return;
    const { name, model, version } = device;
    const releaseNode = i18n.getActiveLang() === 'zh-tw' ? updateInfo.changelog_zh : updateInfo.changelog_en;
    addDialogComponent('update-dialog',
      <FirmwareUpdate
        deviceName={name}
        deviceModel={model}
        currentVersion={version}
        latestVersion={updateInfo.latestVersion}
        releaseNote={releaseNode}
        onDownload={onDownload}
        onInstall={onInstall}
        onClose={() => popDialogById('update-dialog')}
      />);
  },
  showMediaTutorial: (data: IMediaTutorial[]): Promise<void> => new Promise<void>((resolve) => {
    addDialogComponent('media-tutorial',
      <MediaTutorial
        data={data}
        onClose={() => {
          popDialogById('media-tutorial');
          resolve();
        }}
      />);
  }),
  showLoadingWindow: (): void => {
    const id = 'loading-window';
    if (isIdExist(id)) return;
    addDialogComponent(id,
      <div className="loading-background">
        <div className="spinner-roller absolute-center" />
      </div>);
  },
};
