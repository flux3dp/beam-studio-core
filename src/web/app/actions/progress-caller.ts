import EventEmitterFactory from 'helpers/eventEmitterFactory';
import ProgressConstants from 'app/constants/progress-constants';
import { IProgressDialog } from 'interfaces/IProgress';

const eventEmitter = EventEmitterFactory.createEventEmitter();
export default {
  openNonstopProgress: (args: IProgressDialog): void => {
    if (!args.caption && args.message) {
      // eslint-disable-next-line no-param-reassign
      args.caption = args.message;
    }
    eventEmitter.emit('AlertProgressContext.openProgress', {
      ...args,
      isProgress: true,
      type: ProgressConstants.NONSTOP,
    });
  },
  openSteppingProgress: (args: IProgressDialog): void => {
    eventEmitter.emit('AlertProgressContext.openProgress', {
      ...args,
      isProgress: true,
      type: ProgressConstants.STEPPING,
      percentage: args.percentage || 0,
    });
  },
  popById: (id: string): void => {
    eventEmitter.emit('AlertProgressContext.popById', id);
  },
  popLastProgress: (): void => {
    eventEmitter.emit('AlertProgressContext.popLastProgress');
  },
  update: (id: string, args: IProgressDialog): void => {
    eventEmitter.emit('AlertProgressContext.updateProgress', id, args);
  },
};
