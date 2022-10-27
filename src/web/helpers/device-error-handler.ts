import i18n from 'helpers/i18n';

const { lang } = i18n;

const self = {
  translate: (error: string | string [] | Record<string, unknown>): string => {
    // When error is object but not array
    if (typeof error === 'object' && !(error instanceof Array)) {
      return JSON.stringify(error);
    }
    let errorOutput = '';

    // always process error as array, hard fix for the backend
    // eslint-disable-next-line no-param-reassign
    error = error instanceof Array ? error : [error];

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
