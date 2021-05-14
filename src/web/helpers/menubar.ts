import $ from 'jquery'
import i18n from 'helpers/i18n';
'use strict';
const LANG = i18n.lang;
const electron = requireNode('electron');

export default function () {
    if (window.os !== 'Windows') return;
    const customTitlebar = requireNode('custom-electron-titlebar');

    $('.content').css({'height': 'calc(100% - 30px)'});
    let titlebar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#333'),
        shadow: false,
        icon: 'win-title-icon.png'
    });
    titlebar.updateTitle(' ');
    window['titlebar'] = titlebar;
    electron.ipcRenderer.on('UPDATE_CUSTOM_TITLEBAR', (e) => {
        window.dispatchEvent(new Event('mousedown'));
    });
}
