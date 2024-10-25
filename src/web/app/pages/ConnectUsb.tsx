/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';

import useI18n from 'helpers/useI18n';

import styles from './ConnectUsb.module.scss';

type ModelSupportUsb = 'ado1' | 'fhexa1' | 'fpm1';

export default function ConnectUsb(): JSX.Element {
  const lang = useI18n().initialize;
  const { search } = useLocation();
  const model = React.useMemo(
    () => new URLSearchParams(search).get('model'),
    [search]
  ) as ModelSupportUsb;

  const renderInformations: Record<ModelSupportUsb, { title: string; steps: Array<string> }> = {
    ado1: {
      title: 'Ador',
      steps: [
        lang.connect_usb.turn_off_machine,
        lang.connect_usb.tutorial1,
        lang.connect_usb.turn_on_machine,
        lang.connect_usb.wait_for_turning_on,
      ],
    },
    fhexa1: {
      title: 'HEXA',
      steps: [lang.connect_usb.tutorial1, lang.connect_usb.tutorial2],
    },
    fpm1: {
      title: 'Promark Series',
      steps: [lang.connect_usb.tutorial1, lang.connect_usb.tutorial2],
    },
  };

  const handleNext = () => {
    const urlParams = new URLSearchParams({ model, usb: '1' });
    const queryString = urlParams.toString();

    window.location.hash = `#initialize/connect/connect-machine-ip?${queryString}`;
  };

  const renderStep = (model: ModelSupportUsb) =>
    model ? (
      <div className={classNames(styles.contents, styles.tutorial)}>
        <div className={styles.subtitle}>{renderInformations[model].title}</div>
        <div className={styles.contents}>
          {renderInformations[model].steps.map((step, index) => (
            <div>
              {index + 1}. {step}
            </div>
          ))}
        </div>
      </div>
    ) : null;

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
      <div className={styles.main}>
        <div className={styles.image}>
          <div className={classNames(styles.circle, styles.c1)} />
          <img src="img/init-panel/icon-usb-cable.svg" draggable="false" />
          <div className={classNames(styles.circle, styles.c2)} />
        </div>
        <div className={styles.text}>
          <div className={styles.title}>{lang.connect_usb.title}</div>
          {renderStep(model)}
        </div>
      </div>
    </div>
  );
}
