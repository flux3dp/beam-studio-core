import customMenuActionProvider from 'implementations/customMenuActionProvider';
import DeviceMaster from 'helpers/device-master';
import menuActions from 'app/actions/beambox/menuActions';
import menuDeviceActions from 'app/actions/beambox/menuDeviceActions';
import menuEventListenerFactory from 'implementations/menuEventListenerFactory';
import { IDeviceInfo } from 'interfaces/IDevice';

export default abstract class AbstractMenu {
  abstract init(): void;

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
          if (Object.keys(menuActions).includes(menuItem.id)) {
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
}
