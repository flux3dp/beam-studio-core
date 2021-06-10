import { eventEmitter } from 'app/views/beambox/ZoomBlock/contexts/ZoomBlockContext';

const updateZoomBlock = (): void => {
  eventEmitter.emit('UPDATE_ZOOM_BLOCK');
};

export default {
  updateZoomBlock,
};
