import { ZoomBlockContextHelper } from 'app/views/beambox/Zoom-Block/Zoom-Block';

const updateZoomBlock = () => {
  if (!ZoomBlockContextHelper.context) {
    console.log('ZoomBlock is not mounted now.');
  } else {
    ZoomBlockContextHelper.context.updateZoomBlock();
  }
};

export default {
  updateZoomBlock,
};
