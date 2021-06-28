/* eslint-disable no-console */
import EventEmitter from 'eventemitter3';

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
        reject(response.error.join(''));
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
          console.log('strange message from /ws/opencv', response);
        }
      });
      this.ws.send(`upload ${url} ${data.byteLength}`);
    });
  }

  async pdfToSvgBlob(file: File): Promise<Blob> {
    const data = await file.arrayBuffer();
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
}

let singleton: UtilsWebSocket = null;

const getUtilWS = (): UtilsWebSocket => {
  singleton = singleton || new UtilsWebSocket();
  return singleton;
};

export default getUtilWS;
