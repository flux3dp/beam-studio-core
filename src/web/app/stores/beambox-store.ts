import EventEmitter from 'events';

const UPDATE_LASER_PANEL = 'UPDATE_LASER_PANEL';
const SHOW_CROPPER = 'SHOW_CROPPER';
const DRAW_GUIDE_LINES = 'DRAW_GUIDE_LINES';

export default Object.assign(EventEmitter.prototype, {
  onUpdateLaserPanel(callback) {
    this.on(UPDATE_LASER_PANEL, callback);
  },

  onCropperShown(callback) {
    this.on(SHOW_CROPPER, callback);
  },

  onDrawGuideLines(callback) {
    this.on(DRAW_GUIDE_LINES, callback);
  },

  removeUpdateLaserPanelListener(callback) {
    this.removeListener(UPDATE_LASER_PANEL, callback);
  },

  removeAllUpdateLaserPanelListeners() {
    this.removeAllListeners(UPDATE_LASER_PANEL);
  },

  removeCropperShownListener(callback) {
    this.removeListener(SHOW_CROPPER, callback);
  },

  emitUpdateLaserPanel() {
    this.emit(UPDATE_LASER_PANEL);
  },

  emitShowCropper() {
    this.emit(SHOW_CROPPER);
  },

  emitDrawGuideLines() {
    this.emit(DRAW_GUIDE_LINES);
  },
});
