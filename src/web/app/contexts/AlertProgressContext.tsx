import React, { createContext } from 'react';

import AlertConstants from 'app/constants/alert-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import ProgressConstants from 'app/constants/progress-constants';
import { IAlert } from 'interfaces/IAlert';
import { IProgressDialog } from 'interfaces/IProgress';

const LANG = i18n.lang.alert;
let progressID = 0;

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

export const eventEmitter = eventEmitterFactory.createEventEmitter();

interface State {
  alertProgressStack: (IAlert | IProgressDialog)[],
}

export class AlertProgressContextProvider extends React.Component<unknown, State> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      alertProgressStack: [],
    };

    eventEmitter.on('OPEN_PROGRESS', this.openProgress.bind(this));
    eventEmitter.on('POP_LAST_PROGRESS', this.popLastProgress.bind(this));
    eventEmitter.on('UPDATE_PROGRESS', this.updateProgress.bind(this));
    eventEmitter.on('POP_BY_ID', this.popById.bind(this));
    eventEmitter.on('POP_UP', this.popUp.bind(this));
    eventEmitter.on('CHECK_ID_EXIST', this.checkIdExist.bind(this));
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

  pushToStack = (item: (IAlert | IProgressDialog)): void => {
    if (item.id) {
      // eslint-disable-next-line no-console
      console.log('alert/progress poped', item.id);
    }
    const { alertProgressStack } = this.state;
    alertProgressStack.push(item);
    this.forceUpdate();
  };

  openProgress = (args: IProgressDialog): void => {
    const { type } = args;
    let { id, message, caption } = args;
    if (!id) {
      id = `progress_${progressID}`;
      progressID = (progressID + 1) % 100000;
    }
    message = message || '';
    caption = caption || '';

    this.pushToStack({
      ...args,
      id,
      type,
      caption,
      message,
      isProgress: true,
    });
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

  popUp = (args: IAlert): void => {
    const { type } = args;
    let { message, caption } = args;
    message = message || '';
    switch (type) {
      case AlertConstants.SHOW_POPUP_INFO:
        caption = caption || LANG.info;
        break;
      case AlertConstants.SHOW_POPUP_WARNING:
        caption = caption || LANG.warning;
        break;
      case AlertConstants.SHOW_POPUP_ERROR:
        caption = caption || LANG.error;
        break;
      default:
        break;
    }
    const { buttons, checkbox } = this.buttonsGenerator(args);
    const checkboxText = checkbox ? checkbox.text : null;
    const checkboxCallbacks = checkbox ? checkbox.callbacks : null;

    this.pushToStack({
      ...args,
      caption,
      message,
      buttons,
      checkboxText,
      checkboxCallbacks,
    });
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
    } = args;
    let {
      buttonLabels,
      callbacks,
      primaryButtonIndex,
      onYes,
      onNo,
      onConfirm,
      onRetry,
      onCancel,
    } = args;
    switch (buttonType) {
      case AlertConstants.YES_NO:
        onYes = onYes || (() => { });
        onNo = onNo || (() => { });
        buttonLabels = [LANG.yes, LANG.no];
        callbacks = [onYes, onNo];
        primaryButtonIndex = primaryButtonIndex || 0;
        if (checkbox) {
          const onCheckedYes = checkbox.onYes ? checkbox.onYes : () => { };
          const onCheckedNo = checkbox.onNo ? checkbox.onNo : () => { };
          checkbox.callbacks = [onCheckedYes, onCheckedNo];
        }
        break;
      case AlertConstants.YES_NO_CUSTOM:
        onYes = onYes || (() => { });
        onNo = onNo || (() => { });
        primaryButtonIndex = primaryButtonIndex || 0;
        if (!buttonLabels) {
          buttonLabels = [LANG.yes, LANG.no];
          callbacks = [onYes, onNo];
          if (checkbox) {
            const onCheckedYes = checkbox.onYes ? checkbox.onYes : () => { };
            const onCheckedNo = checkbox.onNo ? checkbox.onNo : () => { };
            checkbox.callbacks = [onCheckedYes, onCheckedNo];
          }
        } else if (typeof buttonLabels === 'string') {
          buttonLabels = [LANG.yes, LANG.no, buttonLabels];
          callbacks = callbacks || (() => { });
          callbacks = [onYes, onNo, (callbacks as () => void)];
        } else {
          buttonLabels = [LANG.yes, LANG.no, ...buttonLabels];
          callbacks = [onYes, onNo, ...(callbacks as (() => void)[])];
        }
        break;
      case AlertConstants.CONFIRM_CANCEL:
        onConfirm = onConfirm || (() => { });
        onCancel = onCancel || (() => { });
        buttonLabels = [LANG.confirm, LANG.cancel];
        primaryButtonIndex = primaryButtonIndex || 0;
        callbacks = [onConfirm, onCancel];
        if (checkbox) {
          const onCheckedConfirm = checkbox.onConfirm ? checkbox.onConfirm : () => { };
          const onCheckedCancel = checkbox.onCancel ? checkbox.onCancel : () => { };
          checkbox.callbacks = [onCheckedConfirm, onCheckedCancel];
        }
        break;
      case AlertConstants.RETRY_CANCEL:
        onRetry = onRetry || (() => { });
        onCancel = onCancel || (() => { });
        buttonLabels = [LANG.retry, LANG.cancel];
        primaryButtonIndex = primaryButtonIndex || 0;
        callbacks = [onRetry, onCancel];
        if (checkbox) {
          const onCheckedRetry = checkbox.onRetry ? checkbox.onRetry : () => { };
          const onCheckedCancel = checkbox.onCancel ? checkbox.onCancel : () => { };
          checkbox.callbacks = [onCheckedRetry, onCheckedCancel];
        }
        break;
      case AlertConstants.CUSTOM_CANCEL:
        onCancel = onCancel || (() => { });
        primaryButtonIndex = primaryButtonIndex || 0;
        if (!buttonLabels) {
          buttonLabels = [LANG.cancel];
          callbacks = [onCancel];
          if (checkbox) {
            const onCheckedCancel = checkbox.onCancel ? checkbox.onCancel : () => { };
            checkbox.callbacks = [onCheckedCancel];
          }
        } else if (typeof buttonLabels === 'string') {
          buttonLabels = [buttonLabels, LANG.cancel];
          callbacks = callbacks || (() => { });
          callbacks = [callbacks as () => void, onCancel];
        } else {
          buttonLabels = [...buttonLabels, LANG.cancel];
          callbacks = [...(callbacks as (() => void)[]), onCancel];
        }
        break;
      default:
        if (!buttonLabels) {
          buttonLabels = [LANG.ok];
          callbacks = callbacks || (() => { });
          if (checkbox) {
            if (!checkbox.callbacks) {
              checkbox.callbacks = [() => { }];
            } else if (typeof checkbox.callbacks === 'function') {
              checkbox.callbacks = [checkbox.callbacks];
            }
          }
        } else if (typeof buttonLabels === 'string') {
          buttonLabels = [buttonLabels];
          callbacks = callbacks || (() => { });
          if (checkbox) {
            if (!checkbox.callbacks) {
              checkbox.callbacks = [() => { }];
            } else if (typeof checkbox.callbacks === 'function') {
              checkbox.callbacks = [checkbox.callbacks];
            }
          }
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
      } else if (!callbacks) {
        b.onClick = () => { };
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
