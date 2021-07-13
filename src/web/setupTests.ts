/* eslint-disable import/no-extraneous-dependencies */
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import $ from 'jquery';
import { enableFetchMocks } from 'jest-fetch-mock';

declare global {
  interface Window {
    electron?: {
      ipc: any,
      events: { [key: string]: string; },
      trigger_file_input_click: (inputId: string) => void,
      remote: any,
    },
    FLUX: {
      allowTracking: boolean,
      backendAlive: boolean,
      debug: boolean,
      dev: boolean,
      ghostPort: number,
      logfile?: any,
      timestamp: number,
      version: string,
      websockets: any,
    },
    os: 'MacOS' | 'Windows' | 'Linux' | 'others',
    requirejs: (deps: string[], callback: (...modules: any[]) => void) => void,
    $: any,
    jQuery: any,
    svgedit: any,
    svgCanvas: any,
    svgEditor: any,
    titlebar?: any,
  }
}

window.$ = $;
enableFetchMocks();
configure({ adapter: new Adapter() });
Object.defineProperty(window, 'os', {
  value: '',
  writable: true,
});
Object.defineProperty(window, 'FLUX', {
  value: {},
  writable: true,
});
Object.defineProperty(window, 'electron', {
  value: {},
  writable: true,
});
