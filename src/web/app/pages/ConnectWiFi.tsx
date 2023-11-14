import classNames from 'classnames';
import React, { useMemo } from 'react';
import { Collapse } from 'antd';

import constant from 'app/actions/beambox/constant';
import useI18n from 'helpers/useI18n';

import styles from './ConnectWiFi.module.scss';

const ConnectWiFi = (): JSX.Element => {
  const lang = useI18n().initialize;

  const { model } = useMemo(() => {
    const queryString = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);
    return {
      model: urlParams.get('model'),
    };
  }, []);

  const handleNext = () => {
    const urlParams = new URLSearchParams({ model, wired: '0' });
    const queryString = urlParams.toString();
    window.location.hash = `#initialize/connect/connect-machine-ip?${queryString}`;
  };
  const isAdor = useMemo(() => constant.adorModels.includes(model), [model]);

  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={styles.btn} onClick={() => window.history.back()}>
          {lang.back}
        </div>
        <div className={classNames(styles.btn, styles.primary)} onClick={handleNext}>
          {lang.next}
        </div>
      </div>
      <div className={classNames(styles.main, { [styles.ador]: isAdor })}>
        <div className={styles.image}>
          <div className={styles.hint} />
          <img
            src={
              isAdor ? 'core-img/init-panel/ador-network.jpg' : 'img/init-panel/touch-panel-en.jpg'
            }
            draggable="false"
          />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>{lang.connect_wifi.title}</div>
          <div className={classNames(styles.contents, styles.tutorial)}>
            <div>{lang.connect_wifi.tutorial1}</div>
            <div>{lang.connect_wifi.tutorial2}</div>
          </div>
          <Collapse
            accordion
            items={[
              {
                key: '1',
                label: lang.connect_wifi.what_if_1,
                children: (
                  <div className={classNames(styles.contents, styles.collapse)}>
                    {lang.connect_wifi.what_if_1_content}
                  </div>
                ),
              },
              {
                key: '2',
                label: lang.connect_wifi.what_if_2,
                children: (
                  <div className={classNames(styles.contents, styles.collapse)}>
                    {lang.connect_wifi.what_if_2_content}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectWiFi;
