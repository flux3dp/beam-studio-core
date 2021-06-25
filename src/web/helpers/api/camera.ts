/* eslint-disable no-console */
/**
 * API camera
 * Ref: https://github.com/flux3dp/fluxghost/wiki/websocket-camera(monitoring)
 */
import { Subject, from, ObservableInput } from 'rxjs';
import {
  concatMap, filter, map, take, timeout,
} from 'rxjs/operators';

import i18n from 'helpers/i18n';
import rsaKey from 'helpers/rsa-key';
import VersionChecker from 'helpers/version-checker';
import Websocket from 'helpers/websocket';
import { IDeviceInfo } from 'interfaces/IDevice';

const TIMEOUT = 30000;
const IMAGE_TRANSMISSION_FAIL_THRESHOLD = 20;
const CAMERA_CABLE_ALERT_THRESHOLD = 10;
const LANG = i18n.lang;

const checkBlobIsImage = (blob: Blob, failTime = 3000) => new Promise<boolean>((resolve) => {
  const img = new Image();
  const imgUrl = URL.createObjectURL(blob);
  let resolved = false;
  const resolveAndCleanUp = (result: boolean) => {
    resolved = true;
    URL.revokeObjectURL(imgUrl);
    resolve(result);
  };
  const failTimer = setTimeout(() => {
    if (!resolved) {
      resolveAndCleanUp(false);
    }
  }, failTime);
  img.onload = () => {
    if (!resolved) {
      resolveAndCleanUp(true);
      clearTimeout(failTimer);
    }
  };
  img.src = imgUrl;
});

class Camera {
  cameraNeedFlip: boolean = null;

  shouldCrop: boolean;

  private device: {
    uuid: string | null,
    source: string | null,
    model: string | null,
    version: string | null
  };

  private ws: any;

  private wsSubject: Subject<any>;

  private source: any;

  private requireFrameRetry: number;

  constructor(shouldCrop = true, cameraNeedFlip: boolean = null) {
    this.shouldCrop = shouldCrop;
    this.device = {
      uuid: null,
      source: null,
      model: null,
      version: null,
    };
    if (cameraNeedFlip !== null) {
      this.cameraNeedFlip = cameraNeedFlip;
    }
    this.ws = null;
    this.requireFrameRetry = 0;
    this.wsSubject = new Subject<Blob>();
    this.source = this.wsSubject
      .asObservable()
      .pipe(filter((x) => x instanceof Blob))
      .pipe(map(async (blob: Blob) => {
        const isImage = await checkBlobIsImage(blob);
        if (!isImage) {
          if (this.requireFrameRetry < IMAGE_TRANSMISSION_FAIL_THRESHOLD) {
            setTimeout(() => this.ws.send('require_frame'), 500);
            this.requireFrameRetry += 1;
            return null;
          }
          throw new Error(LANG.message.camera.fail_to_transmit_image);
        }
        const needCameraCableAlert = this.requireFrameRetry >= CAMERA_CABLE_ALERT_THRESHOLD;
        this.requireFrameRetry = 0;
        const imgBlob = await this.preprocessImage(blob);
        return { imgBlob, needCameraCableAlert };
      }))
      .pipe(concatMap((p: ObservableInput<any>) => from(p)
        .pipe(filter((result) => result))));
  }

  // let subject get response from websocket
  async createWs(device: IDeviceInfo): Promise<void> {
    this.device = device;
    console.log('Device ', device);
    console.assert(device.version, 'device miss version!', device);
    const method = (device.source === 'h2h') ? `camera/usb/${parseInt(device.uuid, 10)}` : `camera/${device.uuid}`;

    this.ws = Websocket({
      method,
      onOpen: () => this.ws.send(rsaKey()),
      onMessage: (res) => this.wsSubject.next(res),
      onError: (res) => this.wsSubject.error(new Error(`Camera WS ${res.error ? res.error.toString() : res}`)),
      onFatal: (res) => this.wsSubject.error(new Error(`Camera WS ${res.error ? res.error.toString() : res}`)),
      onClose: () => this.wsSubject.complete(),
      autoReconnect: false,
    });

    // if response.status === 'connected' within TIMEOUT,
    // the promise resolve. and the websocket will keep listening.
    await this.wsSubject
      .pipe(filter((res) => res.status === 'connected'))
      .pipe(take(1))
      .pipe(timeout(TIMEOUT))
      .toPromise();

    // check whether the camera need flip
    if (this.cameraNeedFlip === null && device && device.model.indexOf('delta-') < 0) {
      this.cameraNeedFlip = !!(Number((/F:\s?(-?\d+\.?\d+)/.exec(await this.getCameraOffset()) || ['', ''])[1]));
    }
  }

  async getCameraOffset(): Promise<string> {
    console.warn('This is additional control socket created in camera.ts, this may take unnecessary time.');
    const tempWsSubject = new Subject<{ error?: Error, status: string, value: string }>();
    const tempWs = Websocket({
      method: (this.device.source === 'h2h') ? `control/usb/${parseInt(this.device.uuid, 10)}` : `control/${this.device.uuid}`,
      onOpen: () => tempWs.send(rsaKey()),
      onMessage: (res) => tempWsSubject.next(res),
      onError: (res) => tempWsSubject.error(new Error(res.error ? res.error.toString() : res)),
      onFatal: (res) => tempWsSubject.error(new Error(res.error ? res.error.toString() : res)),
      onClose: () => tempWsSubject.complete(),
      autoReconnect: false,
    });
    await tempWsSubject
      .pipe(filter((res) => res.status === 'connected'))
      .pipe(take(1))
      .pipe(timeout(TIMEOUT))
      .toPromise();

    tempWs.send('config get camera_offset');
    const cameraOffset = await tempWsSubject
      .pipe(take(1))
      .pipe(timeout(TIMEOUT))
      .toPromise();
    return cameraOffset.value;
  }

  async oneShot() {
    if (this.wsSubject.isStopped) {
      if (this.wsSubject.hasError) {
        console.error(this.wsSubject.thrownError);
      }
      throw new Error(LANG.message.camera.ws_closed_unexpectly);
    }
    this.ws.send('require_frame');
    return await this.source
      .pipe(take(1))
      .pipe(timeout(TIMEOUT))
      .toPromise();
  }

  getLiveStreamSource() {
    this.ws.send('enable_streaming');
    return this.source
      .pipe(timeout(TIMEOUT));
  }

  closeWs(): void {
    this.ws.close(false);
  }

  async preprocessImage(blob: Blob) {
    // load blob and flip if necessary
    const imageLoadBlob = async () => {
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imgUrl;
      });
      URL.revokeObjectURL(imgUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      if (this.cameraNeedFlip) {
        canvas.getContext('2d').scale(-1, -1);
        canvas.getContext('2d').drawImage(img, -img.width, -img.height, img.width, img.height);
      } else {
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
      }
      return canvas;
    };
    const resize1280x720ImageTo640x280 = async () => {
      const img = await imageLoadBlob();
      console.assert(img.width === 1280 && img.height === 720, 'image should be 1280x720', img.width, img.height);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 280;
      canvas.getContext('2d').drawImage(img, 0, -40, 640, 360); // resize
      const preprocessedBlob = await new Promise<Blob>(
        (resolve) => canvas.toBlob((b) => resolve(b)),
      );
      return preprocessedBlob;
    };

    const crop640x480ImageTo640x280 = async () => {
      const img = await imageLoadBlob();
      console.assert(img.width === 640 && img.height === 480, 'image should be 640x480', img.width, img.height);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 280;
      canvas.getContext('2d').drawImage(img, 0, -100, 640, 480); // crop top and bottom
      const preprocessedBlob = await new Promise<Blob>(
        (resolve) => canvas.toBlob((b) => resolve(b)),
      );
      return preprocessedBlob;
    };

    const loadAndFlipImage = async () => {
      const canvas = await imageLoadBlob();
      const preprocessedBlob = await new Promise<Blob>(
        (resolve) => canvas.toBlob((b) => resolve(b)),
      );
      return preprocessedBlob;
    };

    if (!['mozu1', 'fbm1', 'fbb1b', 'fbb1p', 'fbb2b', 'laser-b1', 'darwin-dev'].includes(this.device.model)) {
      return blob;
    }
    if (!this.shouldCrop) {
      return await loadAndFlipImage();
    }
    if (VersionChecker(this.device.version).meetRequirement('BEAMBOX_CAMERA_SPEED_UP')) {
      return await crop640x480ImageTo640x280();
    }
    return await resize1280x720ImageTo640x280();
  }
}

export default Camera;
