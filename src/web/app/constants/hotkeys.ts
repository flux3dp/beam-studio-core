const isMacOs = window.os === 'MacOS';

export default {
  add_new_machine: {
    action: 'ADD_NEW_MACHINE',
    shortcut: isMacOs ? 'option+n' : 'alt+n',
    representation: isMacOs ? '⌥N' : 'Alt+N',
    keyboard: {
      MacOS: {
        shortcut: 'option+n',
        representation: '⌥N',
      },
      Windows: {
        shortcut: 'alt+n',
        representation: 'Alt+N',
      },
    },
  },
  cut: {
    action: 'CUT',
    shortcut: isMacOs ? 'command+x' : 'ctrl+x',
    representation: isMacOs ? '⌘X' : 'Ctrl+X',
    keyboard: {
      MacOS: {
        shortcut: 'command+x',
        representation: '⌘X',
      },
      Windows: {
        shortcut: 'ctrl+x',
        representation: 'Ctrl+X',
      },
    },
  },
  copy: {
    action: 'COPY',
    shortcut: isMacOs ? 'command+c' : 'ctrl+c',
    representation: isMacOs ? '⌘C' : 'Ctrl+C',
    keyboard: {
      MacOS: {
        shortcut: 'command+c',
        representation: '⌘C',
      },
      Windows: {
        shortcut: 'ctrl+c',
        representation: 'Ctrl+C',
      },
    },
  },
  paste: {
    action: 'PASTE',
    shortcut: isMacOs ? 'command+v' : 'ctrl+v',
    representation: isMacOs ? '⌘V' : 'Ctrl+V',
    keyboard: {
      MacOS: {
        shortcut: 'command+v',
        representation: '⌘V',
      },
      Windows: {
        shortcut: 'ctrl+v',
        representation: 'Ctrl+V',
      },
    },
  },
  paste_in_place: {
    action: 'PASTE_IN_PLACE',
    shortcut: isMacOs ? 'shift+command+v' : 'shift+ctrl+v',
    representation: isMacOs ? '⇧⌘V' : 'Shift+Ctrl+V',
    keyboard: {
      MacOS: {
        shortcut: 'shift+command+v',
        representation: '⇧⌘V',
      },
      Windows: {
        shortcut: 'shift+ctrl+v',
        representation: 'Shift+Ctrl+V',
      },
    },
  },
  duplicate: {
    action: 'DUPLICATE',
    shortcut: isMacOs ? 'command+d' : 'ctrl+d',
    representation: isMacOs ? '⌘D' : 'Ctrl+D',
    keyboard: {
      MacOS: {
        shortcut: 'command+d',
        representation: '⌘D',
      },
      Windows: {
        shortcut: 'ctrl+d',
        representation: 'Ctrl+D',
      },
    },
  },
  clear_scene: {
    action: 'CLEAR_SCENE',
    shortcut: isMacOs ? 'shift+command+x' : 'shift+ctrl+x',
    representation: isMacOs ? '⇧⌘X' : 'Shift+Ctrl+X',
    keyboard: {
      MacOS: {
        shortcut: 'shift+command+x',
        representation: '⇧⌘X',
      },
      Windows: {
        shortcut: 'shift+ctrl+x',
        representation: 'Shift+Ctrl+X',
      },
    },
  },
  zoom_in: {
    action: 'ZOOM_IN',
    representation: isMacOs ? '⌘+' : 'Ctrl+=',
    keyboard: {
      MacOS: {
        representation: '⌘+',
      },
      Windows: {
        representation: 'Ctrl+=',
      },
    },
  },
  zoom_out: {
    action: 'ZOOM_OUT',
    representation: isMacOs ? '⌘-' : 'Ctrl+-',
    keyboard: {
      MacOS: {
        representation: '⌘-',
      },
      Windows: {
        representation: 'Ctrl+-',
      },
    },
  },
  undo: {
    action: 'UNDO',
    shortcut: isMacOs ? 'command+z' : 'ctrl+z',
    representation: isMacOs ? '⌘Z' : 'Ctrl+Z',
    keyboard: {
      MacOS: {
        shortcut: 'command+z',
        representation: '⌘Z',
      },
      Windows: {
        shortcut: 'ctrl+z',
        representation: 'Ctrl+Z',
      },
    },
  },
  redo: {
    action: 'REDO',
    shortcut: isMacOs ? 'shift+command+z' : 'shift+ctrl+z',
    representation: isMacOs ? '⇧⌘Z' : 'Shift+Ctrl+Z',
    keyboard: {
      MacOS: {
        shortcut: 'shift+command+z',
        representation: '⇧⌘Z',
      },
      Windows: {
        shortcut: 'shift+ctrl+z',
        representation: 'Shift+Ctrl+Z',
      },
    },
  },
  group: {
    action: 'GROUP',
    shortcut: isMacOs ? 'command+g' : 'ctrl+g',
    representation: isMacOs ? '⌘G' : 'Ctrl+G',
    keyboard: {
      MacOS: {
        shortcut: 'command+g',
        representation: '⌘G',
      },
      Windows: {
        shortcut: 'ctrl+g',
        representation: 'Ctrl+G',
      },
    },
  },
  ungroup: {
    action: 'UNGROUP',
    shortcut: isMacOs ? 'shift+command+g' : 'shift+ctrl+g',
    representation: isMacOs ? '⇧⌘G' : 'Shift+Ctrl+G',
    keyboard: {
      MacOS: {
        shortcut: 'shift+command+g',
        representation: '⇧⌘G',
      },
      Windows: {
        shortcut: 'shift+ctrl+g',
        representation: 'Shift+Ctrl+G',
      },
    },
  },
  preferences: {
    action: 'PREFERENCE',
    shortcut: isMacOs ? 'command+k' : 'ctrl+k',
    representation: isMacOs ? '⌘K' : 'Ctrl+K',
    keyboard: {
      MacOS: {
        shortcut: 'command+k',
        representation: '⌘K',
      },
      Windows: {
        shortcut: 'ctrl+k',
        representation: 'Ctrl+K',
      },
    },
  },
  save_scene: {
    action: 'SAVE_SCENE',
    shortcut: isMacOs ? 'command+s' : 'ctrl+s',
    representation: isMacOs ? '⌘S' : 'Ctrl+S',
    keyboard: {
      MacOS: {
        shortcut: 'command+s',
        representation: '⌘S',
      },
      Windows: {
        shortcut: 'ctrl+s',
        representation: 'Ctrl+S',
      },
    },
  },
  save_as: {
    action: 'SAVE_AS',
    shortcut: isMacOs ? 'shift+command+s' : 'shift+ctrl+s',
    representation: isMacOs ? '⇧⌘S' : 'Shift+Ctrl+S',
    keyboard: {
      MacOS: {
        shortcut: 'shift+command+s',
        representation: '⇧⌘S',
      },
      Windows: {
        shortcut: 'shift+ctrl+s',
        representation: 'Shift+Ctrl+S',
      },
    },
  },
  export_flux_task: {
    action: 'EXPORT_FLUX_TASK',
    shortcut: isMacOs ? 'command+e' : 'ctrl+e',
    representation: isMacOs ? '⌘E' : 'Ctrl+E',
    keyboard: {
      MacOS: {
        shortcut: 'command+e',
        representation: '⌘E',
      },
      Windows: {
        shortcut: 'ctrl+e',
        representation: 'Ctrl+E',
      },
    },
  },
};
