import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';

import dialog from 'app/actions/dialog-caller';
import InitializeIcons from 'app/icons/initialize/InitializeIcons';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import windowLocationReload from 'app/actions/windowLocation';
import { WorkAreaModel } from 'app/constants/workarea';

import styles from './SelectMachineModel.module.scss';

const SelectMachineModel = (): JSX.Element => {
  const isNewUser = useMemo(() => !storage.get('printer-is-ready'), []);
  const lang = useI18n().initialize;
  const handleBtnClick = useCallback(() => {
    if (isNewUser) storage.set('new-user', true);
    storage.set('printer-is-ready', true);
    dialog.showLoadingWindow();
    window.location.hash = '#studio/beambox';
    windowLocationReload();
  }, [isNewUser]);
  const handleNextClick = (model?: WorkAreaModel) => {
    window.location.hash = `#initialize/connect/select-connection-type?model=${model}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={styles.btn} onClick={handleBtnClick}>
          {isNewUser ? lang.skip : lang.back}
        </div>
      </div>
      <div className={styles.main}>
        <h1 className={styles.title}>{lang.select_machine_type}</h1>
        <div className={styles.btns}>
          <div className={styles.btn} onClick={() => handleNextClick('ado1')}>
            <InitializeIcons.Ador className={styles.icon} />
            <div className={styles.label}>Ador</div>
          </div>
          <div className={styles.btn} onClick={() => handleNextClick('fbm1')}>
            <InitializeIcons.Beamo className={styles.icon} />
            <div className={styles.label}>beamo</div>
          </div>
          <div className={styles.btn} onClick={() => handleNextClick('fbb1p')}>
            <InitializeIcons.Beambox className={styles.icon} />
            <div className={classNames(styles.label, styles.bb)}>Beambox Series</div>
          </div>
          <div className={styles.btn} onClick={() => handleNextClick('fhexa1')}>
            <InitializeIcons.Hexa className={styles.icon} />
            <div className={styles.label}>HEXA</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectMachineModel;
