/**
 * API camera calibration
 * Ref: none
 */
import Websocket from '../websocket';

class CameraCalibrationApi {
  private ws: any; // websocket

  private events: {
    onMessage: (response: any) => void;
    onError: (response: any) => void;
    onFatal: (response: any) => void;
  };

  constructor() {
    this.events = {
      onMessage: () => {},
      onError: () => {},
      onFatal: () => {},
    };

    this.ws = Websocket({
      method: 'camera-calibration',
      onMessage: (data) => {
        this.events.onMessage(data);
      },
      onError: (response) => {
        this.events.onError(response);
      },
      onFatal: (response) => {
        this.events.onFatal(response);
      },
    });
  }

  upload(data: Blob | ArrayBuffer): Promise<any> {
    return new Promise((resolve, reject) => {
      this.events.onMessage = (response) => {
        switch (response.status) {
          case 'ok':
            resolve(response);
            break;
          case 'fail':
            resolve(response);
            break;
          case 'none':
            resolve(response);
            break;
          case 'continue':
            this.ws.send(data);
            break;
          default:
            console.log('strange message', response);
            break;
        }
      };

      this.events.onError = (response) => {
        reject(response);
        console.log('on error', response);
      };
      this.events.onFatal = (response) => {
        reject(response);
        console.log('on fatal', response);
      };
      const size = data instanceof Blob ? data.size : data.byteLength;
      this.ws.send(`upload ${size}`);
    });
  }

  startFisheyeCalibrate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.events.onMessage = (response) => {
        switch (response.status) {
          case 'ok':
            resolve(true);
            break;
          default:
            console.log('strange message', response);
            break;
        }
      };

      this.events.onError = (response) => {
        reject(response);
        console.log('on error', response);
      };
      this.events.onFatal = (response) => {
        reject(response);
        console.log('on fatal', response);
      };
      this.ws.send('start_fisheye_calibration');
    });
  }

  addFisheyeCalibrateImg(height: number, img: Blob | ArrayBuffer): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.events.onMessage = (response) => {
        switch (response.status) {
          case 'ok':
            resolve(true);
            break;
          case 'continue':
            this.ws.send(img);
            break;
          default:
            console.log('strange message', response);
            break;
        }
      };

      this.events.onError = (response) => {
        reject(response);
        console.log('on error', response);
      };
      this.events.onFatal = (response) => {
        reject(response);
        console.log('on fatal', response);
      };
      const size = img instanceof Blob ? img.size : img.byteLength;
      this.ws.send(`add_fisheye_calibration_image ${size} ${height}`);
    });
  }

  doFisheyeCalibration(onProgress?: (val: number) => void): Promise<{ k: number[][]; d: number[][] }> {
    return new Promise((resolve, reject) => {
      this.events.onMessage = (response) => {
        switch (response.status) {
          case 'ok':
            resolve(response);
            break;
          case 'progress':
            if (onProgress) onProgress(response.progress);
            break;
          case 'fail':
            reject(response.reason);
            break;
          default:
            console.log('strange message', response);
            break;
        }
      };

      this.events.onError = (response) => {
        reject(response);
        console.log('on error', response);
      };
      this.events.onFatal = (response) => {
        reject(response);
        console.log('on fatal', response);
      };
      this.ws.send('do_fisheye_calibration');
    });
  }

  findPerspectivePoints(onProgress?: (val: number) => void): Promise<{
    points: [number, number][][][]; heights: number[]; errors: { height: number; err: string }[];
  }> {
    return new Promise((resolve, reject) => {
      this.events.onMessage = (response) => {
        switch (response.status) {
          case 'ok':
            resolve(response);
            break;
          case 'progress':
            if (onProgress) onProgress(response.progress);
            break;
          case 'fail':
            reject(response.reason);
            break;
          default:
            console.log('strange message', response);
            break;
        }
      };
      this.ws.send('find_perspective_points');
    });
  }
}

export default CameraCalibrationApi;
