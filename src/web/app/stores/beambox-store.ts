import eventEmitterFactory from 'helpers/eventEmitterFactory';

const UPDATE_LASER_PANEL = 'UPDATE_LASER_PANEL';
const SHOW_CROPPER = 'SHOW_CROPPER';
const DRAW_GUIDE_LINES = 'DRAW_GUIDE_LINES';

const eventEmitter = eventEmitterFactory.createEventEmitter();
export default {
  onUpdateLaserPanel(callback) {
    eventEmitter.on(UPDATE_LASER_PANEL, callback);
  },

  onCropperShown(callback) {
    eventEmitter.on(SHOW_CROPPER, callback);
  },

  onDrawGuideLines(callback) {
    eventEmitter.on(DRAW_GUIDE_LINES, callback);
  },

  removeUpdateLaserPanelListener(callback) {
    eventEmitter.removeListener(UPDATE_LASER_PANEL, callback);
  },

  removeAllUpdateLaserPanelListeners() {
    eventEmitter.removeAllListeners(UPDATE_LASER_PANEL);
  },

  removeCropperShownListener(callback) {
    eventEmitter.removeListener(SHOW_CROPPER, callback);
  },

  emitUpdateLaserPanel() {
    eventEmitter.emit(UPDATE_LASER_PANEL);
  },

  emitShowCropper() {
    eventEmitter.emit(SHOW_CROPPER);
  },

  emitDrawGuideLines() {
    eventEmitter.emit(DRAW_GUIDE_LINES);
  },
};
