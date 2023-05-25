import eventEmitterFactory from 'helpers/eventEmitterFactory';

const UPDATE_WORK_AREA = 'UPDATE_WORK_AREA';
const SHOW_CROPPER = 'SHOW_CROPPER';
const DRAW_GUIDE_LINES = 'DRAW_GUIDE_LINES';

const eventEmitter = eventEmitterFactory.createEventEmitter();
export default {
  onUpdateWorkArea(callback): void {
    eventEmitter.on(UPDATE_WORK_AREA, callback);
  },

  onCropperShown(callback: () => void): void {
    eventEmitter.on(SHOW_CROPPER, callback);
  },

  onDrawGuideLines(callback): void {
    eventEmitter.on(DRAW_GUIDE_LINES, callback);
  },

  removeUpdateWorkAreaListener(callback): void {
    eventEmitter.removeListener(UPDATE_WORK_AREA, callback);
  },

  removeAllUpdateWorkAreaListeners(): void {
    eventEmitter.removeAllListeners(UPDATE_WORK_AREA);
  },

  removeCropperShownListener(callback): void {
    eventEmitter.removeListener(SHOW_CROPPER, callback);
  },

  emitUpdateWorkArea(): void {
    eventEmitter.emit(UPDATE_WORK_AREA);
  },

  emitShowCropper(): void {
    eventEmitter.emit(SHOW_CROPPER);
  },

  emitDrawGuideLines(): void {
    eventEmitter.emit(DRAW_GUIDE_LINES);
  },
};
