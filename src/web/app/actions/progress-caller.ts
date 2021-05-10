import ProgressConstants from 'app/constants/progress-constants';
import { AlertsAndProgressContextHelper } from 'app/views/dialogs/Alerts-And-Progress';
import { IProgressDialog } from 'interfaces/IProgress';

export default {
    openNonstopProgress: (args: IProgressDialog) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            args.type = ProgressConstants.NONSTOP;
            if (!args.caption && args.message) {
                args.caption = args.message;
            }
            AlertsAndProgressContextHelper.context.openProgress(args);
        }
    },
    openSteppingProgress: (args: IProgressDialog) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            args.type = ProgressConstants.STEPPING;
            args.percentage = args.percentage || 0;
            AlertsAndProgressContextHelper.context.openProgress(args);
        }
    },
    popById: (id) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            AlertsAndProgressContextHelper.context.popById(id);
        }
    },
    popLastProgress: () => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            AlertsAndProgressContextHelper.context.popLastProgress();
        }
    },
    update: (id, args) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            AlertsAndProgressContextHelper.context.updateProgress(id, args);
        }
    }
};
