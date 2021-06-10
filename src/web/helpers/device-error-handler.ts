import i18n from 'helpers/i18n';

const lang = i18n.lang;

const self = {
    /**
    * Translate device error into readable language
    * @param {String|String[]} error - some string or array
    */
    translate: (error) => {
        // always process error as array, hard fix for the backend
        error = (error instanceof Array ? error : [error]);

        let errorOutput = '';

        if (error.length) {
            if (lang.generic_error[error[0]]) {
                return lang.generic_error[error[0]];
            }
            errorOutput = lang.monitor[error.slice(0, 2).join('_')];
            if (errorOutput === '' || typeof errorOutput === 'undefined') {
                errorOutput = error.join(' ');
            }
        }

        if (typeof errorOutput === 'object') {
            errorOutput = JSON.stringify(errorOutput);
        }

        return errorOutput || '';
    },
};

export default self;
