import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { IMessage } from 'interfaces/IMessage';

export enum MessageLevel {
  OPEN,
  SUCCESS,
  ERROR,
  INFO,
  WARNING,
  LOADING,
}

const eventEmitter = eventEmitterFactory.createEventEmitter('alert-progress');
const MessageCaller = {
  openMessage: (args: IMessage): Promise<void> => new Promise((resolve) => {
    eventEmitter.emit('OPEN_MESSAGE', {
      ...args,
    }, resolve);
  }),
  popById: (id: string): void => {
    eventEmitter.emit('POP_BY_ID', id);
  },
  checkIdExist: (id: string): boolean => {
    const response = {
      result: false,
    };
    eventEmitter.emit('CHECK_PROGRESS_EXIST', id, response);
    return response.result;
  },
};

export default MessageCaller;
