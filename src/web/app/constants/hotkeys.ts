export default {
  cut: {
    action: 'CUT',
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
