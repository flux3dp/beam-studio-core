import { eventEmitter } from 'app/views/beambox/ZoomBlock/ZoomBlock';

const updateZoomBlock = (): void => {
  eventEmitter.emit('UPDATE_ZOOM_BLOCK');
};

export default {
  updateZoomBlock,
};
