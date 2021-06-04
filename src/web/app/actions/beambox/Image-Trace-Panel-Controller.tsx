import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageTracePanel from 'app/views/beambox/Image-Trace-Panel';

class ImageTracePanelController {
  render() {
    ReactDOM.render(
      <ImageTracePanel />,
      document.getElementById('image-trace-panel-placeholder'),
    );
  }
}

const instance = new ImageTracePanelController();

export default instance;
