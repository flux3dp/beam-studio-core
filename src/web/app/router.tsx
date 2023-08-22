import * as React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import AlertsAndProgress from 'app/views/dialogs/AlertAndProgress';
import Beambox from 'app/pages/Beambox';
import ConnectEthernet from 'app/pages/ConnectEthernet';
import ConnectMachineIp from 'app/pages/ConnectMachineIp';
import ConnectUsb from 'app/pages/ConnectUsb';
import ConnectWiFi from 'app/pages/ConnectWiFi';
import ConnectWired from 'app/pages/ConnectWired';
import Dialog from 'app/views/dialogs/Dialog';
import Error from 'app/pages/Error';
import FacebookOAuth from 'app/pages/FacebookOAuth';
import FluxIdLogin from 'app/pages/FluxIdLogin';
import GoogleOAuth from 'app/pages/GoogleOAuth';
import Home from 'app/pages/Home';
import Settings from 'app/pages/Settings';
import SelectConnectionType from 'app/pages/SelectConnectionType';
import { AlertProgressContextProvider } from 'app/contexts/AlertProgressContext';
import { DialogContextProvider } from 'app/contexts/DialogContext';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, message, theme } from 'antd';

import enUS from 'antd/locale/en_US';
import deDE from 'antd/locale/de_DE';
import nlNL from 'antd/locale/nl_NL';
import nlBE from 'antd/locale/nl_BE';
import itIT from 'antd/locale/it_IT';
import frFR from 'antd/locale/fr_FR';
import zhTW from 'antd/locale/zh_TW';
import koKR from 'antd/locale/ko_KR';
import jaJP from 'antd/locale/ja_JP';

const { defaultAlgorithm } = theme;

const localeMap = {
  'nl-NL': nlNL,
  'nl-BE': nlBE,
  'zh-TW': zhTW,
  'ko-KR': koKR,
  'ja-JP': jaJP,
  'fr-FR': frFR,
  'it-IT': itIT,
  'de-DE': deDE,
  'en-US': enUS,
};

console.log('Loading language', navigator.language);

const App = (): JSX.Element => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <AlertProgressContextProvider messageApi={messageApi}>
      <DialogContextProvider>
        <ConfigProvider
          theme={{
            algorithm: defaultAlgorithm,
            token: { screenMD: 601, screenMDMin: 601, screenSMMax: 600 },
          }}
          locale={localeMap[navigator.language]}
        >
          <StyleProvider hashPriority="high">
            <Dialog />
            <AlertsAndProgress />
            {contextHolder}
            <HashRouter>
              <Switch>
                <Route exact path="/google-auth" component={GoogleOAuth} />
                <Route exact path="/fb-auth" component={FacebookOAuth} />
                <Route exact path="/initialize/connect/select-connection-type" component={SelectConnectionType} />
                <Route exact path="/initialize/connect/connect-machine-ip" component={ConnectMachineIp} />
                <Route exact path="/initialize/connect/connect-usb" component={ConnectUsb} />
                <Route exact path="/initialize/connect/connect-wi-fi" component={ConnectWiFi} />
                <Route exact path="/initialize/connect/connect-wired" component={ConnectWired} />
                <Route exact path="/initialize/connect/connect-ethernet" component={ConnectEthernet} />
                <Route exact path="/initialize/connect/flux-id-login" component={FluxIdLogin} />
                <Route exact path="/studio/settings" component={Settings as any} />
                <Route exact path="/studio/beambox" component={Beambox} />
                <Route path="/error/*" component={Error} />
                <Route path="*" component={Home} />
              </Switch>
            </HashRouter>
          </StyleProvider>
        </ConfigProvider>
      </DialogContextProvider>
    </AlertProgressContextProvider>
  );
};

const router = (container) => {
  render(<App />, container);
};

export default router;
