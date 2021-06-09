/* eslint-disable import/first */
import * as React from 'react';

jest.mock('app/views/beambox/Image-Trace-Panel', () => function DummyImageTracePanel() {
  return (
    <div>
      This is dummy ImageTracePanel
    </div>
  );
});

import imageTracePanelController from './imageTracePanelController';

test('test render', () => {
  document.body.innerHTML = '<div id="image-trace-panel-placeholder" />';
  imageTracePanelController.render();
  expect(document.body.innerHTML).toBe('<div id="image-trace-panel-placeholder"><div>This is dummy ImageTracePanel</div></div>');
});
