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
Object.defineProperty(window, 'svgedit', {
  value: {
    NS: {
      HTML: 'http://www.w3.org/1999/xhtml',
      MATH: 'http://www.w3.org/1998/Math/MathML',
      SE: 'http://svg-edit.googlecode.com',
      SVG: 'http://www.w3.org/2000/svg',
      XLINK: 'http://www.w3.org/1999/xlink',
      XML: 'http://www.w3.org/XML/1998/namespace',
      XMLNS: 'http://www.w3.org/2000/xmlns/',
      INKSCAPE: 'http://www.inkscape.org/namespaces/inkscape',
    },
    browser: {
      isTouch: () => false,
    },
  },
  writable: true,
});
