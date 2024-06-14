import React from 'react';

import currentFileManager from 'app/svgedit/currentFileManager';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';

import styles from './FileName.module.scss';

interface Props {
  fileName: string;
  hasUnsavedChange: boolean;
  isTitle?: boolean;
}

function FileName({ fileName, hasUnsavedChange, isTitle = false }: Props): JSX.Element {
  const lang = useI18n().topbar;
  const { isCloudFile } = currentFileManager;
  return (
    <div className={isTitle ? styles.title : styles['file-name']}>
      {isCloudFile && <TopBarIcons.CloudFile />}
      {(fileName || lang.untitled) + (hasUnsavedChange ? '*' : '')}
    </div>
  );
}

export default FileName;
