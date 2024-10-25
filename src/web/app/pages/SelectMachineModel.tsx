import React from 'react';
import classNames from 'classnames';

import dialog from 'app/actions/dialog-caller';
import InitializeIcons from 'app/icons/initialize/InitializeIcons';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';
import windowLocationReload from 'app/actions/windowLocation';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import styles from './SelectMachineModel.module.scss';

const SelectMachineModel = (): JSX.Element => {
  const t = useI18n().initialize;
  const isNewUser = React.useMemo(() => !storage.get('printer-is-ready'), []);
  const handleBtnClick = React.useCallback(() => {
    if (isNewUser) {
      storage.set('new-user', true);
    }

    storage.set('printer-is-ready', true);
    dialog.showLoadingWindow();
    window.location.hash = '#studio/beambox';
    windowLocationReload();
  }, [isNewUser]);
  const handleNextClick = (model?: WorkAreaModel) => {
    // for promark, there is no connection type selection, go to connect-usb directly
    if (model === 'fpm1') {
      window.location.hash = `#initialize/connect/connect-usb?model=${model}`;

      return;
    }

    window.location.hash = `#initialize/connect/select-connection-type?model=${model}`;
  };

  const modelList = [
    { model: 'ado1', label: 'Ador', Icon: InitializeIcons.Ador } as const,
    { model: 'fbm1', label: 'beamo', Icon: InitializeIcons.Beamo } as const,
    {
      model: 'fbb1p',
      label: 'Beambox Series',
      Icon: InitializeIcons.Beambox,
      extraClass: styles.bb,
    } as const,
    { model: 'fhexa1', label: 'HEXA', Icon: InitializeIcons.Hexa } as const,
    { model: 'fpm1', label: 'Promark Series', Icon: InitializeIcons.Promark } as const,
  ];

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={styles.btn} onClick={handleBtnClick}>
          {isNewUser ? t.skip : t.back}
        </div>
      </div>
      <div className={styles.main}>
        <h1 className={styles.title}>{t.select_machine_type}</h1>
        <div className={styles.btns}>
          {modelList.map(({ model, label, Icon, extraClass }) => (
            <div key={model} className={styles.btn} onClick={() => handleNextClick(model)}>
              <Icon className={styles.icon} />
              <div className={classNames(styles.label, extraClass)}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectMachineModel;
