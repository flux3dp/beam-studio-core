import React from 'react';

import dialogCaller from 'app/actions/dialog-caller';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';

import styles from './DocumentButton.module.scss';


const DocumentButton = (): JSX.Element => {
  const lang = useI18n().topbar;

  return (
    <div className={styles.button} onClick={dialogCaller.showDocumentSettings} title={lang.task_preview}>
      <TopBarIcons.Document />
    </div>
  );
}

export default DocumentButton;
