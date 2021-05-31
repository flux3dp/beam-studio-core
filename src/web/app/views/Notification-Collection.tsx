import * as React from 'react';

import alertStore from 'app/stores/alert-store';
import checkFirmware from 'helpers/check-firmware';
import DeviceMaster from 'helpers/device-master';
import firmwareUpdater from 'helpers/firmware-updater';
import storage from 'implementations/storage';
import UpdateDialog from 'app/views/Update-Dialog';
import { IDeviceInfo } from 'interfaces/IDevice';

declare global {
  interface JQueryStatic {
    growl: any
  }
}

const { $ } = window;

export default function (args) {
  args = args || {};

  var lang = args.state.lang;

  interface State {
    application: {
      open?: boolean;
      releaseNote?: string;
      latestVersion?: string;
      currentVersion?: string;
      device?: IDeviceInfo;
      onDownload?: () => void;
      onInstall?: () => void;
    };
    slicingStatus?: any;
  }

  return class NotificationCollection extends React.Component<any, State> {
    constructor(props) {
      super(props);
      this.state = {
        // application update
        application: {
          open: false,
          releaseNote: '',
          latestVersion: '',
          device: {} as IDeviceInfo,
          onDownload: function () { },
          onInstall: function () { }
        },
      };
    }

    componentDidMount() {
      var self = this,
        defaultPrinter,
        _checkFirmwareOfDefaultPrinter = function () {
          let printers = DeviceMaster.getAvailableDevices();
          printers.some(function (printer) {
            if (defaultPrinter.serial === printer.serial) {
              defaultPrinter = printer;
              //update default-print's data.
              storage.set('default-printer', JSON.stringify(printer));
              return true;
            }
          });

          checkFirmware(defaultPrinter, 'firmware').done(function (response) {
            if (response.needUpdate) {
              firmwareUpdater(response, defaultPrinter);
            }
          });
        };

      alertStore.onUpdate(this._showUpdate);

      // checking FLUX studio laster version in website that is going to
      // popup update dialog if newser FLUX Studio has been relwased.

      /***waiting for website API done***
      checkSoftwareUpdate()
          .done(function(response) {
          softwareUpdater(response);
          });
      /*********************************/

      // checking firmware of default printer that is going to popup
      // update dialog if newest firmware has been released.
      defaultPrinter = storage.get('default-printer');
      // settimeout 15 secs for make sure discover has been done.
      if (defaultPrinter) {
        setTimeout(_checkFirmwareOfDefaultPrinter, 15000);
      }
    }

    _showUpdate = (payload) => {
      var currentVersion = payload.device.version,
        releaseNote = (
          'zh-tw' === storage.get('active-lang') ?
            payload.updateInfo.changelog_zh :
            payload.updateInfo.changelog_en
        );

      this.setState({
        application: {
          open: true,
          device: payload.device,
          currentVersion,
          latestVersion: payload.updateInfo.latestVersion,
          releaseNote,
          onDownload: payload.onDownload,
          onInstall: payload.onInstall
        }
      });
    }

    _handleUpdateClose = () => {
      this.setState({
        application: {
          open: false,
          device: this.state.application.device
        }
      });
    }

    _handleUpdateDownload = () => {
      this.state.application.onDownload();
    }

    _handleUpdateInstall = () => {
      this.state.application.onInstall();
    }

    render() {
      let latestVersion = this.state.application.latestVersion;

      return (
        <div className="notification-collection">
          <UpdateDialog
            open={this.state.application.open}
            deviceName={this.state.application.device?.name}
            deviceModel={this.state.application.device?.model}
            currentVersion={this.state.application.currentVersion}
            latestVersion={latestVersion}
            releaseNote={this.state.application.releaseNote}
            onDownload={this._handleUpdateDownload}
            onClose={this._handleUpdateClose}
            onInstall={this._handleUpdateInstall}
          />
        </div>
      );
    }
  };
};
