import $ from 'jquery';

import communicator from 'implementations/communicator';
import menu from 'implementations/menu';

export default (): void => {
  if (window.os !== 'Windows') return;

  $('.content').css({ height: 'calc(100% - 30px)' });
  const titlebar = menu.createTitleBar();
  titlebar.updateTitle(' ');
  window.titlebar = titlebar;
  communicator.on('UPDATE_CUSTOM_TITLEBAR', (e) => {
    window.dispatchEvent(new Event('mousedown'));
  });
};
