/* eslint-disable class-methods-use-this */
import communicator from 'implementations/communicator';
import fileExportHelper from 'helpers/file-export-helper';

const MENU_ITEMS = ['IMPORT', 'EXPORT_FLUX_TASK', 'SAVE_SCENE',
  'UNDO', 'DUPLICATE', 'PHOTO_EDIT', 'DOCUMENT_SETTING', 'CLEAR_SCENE',
  'ZOOM_IN', 'ZOOM_OUT', 'FITS_TO_WINDOW', 'ZOOM_WITH_WINDOW', 'SHOW_GRIDS', 'SHOW_LAYER_COLOR',
  'TUTORIAL', 'NETWORK_TESTING', 'ABOUT_BEAM_STUDIO'];

let currentHandler;

const { electron } = window;
if (electron) {
  communicator.on('WINDOW_CLOSE', async () => {
    const res = await fileExportHelper.toggleUnsavedChangedDialog();
    if (res) communicator.send('CLOSE_REPLY', true);
  });
}

class GlobalInteraction {
  protected actions: { [key: string]: (eventName?:string, args?) => void };

  constructor() {
    this.actions = {};
  }

  attach(enabledItems: string[]): void {
    currentHandler = this;
    if (communicator) {
      if (enabledItems) {
        const disabledItems = [];
        for (let i = 0; i < MENU_ITEMS.length; i += 1) {
          const item = MENU_ITEMS[i];
          if (enabledItems.indexOf(item) < 0) {
            disabledItems.push(item);
          }
        }
        this.enableMenuItems(enabledItems);
        this.disableMenuItems(disabledItems);
      } else {
        this.disableMenuItems(MENU_ITEMS);
      }
    }
  }

  detach(): void {
    if (currentHandler === this) {
      currentHandler = undefined;
      this.disableMenuItems(MENU_ITEMS);
    }
  }

  enableMenuItems(items: string[]): void {
    if (communicator) {
      communicator.send('ENABLE_MENU_ITEM', items);
    }
  }

  disableMenuItems(items: string[]): void {
    if (communicator) {
      communicator.send('DISABLE_MENU_ITEM', items);
    }
  }
}

export default GlobalInteraction;
