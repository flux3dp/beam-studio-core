import customMenuActionProvider from 'implementations/customMenuActionProvider';
import DeviceMaster from 'helpers/device-master';
import menuActions from 'app/actions/beambox/menuActions';
import menuDeviceActions from 'app/actions/beambox/menuDeviceActions';
import menuEventListenerFactory from 'implementations/menuEventListenerFactory';
import { IDeviceInfo } from 'interfaces/IDevice';

const MENU_ITEMS = ['IMPORT', 'EXPORT_FLUX_TASK', 'SAVE_SCENE',
  'UNDO', 'DUPLICATE', 'PHOTO_EDIT', 'DOCUMENT_SETTING', 'CLEAR_SCENE',
  'ZOOM_IN', 'ZOOM_OUT', 'FITS_TO_WINDOW', 'ZOOM_WITH_WINDOW', 'SHOW_GRIDS', 'SHOW_LAYER_COLOR',
  'NETWORK_TESTING', 'ABOUT_BEAM_STUDIO'];

export default abstract class AbstractMenu {
  abstract init(): void;

  abstract enable(items: string[]): void;

  abstract disable(items: string[]): void;

  private menuEventRegistered = false;

  protected initMenuEvents(): void {
    const registerMenuClickEvents = () => {
      this.menuEventRegistered = true;
      const menuEventListener = menuEventListenerFactory.createMenuEventListener();

      menuEventListener.on('MENU_CLICK', (e, menuItem) => {
        const actions: { [key: string]: ((deivce?: IDeviceInfo) => void) } = {
          ...menuActions,
          ...menuDeviceActions,
          ...customMenuActionProvider.getCustomMenuActions(),
        };

        if (typeof actions[menuItem.id] === 'function') {
          const menuActionIds = Object.entries(actions)
            .filter((action) => action[1].length === 0)
            .map((action) => action[0]);
          if (menuActionIds.includes(menuItem.id)) {
            actions[menuItem.id]();
          } else {
            const callback = {
              timeout: 20000,
              onSuccess: (device) => actions[menuItem.id](device),
              onTimeout: () => console.log('select device timeout'),
            };

            DeviceMaster.getDeviceBySerial(menuItem.serial, callback);
          }
        }
      });
    };

    if (!this.menuEventRegistered) {
      registerMenuClickEvents();
    }
  }

  attach(enabledItems: string[]): void {
    const disabledItems = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const item of MENU_ITEMS) {
      if (enabledItems.indexOf(item) < 0) {
        disabledItems.push(item);
      }
    }
    this.enable(enabledItems);
    this.disable(disabledItems);
  }

  detach(): void {
    this.disable(MENU_ITEMS);
  }
}
