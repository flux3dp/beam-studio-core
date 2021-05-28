import alertConstants from 'app/constants/alert-constants';
import { AlertsAndProgressContextHelper } from 'app/views/dialogs/Alerts-And-Progress';
import { IAlert } from 'interfaces/IAlert';

export default {
    popUp: (args: IAlert) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            AlertsAndProgressContextHelper.context.popUp(args);
        }
    },
    popUpError: (args: IAlert) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            args = {
                ...args,
                type: alertConstants.SHOW_POPUP_ERROR,
            };
            AlertsAndProgressContextHelper.context.popUp(args);
        }
    },
    popById: (id) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
        } else {
            AlertsAndProgressContextHelper.context.popById(id);
        }
    },
    checkIdExist: (id: string) => {
        if (!AlertsAndProgressContextHelper.context) {
            console.log('Alert context not loaded Yet');
            return false;
        } else {
            return AlertsAndProgressContextHelper.context.checkIdExist(id, false);
        }
    },
};
