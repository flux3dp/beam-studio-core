/* eslint-disable no-console */
import EventEmitter from 'eventemitter3';

import arrayBuffer from 'helpers/arrayBuffer';
import Websocket from 'helpers/websocket';

class UtilsWebSocket extends EventEmitter {
  private ws: any;

  constructor() {
    super();
    this.ws = Websocket({
      method: 'utils',
      onMessage: (data) => {
        this.emit('message', data);
      },
      onError: (response) => {
        this.emit('error', response);
      },
      onFatal: (response) => {
        this.emit('fatal', response);
      },
    });
  }

  removeCommandListeners(): void {
    this.removeAllListeners('message');
    this.removeAllListeners('error');
    this.removeAllListeners('fatal');
  }

  setDefaultErrorResponse(reject: (reason?) => void, timeoutTimer?: NodeJS.Timeout): void {
    this.on('error', (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.removeCommandListeners();
      reject(response.error.join(''));
    });
  }

  setDefaultFatalResponse(reject: (reason?) => void, timeoutTimer?: NodeJS.Timeout): void {
    this.on('fatal', (response) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.removeCommandListeners();
      console.log(response);
      if (response.error) {
        if (response.error.join) reject(response.error.join(''));
        else reject(response.error);
      } else {
        reject();
      }
    });
  }

  upload(data: ArrayBuffer, url: string): Promise<{ [key: string]: string }> {
    return new Promise((resolve, reject) => {
      this.removeCommandListeners();
      this.setDefaultErrorResponse(reject);
      this.setDefaultFatalResponse(reject);
      this.on('message', (response: { [key: string]: string }) => {
        const { status } = response;
        if (['ok', 'fail', 'none'].includes(status)) {
          this.removeCommandListeners();
          resolve(response);
        } else if (status === 'continue') {
          this.ws.send(data);
        } else {
          console.log('strange message from /ws/utils', response);
        }
      });
      this.ws.send(`upload ${url} ${data.byteLength}`);
    });
  }

  async pdfToSvgBlob(file: File): Promise<Blob> {
    const data = await arrayBuffer(file);
    return new Promise((resolve, reject) => {
      this.removeCommandListeners();
      this.setDefaultErrorResponse(reject);
      this.setDefaultFatalResponse(reject);
      this.on('message', async (response) => {
        if (response.status === 'continue') {
          this.ws.send(data);
        }
        if (response instanceof Blob) {
          this.removeCommandListeners();
          resolve(response);
        }
      });
      this.ws.send(`pdf2svg ${data.byteLength}`);
    });
  }

  async checkExist(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.removeCommandListeners();
      this.setDefaultErrorResponse(reject);
      this.setDefaultFatalResponse(reject);
      this.on('message', (response) => {
        const { status } = response;
        console.log(response);
        if (status === 'ok') {
          this.removeCommandListeners();
          resolve(response.res);
        } else {
          console.log('strange message from /ws/utils', response);
        }
      });
      this.ws.send(`check_exist ${path}`);
    });
  }

  async selectFont(fontPath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.removeCommandListeners();
      this.setDefaultErrorResponse(reject);
      this.setDefaultFatalResponse(reject);
      this.on('message', (response) => {
        const { status } = response;
        console.log(response);
        if (status === 'ok') {
          this.removeCommandListeners();
          resolve(true);
        } else if (status === 'error') {
          this.removeCommandListeners();
          resolve(false);
        } else {
          console.log('strange message from /ws/utils', response);
        }
      });
      this.ws.send(`select_font ${fontPath}`);
    });
  }

  async uploadTo(blob: Blob, path: string, onProgress?: (progress: number) => void) {
    const data = await arrayBuffer(blob);
    return new Promise<boolean>((resolve, reject) => {
      this.removeCommandListeners();
      this.setDefaultErrorResponse(reject);
      this.setDefaultFatalResponse(reject);
      this.on('message', (response: { status: string, progress?: number }) => {
        const { status } = response;
        if (['ok', 'fail'].includes(status)) {
          this.removeCommandListeners();
          resolve(status === 'ok');
        } else if (status === 'continue') {
          let sentLength = 0;
          while (sentLength < data.byteLength) {
            const end = Math.min(sentLength + 1000000, data.byteLength);
            this.ws.send(data.slice(sentLength, end));
            sentLength = end;
          }
        } else if (status === 'progress' && response.progress) {
          if (onProgress) onProgress(response.progress);
        } else {
          console.log('strange message from /ws/utils', response);
          resolve(false);
        }
      });
      this.ws.send(`upload_to ${data.byteLength} ${path}`);
    });
  }
}

let singleton: UtilsWebSocket = null;

const getUtilWS = (): UtilsWebSocket => {
  singleton = singleton || new UtilsWebSocket();
  return singleton;
};

export default getUtilWS;
