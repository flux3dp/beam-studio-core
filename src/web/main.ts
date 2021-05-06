/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Backbone from 'backbone';
import globalHelper from 'helpers/global-helper';
import Router from 'app/router';
import globalEvents from 'app/actions/global';
import menuBar from 'helpers/menubar';
import loaderResult from './loader';

globalHelper.setWindowMember();
console.log('Loader success: ', loaderResult);

// const allowTracking = false;
declare global {
  var requireNode: (name: string) => any;
  interface Window {
    electron?: {
      ipc: any,
      events: { [key: string]: string; },
      version: string,
      trigger_file_input_click: (inputId: string) => void,
    },
    os: 'MacOS' | 'Windows' | 'Linux' | 'others',
    requirejs: (deps: string[], callback: (...modules: any[]) => void) => void,
    $: any,
    jQuery: any,
    svgedit: any,
    titlebar?: any,
  }
}

export default function main(): void {
  console.log(`Beam-Studio: ${window['FLUX'].version}`);

  // if (allowTracking) {
  //   // google analytics
  //   $.getScript('/js/helpers/analytics.js');
  // }

  menuBar();

  globalEvents(function () {
    const router = new Router();
    Backbone.history.start();
  });
}

main();
