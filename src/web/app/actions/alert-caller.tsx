import alertConstants from 'app/constants/alert-constants';
import EventEmitterFactory from 'helpers/eventEmitterFactory';
import { IAlert } from 'interfaces/IAlert';

const eventEmitter = EventEmitterFactory.createEventEmitter();
export default {
  popUp: (args: IAlert): void => {
    eventEmitter.emit('AlertProgressContext.popUp', args);
  },
  popUpError: (args: IAlert): void => {
    eventEmitter.emit('AlertProgressContext.popUp', {
      ...args,
      type: alertConstants.SHOW_POPUP_ERROR,
    });
  },
  popById: (id: string): void => {
    eventEmitter.emit('AlertProgressContext.popById', id);
  },
  checkIdExist: (id: string): boolean => {
    const response = {
      idExist: false,
    };
    eventEmitter.emit('AlertProgressContext.checkIdExist', id, response);
    return response.idExist;
  },
};
