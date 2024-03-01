import React from 'react';
import { Button } from 'antd';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
// import browser from 'implementations/browser';
import i18n from 'helpers/i18n';

import styles from './UpdateFontConvert.module.scss';

const LANG = i18n.lang.beambox.popup.text_to_path;

const updateFontConvert = (): Promise<string> =>
  new Promise<string>((resolve) => {
    Alert.popUp({
      caption: LANG.caption,
      message: (
        <div>
          <div className={styles.message}>{LANG.message}</div>
          <Button
            className={styles.button}
            type="link"
            // TODO: update help center link
            // onClick={() => browser.open(i18n.lang.settings.help_center_urls.font_convert)}
          >
            {i18n.lang.alert.learn_more}
          </Button>
        </div>
      ),
      buttonType: AlertConstants.YES_NO,
      onYes: () => resolve('2.0'),
      onNo: () => resolve('1.0'),
    });
  });

export default updateFontConvert;
