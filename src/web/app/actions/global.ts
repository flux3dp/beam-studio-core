/* eslint-disable no-console */
import config from 'helpers/api/config';
import Logger from 'helpers/logger';
import shortcuts from 'helpers/shortcuts';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});
const { electron } = window;

// const FLUX = window['FLUX'];
// const analytics = window['analytics'];
// prevent delete (back) behavior

const genericLogger = Logger('generic');
const defaultKeyBehavior = () => {
  shortcuts.on(['BACK'], (e): void => {
    // always prevent default, and implement delete function our own.
    e.preventDefault();

    let value;
    let selectionStart;
    const me = e.target;
    let hasSelectionStart = true;
    const inputType = (me.type || '').toUpperCase();
    const acceptedInput = ['TEXT', 'NUMBER', 'PASSWORD', 'TEL', 'URL', 'SEARCH', 'EMAIL'];

    if (((me.tagName === 'INPUT' && acceptedInput.indexOf(inputType) > -1) || me.tagName === 'TEXTAREA')) {
      try {
        selectionStart = me.selectionStart;
      } catch (ex) {
        hasSelectionStart = false;

        if (me.tagName === 'INPUT') {
          me.setAttribute('type', 'TEXT');
        }
      }

      selectionStart = me.selectionStart;
      value = me.value.split('');
      const samePosition = me.selectionEnd === selectionStart;
      const deleteCount = (samePosition ? 1 : e.target.selectionEnd - selectionStart);
      const deleteStart = (samePosition ? selectionStart - 1 : selectionStart);

      value.splice(deleteStart, deleteCount);
      e.target.value = value.join('');
      e.target.setSelectionRange(selectionStart - 1, selectionStart - 1);

      if (me.tagName === 'INPUT' && !hasSelectionStart) {
        me.setAttribute('type', inputType);
      }
    }
  });

  const FN_KEY = window.os === 'MacOS' ? 'cmd' : 'ctrl';

  shortcuts.on([FN_KEY, 'a'], () => window.document.execCommand('selectAll'));
  shortcuts.on([FN_KEY, '0'], () => { console.log('Reset View!'); svgEditor.resetView(); });
  shortcuts.on([FN_KEY, 'plus'], () => { console.log('Zoom In'); svgEditor.zoomIn(); });
  shortcuts.on([FN_KEY, 'minus'], () => { console.log('Zoom Out'); svgEditor.zoomOut(); });
  shortcuts.on([FN_KEY, 'num_plus'], () => { console.log('Zoom In with numpad +'); svgEditor.zoomIn(); });
  shortcuts.on([FN_KEY, 'num_minus'], () => { console.log('Zoom Out with numpad -'); svgEditor.zoomOut(); });
  shortcuts.on(['ctrl', 'alt', 'd'], () => {
    if (electron) {
      electron.ipc.send('DEBUG-INSPECT');
    }
  });
};

defaultKeyBehavior();

// Don't know what this is for
// detached keyup and keydown event
// window.addEventListener('popstate', function(e) {
//     if(FLUX.allowTracking && analytics) {
//         analytics.event('send', 'pageview', location.hash);
//     }
//     shortcuts.disableAll();
//     // TODO
//     defaultKeyBehavior();
// });

// GA Import Begin
// $('body').on('click', '[data-ga-event]', (e) => {
//   const $self = $(e.currentTarget);
//   if (FLUX.allowTracking && analytics) {
//     analytics.event('send', 'event', 'button', 'click', $self.data('ga-event'));
//   }
// });

// GA Import End

window.onerror = (message, source, lineno) => {
  genericLogger.append([message, source, lineno].join(' '));
};

export default (callback: () => void): void => {
  const { hash } = window.location;
  const onFinished = (data) => {
    const isReady = data;

    if (isReady === true && (hash === '' || hash.startsWith('#initialize'))) {
      window.location.hash = '#studio/beambox';
    } else if (isReady === false && !hash.startsWith('#initialize')) {
      window.location.hash = '#';
    }

    callback();
  };

  config().read('printer-is-ready', {
    onFinished,
  });
};
