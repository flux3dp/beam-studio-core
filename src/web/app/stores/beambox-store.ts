import eventEmitterFactory from 'helpers/eventEmitterFactory';

const UPDATE_LASER_PANEL = 'UPDATE_LASER_PANEL';
const SHOW_CROPPER = 'SHOW_CROPPER';
const DRAW_GUIDE_LINES = 'DRAW_GUIDE_LINES';

const eventEmitter = eventEmitterFactory.createEventEmitter();
export default {
  onUpdateLaserPanel(callback): void {
    eventEmitter.on(UPDATE_LASER_PANEL, callback);
  },

  onCropperShown(callback: () => void): void {
    eventEmitter.on(SHOW_CROPPER, callback);
  },

  onDrawGuideLines(callback): void {
    eventEmitter.on(DRAW_GUIDE_LINES, callback);
  },

  removeUpdateLaserPanelListener(callback): void {
    eventEmitter.removeListener(UPDATE_LASER_PANEL, callback);
  },

  removeAllUpdateLaserPanelListeners(): void {
    eventEmitter.removeAllListeners(UPDATE_LASER_PANEL);
  },

  removeCropperShownListener(callback): void {
    eventEmitter.removeListener(SHOW_CROPPER, callback);
  },

  emitUpdateLaserPanel(): void {
    eventEmitter.emit(UPDATE_LASER_PANEL);
  },

  emitShowCropper(): void {
    eventEmitter.emit(SHOW_CROPPER);
  },

  emitDrawGuideLines(): void {
    eventEmitter.emit(DRAW_GUIDE_LINES);
  },
};
