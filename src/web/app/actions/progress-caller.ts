import ProgressConstants from 'app/constants/progress-constants';
import { eventEmitter } from 'app/contexts/AlertProgressContext';
import { IProgressDialog } from 'interfaces/IProgress';

export default {
  openNonstopProgress: (args: IProgressDialog): void => {
    if (!args.caption && args.message) {
      // eslint-disable-next-line no-param-reassign
      args.caption = args.message;
    }
    eventEmitter.emit('OPEN_PROGRESS', {
      ...args,
      isProgress: true,
      type: ProgressConstants.NONSTOP,
    });
  },
  openSteppingProgress: (args: IProgressDialog): void => {
    eventEmitter.emit('OPEN_PROGRESS', {
      ...args,
      isProgress: true,
      type: ProgressConstants.STEPPING,
      percentage: args.percentage || 0,
    });
  },
  popById: (id: string): void => {
    eventEmitter.emit('POP_BY_ID', id);
  },
  popLastProgress: (): void => {
    eventEmitter.emit('POP_LAST_PROGRESS');
  },
  update: (id: string, args: IProgressDialog): void => {
    eventEmitter.emit('UPDATE_PROGRESS', id, args);
  },
};
