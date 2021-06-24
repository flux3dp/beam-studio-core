import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import { HashRouter, Route, Switch } from 'react-router-dom';

import AlertsAndProgress from 'app/views/dialogs/AlertAndProgress';
import Beambox from 'app/pages/Beambox';
import ConnectEthernet from 'app/pages/ConnectEthernet';
import ConnectMachineIp from 'app/pages/ConnectMachineIp';
import ConnectWiFi from 'app/pages/ConnectWiFi';
import ConnectWired from 'app/pages/ConnectWired';
import Dialog from 'app/views/dialogs/Dialog';
import FluxIdLogin from 'app/pages/FluxIdLogin';
import Home from 'app/pages/Home';
import HomeView from 'app/pages/HomeView';
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
          <Route exact path="/initialize/connect/select-connection-type" component={SelectConnectionType} />
          <Route exact path="/initialize/connect/connect-machine-ip" component={ConnectMachineIp} />
          <Route exact path="/initialize/connect/connect-wi-fi" component={ConnectWiFi} />
          <Route exact path="/initialize/connect/connect-wired" component={ConnectWired} />
          <Route exact path="/initialize/connect/connect-ethernet" component={ConnectEthernet} />
          <Route exact path="/initialize/connect/skip-connect-machine" component={SkipConnectMachine} />
          <Route exact path="/initialize/connect/flux-id-login" component={FluxIdLogin} />
          <Route exact path="/studio/settings" component={HomeView} />
          <Route exact path="/studio/beambox" component={Beambox} />
          <Route path="*" component={Home} />
        </Switch>
      </HashRouter>
    </DialogContextProvider>
  </AlertProgressContextProvider>
);

const router = () => {
  ReactDOM.render(
    wrappedComponent,
    $('section.content')[0],
  );
};

export default router;
