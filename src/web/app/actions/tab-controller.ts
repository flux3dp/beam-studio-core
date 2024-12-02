import EventEmitter from 'eventemitter3';

import communicator from 'implementations/communicator';
import currentFileManager from 'app/svgedit/currentFileManager';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';

class TabController extends EventEmitter {
  public currentId: number | null = null;

  constructor() {
    super();
    communicator.on('TAB_FOCUSED', () => {
      this.emit('TAB_FOCUSED');
    });
    this.currentId = communicator.sendSync('get-tab-id');
    const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');
    const updateTitleHandler = () => {
      const { isCloudFile } = currentFileManager;
      const name = currentFileManager.getName();
      const hasUnsavedChanges = currentFileManager.getHasUnsavedChanges();
      const title = `${name || i18n.lang.topbar.untitled}${hasUnsavedChanges ? '*' : ''}`;
      communicator.send('set-tab-title', title, isCloudFile);
    };

    topBarEventEmitter.on('UPDATE_TITLE', updateTitleHandler);
    topBarEventEmitter.on('SET_HAS_UNSAVED_CHANGE', updateTitleHandler);
  }

  onFocused(handler: () => void) {
    this.on('TAB_FOCUSED', handler);
  }

  offFocused(handler: () => void) {
    this.off('TAB_FOCUSED', handler);
  }

  getCurrentId = (): number | null => this.currentId;

  getAllTabs = (): Array<{ id: number; title: string; isCloud: boolean }> =>
    communicator.sendSync('get-all-tabs');

  addNewTab = (): void => communicator.send('add-new-tab');

  closeTab = (id: number): void => communicator.send('close-tab', id);

  focusTab = (id: number): void => {
    if (id === this.currentId) return;
    communicator.send('focus-tab', id);
  };
}

const tabController = new TabController();

export default tabController;
