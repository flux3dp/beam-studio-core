import $ from 'jquery';
import communicator from 'implementations/communicator';

export default (): void => {
  if (window.os !== 'Windows') return;
  const customTitlebar = requireNode('custom-electron-titlebar');

  $('.content').css({ height: 'calc(100% - 30px)' });
  const titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333'),
    shadow: false,
    icon: 'win-title-icon.png',
  });
  titlebar.updateTitle(' ');
  window.titlebar = titlebar;
  communicator.on('UPDATE_CUSTOM_TITLEBAR', (e) => {
    window.dispatchEvent(new Event('mousedown'));
  });
};
