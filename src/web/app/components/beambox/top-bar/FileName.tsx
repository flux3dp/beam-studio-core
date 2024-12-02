import React, { useEffect } from 'react';
import ReactDomServer from 'react-dom/server';

import currentFileManager from 'app/svgedit/currentFileManager';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useForceUpdate from 'helpers/use-force-update';
import useI18n from 'helpers/useI18n';

import styles from './FileName.module.scss';

interface Props {
  hasUnsavedChange: boolean;
  isTitle?: boolean;
}

const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');

function FileName({ hasUnsavedChange, isTitle = false }: Props): JSX.Element {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    topBarEventEmitter.on('UPDATE_TITLE', forceUpdate);
    return () => {
      topBarEventEmitter.removeListener('UPDATE_TITLE', forceUpdate);
    };
  }, [forceUpdate]);
  const lang = useI18n().topbar;
  const { isCloudFile } = currentFileManager;
  const fileName = currentFileManager.getName() || lang.untitled;
  return (
    <div className={isTitle ? styles.title : styles['file-name']}>
      {isCloudFile && <TopBarIcons.CloudFile className={styles.cloud} />}
      {`${fileName}${hasUnsavedChange ? '*' : ''}`}
    </div>
  );
}

const updateTitle = () => {
  if (window.os === 'Windows' && window.titlebar) {
    const title = ReactDomServer.renderToStaticMarkup(
      <FileName hasUnsavedChange={false} isTitle />
    );
    // eslint-disable-next-line no-underscore-dangle
    if (window.titlebar?._title) window.titlebar._title.innerHTML = title;
  }
};

export const registerWindowUpdateTitle = (): void => {
  topBarEventEmitter.on('UPDATE_TITLE', updateTitle);
};

export const unregisterWindowUpdateTitle = (): void => {
  topBarEventEmitter.removeListener('UPDATE_TITLE', updateTitle);
};

export default FileName;
