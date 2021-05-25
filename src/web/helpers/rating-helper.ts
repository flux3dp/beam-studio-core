/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/dot-notation */
import Dialog from 'app/actions/dialog-caller';
import { getInfo, submitRating } from 'helpers/api/flux-id';
import storage from 'implementations/storage';

interface IRecord {
  times: number,
  score: number,
  version: string,
  isVoted: boolean,
  isIgored: boolean,
  user?: string,
}

const getRecord = (): IRecord => storage.get('rating-record') as IRecord;

const setRecord = (record: IRecord): void => {
  storage.set('rating-record', record);
};

const setNotShowing = (): void => {
  const record = getRecord();

  setRecord({
    ...record,
    version: window['FLUX'].version,
    isIgored: true,
  });
};

const setVoted = (score: number): void => {
  const record = getRecord();

  setRecord({
    ...record,
    score,
    version: window['FLUX'].version,
    isVoted: true,
  });

  getInfo(true).then((response) => {
    if (response.status === 'ok') {
      submitRating({
        user: response.email,
        score,
        version: window['FLUX'].version,
        app: 'Beam Studio',
      });
    } else {
      submitRating({
        score,
        version: window['FLUX'].version,
        app: 'Beam Studio',
      });
    }
  });
};

const setDefaultRatingRecord = (): void => {
  const defaultRecord = {
    times: 1,
    version: window['FLUX'].version,
    score: 0,
    isVoted: false,
    isIgored: false,
  };
  storage.set('rating-record', defaultRecord);
};

const init = (): void => {
  if (!storage.isExisting('rating-record')) {
    setDefaultRatingRecord();
  } else {
    const record = getRecord();
    if (localStorage.getItem('debug')) {
      Dialog.showRatingDialog(setVoted);
    }

    if (window['FLUX'].version !== record.version) {
      setDefaultRatingRecord();
      return;
    }

    if (record.isIgored || record.isVoted) {
      return;
    }

    if (record.times > 4 && record.times % 5 === 0 && window.navigator.onLine) {
      Dialog.showRatingDialog(setVoted);
    }

    setRecord({
      ...record,
      times: record.times + 1,
    });
  }
};

export default {
  init,
  getRecord,
  setRecord,
  setNotShowing,
  setVoted,
};
