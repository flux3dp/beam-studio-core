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

  doFisheyeCalibration(
    onProgress?: (val: number) => void
  ): Promise<{ k: number[][]; d: number[][] }> {
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
    points: [number, number][][][];
    heights: number[];
    errors: { height: number; err: string }[];
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

  calculateRegressionParam(onProgress?: (val: number) => void): Promise<{
    data: number[][][][];
    errors: { height: number; err: string }[];
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
      this.ws.send('cal_regression_param');
    });
  }

  findCorners(
    img: Blob | ArrayBuffer,
    withPitch = false
  ): Promise<{
    success: boolean;
    blob: Blob;
    data?: {
      k: number[][];
      d: number[][];
      rvec: number[];
      tvec: number[];
      points: [number, number][][];
    };
  }> {
    return new Promise((resolve, reject) => {
      let success = true;
      let data = {} as {
        k: number[][];
        d: number[][];
        rvec: number[];
        tvec: number[];
        points: [number, number][][];
      };
      this.events.onMessage = (response) => {
        console.log(response);

        if (response instanceof Blob) {
          resolve({ success, blob: response, data });
        } else if (response.status === 'continue') {
          this.ws.send(img);
        } else if (response.status === 'fail') {
          success = false;
          console.log('fail', response);
        } else if (response.status === 'ok') {
          const { status, ...rest } = response;
          data = rest;
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
      // corner_detection [camera_pitch] [file_length] [calibration_version]
      this.ws.send(`corner_detection ${withPitch ? 20 : 0} ${size} 2`);
    });
  }

  calculateCameraPosition(
    img: Blob | ArrayBuffer,
    dh: number,
    withPitch = false
  ): Promise<{
    success: boolean;
    blob: Blob;
    data?: { xc: number[]; yc: number[]; hx: number[]; hy: number[]; s: number[] };
  }> {
    return new Promise((resolve, reject) => {
      let success = true;
      let data = {} as { xc: number[]; yc: number[]; hx: number[]; hy: number[]; s: number[] };
      this.events.onMessage = (response) => {
        console.log(response);

        if (response instanceof Blob) {
          resolve({ success, blob: response, data });
        } else if (response.status === 'continue') {
          this.ws.send(img);
        } else if (response.status === 'fail') {
          success = false;
          console.log('fail', response);
        } else if (response.status === 'ok') {
          const { status, ...rest } = response;
          data = rest;
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
      // calculate_camera_position [camera_pitch] [elevated_dh] [file_length] [calibration_version]
      this.ws.send(`calculate_camera_position ${withPitch ? 20 : 0} ${dh.toFixed(3)} ${size} 2`);
    });
  }
}

export default CameraCalibrationApi;
