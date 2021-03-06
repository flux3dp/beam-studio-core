import React, { createContext } from 'react';

import AlertConstants from 'app/constants/alert-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import ProgressConstants from 'app/constants/progress-constants';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

const LANG = i18n.lang.alert;

interface IAlertProgressContext {
  alertProgressStack: (IAlert | IProgressDialog)[];
  popFromStack: () => void;
  popById: (id: string) => void;
}

export const AlertProgressContext = createContext<IAlertProgressContext>({
  alertProgressStack: [],
  popFromStack: () => {},
  popById: () => {},
});

const eventEmitter = eventEmitterFactory.createEventEmitter('alert-progress');

interface State {
  alertProgressStack: (IAlert | IProgressDialog)[],
}

export class AlertProgressContextProvider extends React.Component<unknown, State> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      alertProgressStack: [],
    };
  }

  componentDidMount() {
    eventEmitter.on('OPEN_PROGRESS', this.openProgress.bind(this));
    eventEmitter.on('POP_LAST_PROGRESS', this.popLastProgress.bind(this));
    eventEmitter.on('UPDATE_PROGRESS', this.updateProgress.bind(this));
    eventEmitter.on('POP_BY_ID', this.popById.bind(this));
    eventEmitter.on('POP_UP', this.popUp.bind(this));
    eventEmitter.on('CHECK_ID_EXIST', this.checkIdExist.bind(this));
    eventEmitter.on('CHECK_PROGRESS_EXIST', this.checkProgressExist.bind(this));
  }

  componentWillUnmount() {
    eventEmitter.removeAllListeners();
  }

  popFromStack = (): void => {
    const { alertProgressStack } = this.state;
    alertProgressStack.pop();
    this.forceUpdate();
  };

  popById = (id: string): void => {
    const { alertProgressStack } = this.state;
    this.setState({
      alertProgressStack: alertProgressStack.filter((item) => item.id !== id),
    });
  };

  checkIdExist = (id: string, response: {
    idExist: boolean,
  }): void => {
    const { alertProgressStack } = this.state;
    const res = alertProgressStack.filter((item) => {
      const { id: itemId } = item;
      return itemId === id && !('isProgress' in item);
    });
    response.idExist = res.length > 0;
  };

  checkProgressExist = (id: string, response: {
    result: boolean;
  }): void => {
    const { alertProgressStack } = this.state;
    const res = alertProgressStack.filter((item) => {
      const { id: itemId, isProgress } = item;
      return itemId === id && isProgress;
    });
    response.result = res.length > 0;
  };

  pushToStack = (item: (IAlert | IProgressDialog), callback = () => {}): void => {
    if (item.id) {
      // eslint-disable-next-line no-console
      console.log('alert/progress poped', item.id);
    }
    const { alertProgressStack } = this.state;
    this.setState({
      alertProgressStack: [...alertProgressStack, item],
    }, callback);
  };

  openProgress = (args: IProgressDialog, callback = () => { }): void => {
    const {
      id, caption, message, type,
    } = args;

    this.pushToStack({
      ...args,
      id,
      type,
      caption: caption || '',
      message: message || '',
      isProgress: true,
    }, callback);
  };

  popLastProgress = (): void => {
    const { alertProgressStack } = this.state;
    let i;
    for (i = alertProgressStack.length - 1; i >= 0; i -= 1) {
      if ('isProgress' in alertProgressStack[i]) {
        break;
      }
    }
    if (i >= 0) {
      alertProgressStack.splice(i, 1);
      this.setState({ alertProgressStack });
    }
  };

  updateProgress = (id: string, args: IProgressDialog): void => {
    const { alertProgressStack } = this.state;
    const targetObjects = alertProgressStack.filter((item) => {
      const { id: itemId } = item;
      return 'isProgress' in item && itemId === id;
    });
    if (targetObjects.length === 0) {
      return;
    }
    const targetObject = targetObjects[targetObjects.length - 1];
    if (targetObject.type === ProgressConstants.NONSTOP && !args.caption && args.message) {
      // eslint-disable-next-line no-param-reassign
      args.caption = args.message;
    }
    Object.assign(targetObject, args);
    this.setState({ alertProgressStack });
  };

  popUp = (args: IAlert, callback = () => {}): void => {
    const { message, type } = args;
    let { caption } = args;
    switch (type) {
      case AlertConstants.SHOW_POPUP_INFO:
        caption = caption || LANG.info;
        break;
      case AlertConstants.SHOW_POPUP_WARNING:
        caption = LANG.warning;
        break;
      case AlertConstants.SHOW_POPUP_ERROR:
        caption = caption || LANG.error;
        break;
      default:
        break;
    }
    const { buttons, checkbox } = this.buttonsGenerator(args);

    this.pushToStack({
      ...args,
      caption,
      message,
      buttons,
      checkboxText: checkbox ? checkbox.text : null,
      checkboxCallbacks: checkbox ? checkbox.callbacks : null,
    }, callback);
  };

  buttonsGenerator = (args: IAlert): { buttons, checkbox } => {
    const { checkbox } = args;
    let { buttons } = args;
    if (buttons) {
      return { buttons, checkbox };
    }
    const {
      id,
      buttonType,
      onYes,
      onConfirm,
      onRetry,
    } = args;
    let {
      buttonLabels,
      callbacks,
      primaryButtonIndex,
      onNo,
      onCancel,
    } = args;
    switch (buttonType) {
      case AlertConstants.YES_NO:
        onNo = onNo || (() => { });
        buttonLabels = [LANG.yes, LANG.no];
        callbacks = [onYes, onNo];
        primaryButtonIndex = primaryButtonIndex || 0;
        break;
      case AlertConstants.CONFIRM_CANCEL:
        onCancel = onCancel || (() => { });
        buttonLabels = [LANG.confirm, LANG.cancel];
        primaryButtonIndex = primaryButtonIndex || 0;
        callbacks = [onConfirm, onCancel];
        break;
      case AlertConstants.RETRY_CANCEL:
        onCancel = onCancel || (() => { });
        buttonLabels = [LANG.retry, LANG.cancel];
        primaryButtonIndex = primaryButtonIndex || 0;
        callbacks = [onRetry, onCancel];
        break;
      case AlertConstants.CUSTOM_CANCEL:
        onCancel = onCancel || (() => { });
        primaryButtonIndex = primaryButtonIndex || 0;
        buttonLabels = [...buttonLabels, LANG.cancel];
        callbacks = [callbacks as () => void, onCancel];
        break;
      default:
        if (!buttonLabels) {
          buttonLabels = [LANG.ok];
          callbacks = callbacks || (() => { });
        }
        break;
    }
    buttons = buttonLabels.map((label, i) => {
      const b = {
        label,
        className: (buttonLabels.length === 1 || i === primaryButtonIndex || primaryButtonIndex === undefined) ? 'btn-default primary' : 'btn-default',
        onClick: () => { },
      };
      if (callbacks && typeof callbacks === 'function') {
        b.onClick = () => {
          (callbacks as (id: string) => void)(id);
        };
      } else if (callbacks && callbacks.length > i) {
        b.onClick = () => {
          callbacks[i](id);
        };
      }
      return b;
    });

    return { buttons, checkbox };
  };

  render(): JSX.Element {
    const { children } = this.props;
    const { alertProgressStack } = this.state;
    return (
      <AlertProgressContext.Provider value={
          {
            alertProgressStack,
            popFromStack: this.popFromStack,
            popById: this.popById,
          }
        }
      >
        {children}
      </AlertProgressContext.Provider>
    );
  }
}
