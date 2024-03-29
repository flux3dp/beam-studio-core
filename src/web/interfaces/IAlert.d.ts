/* eslint-disable @typescript-eslint/ban-types */
import { IButton } from './IButton';

export interface IAlert {
  id?: string;
  key?: number;
  type?: string;
  message: string | JSX.Element;
  messageIcon?: string;
  caption?: string;
  iconUrl?: string;
  children?: Element;
  buttons?: IButton[];
  buttonType?: string;
  buttonLabels?: string[];
  callbacks?: Function | Function[];
  primaryButtonIndex?: number;
  onYes?: Function;
  onNo?: Function;
  onConfirm?: Function;
  onRetry?: Function;
  onCancel?: Function;
  checkbox?: {
    text: string;
    callbacks: Function | Function[];
  };
  isProgress?: false;
}
