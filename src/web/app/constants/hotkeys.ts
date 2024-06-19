const isMacOs = window.os === 'MacOS';

export default {
  add_new_machine: {
    action: 'ADD_NEW_MACHINE',
    shortcut: isMacOs ? 'option+m' : 'alt+m',
    representation: isMacOs ? '⌥M' : 'Alt+M',
  },
  cut: {
    action: 'CUT',
    shortcut: isMacOs ? 'command+x' : 'ctrl+x',
    representation: isMacOs ? '⌘X' : 'Ctrl+X',
  },
  copy: {
    action: 'COPY',
    shortcut: isMacOs ? 'command+c' : 'ctrl+c',
    representation: isMacOs ? '⌘C' : 'Ctrl+C',
  },
  paste: {
    action: 'PASTE',
    shortcut: isMacOs ? 'command+v' : 'ctrl+v',
    representation: isMacOs ? '⌘V' : 'Ctrl+V',
  },
  paste_in_place: {
    action: 'PASTE_IN_PLACE',
    shortcut: isMacOs ? 'shift+command+v' : 'shift+ctrl+v',
    representation: isMacOs ? '⇧⌘V' : 'Shift+Ctrl+V',
  },
  duplicate: {
    action: 'DUPLICATE',
    shortcut: isMacOs ? 'command+d' : 'ctrl+d',
    representation: isMacOs ? '⌘D' : 'Ctrl+D',
  },
  clear_scene: {
    action: 'CLEAR_SCENE',
    shortcut: isMacOs ? 'option+n' : 'alt+n',
    representation: isMacOs ? '⌥N' : 'Alt+N',
  },
  zoom_in: {
    action: 'ZOOM_IN',
    representation: isMacOs ? '⌘+' : 'Ctrl+=',
  },
  zoom_out: {
    action: 'ZOOM_OUT',
    representation: isMacOs ? '⌘-' : 'Ctrl+-',
  },
  undo: {
    action: 'UNDO',
    shortcut: isMacOs ? 'command+z' : 'ctrl+z',
    representation: isMacOs ? '⌘Z' : 'Ctrl+Z',
  },
  redo: {
    action: 'REDO',
    shortcut: isMacOs ? 'shift+command+z' : 'shift+ctrl+z',
    representation: isMacOs ? '⇧⌘Z' : 'Shift+Ctrl+Z',
  },
  group: {
    action: 'GROUP',
    shortcut: isMacOs ? 'command+g' : 'ctrl+g',
    representation: isMacOs ? '⌘G' : 'Ctrl+G',
  },
  ungroup: {
    action: 'UNGROUP',
    shortcut: isMacOs ? 'shift+command+g' : 'shift+ctrl+g',
    representation: isMacOs ? '⇧⌘G' : 'Shift+Ctrl+G',
  },
  preferences: {
    action: 'PREFERENCE',
    shortcut: isMacOs ? 'command+k' : 'ctrl+k',
    representation: isMacOs ? '⌘K' : 'Ctrl+K',
  },
  save_scene: {
    action: 'SAVE_SCENE',
    shortcut: isMacOs ? 'command+s' : 'ctrl+s',
    representation: isMacOs ? '⌘S' : 'Ctrl+S',
  },
  save_as: {
    action: 'SAVE_AS',
    shortcut: isMacOs ? 'shift+command+s' : 'shift+ctrl+s',
    representation: isMacOs ? '⇧⌘S' : 'Shift+Ctrl+S',
  },
  export_flux_task: {
    action: 'EXPORT_FLUX_TASK',
    shortcut: isMacOs ? 'command+e' : 'ctrl+e',
    representation: isMacOs ? '⌘E' : 'Ctrl+E',
  },
};
