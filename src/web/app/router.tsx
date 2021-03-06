import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
import SkipConnectMachine from 'app/pages/SkipConnectMachine';
import { AlertProgressContextProvider } from 'app/contexts/AlertProgressContext';
import { DialogContextProvider } from 'app/contexts/DialogContext';

const wrappedComponent = (
  <AlertProgressContextProvider>
    <DialogContextProvider>
      <Dialog />
      <AlertsAndProgress />
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
          <Route exact path="/initialize/connect/skip-connect-machine" component={SkipConnectMachine} />
          <Route exact path="/initialize/connect/flux-id-login" component={FluxIdLogin} />
          <Route exact path="/studio/settings" component={Settings} />
          <Route exact path="/studio/beambox" component={Beambox} />
          <Route path="/error/*" component={Error} />
          <Route path="*" component={Home} />
        </Switch>
      </HashRouter>
    </DialogContextProvider>
  </AlertProgressContextProvider>
);

const router = (container) => {
  ReactDOM.render(wrappedComponent, container);
};

export default router;
