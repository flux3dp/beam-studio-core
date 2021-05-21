import * as React from 'react';

import AlertStore from 'app/stores/alert-store';
import checkFirmware from 'helpers/check-firmware';
import DeviceMaster from 'helpers/device-master';
import firmwareUpdater from 'helpers/firmware-updater';
import GlobalStore from 'app/stores/global-store';
import storage from 'helpers/storage-helper';
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

      AlertStore.onNotify(this._handleNotification);
      AlertStore.onCloseNotify(this._handleCloseNotification);
      AlertStore.onUpdate(this._showUpdate);

      GlobalStore.onCloseAllView(this._handleCloseAllView);
      GlobalStore.onSliceComplete(this._handleSliceReport);

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

    componentWillUnmount() {
      AlertStore.removeNotifyListener(this._handleNotification);
      GlobalStore.removeCloseAllViewListener(this._handleCloseAllView);
      GlobalStore.removeSliceCompleteListener(this._handleSliceReport);
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

    _handleNotification = (type, message, onClickCallback, fixed) => {
      var growl;
      fixed = fixed || false;

      var types = {
        INFO: function () {
          growl = $.growl.notice({
            title: lang.alert.info,
            message: message,
            fixed: fixed,
            location: 'bl'
          });
        },

        WARNING: function () {
          growl = $.growl.warning({
            title: lang.alert.warning,
            message: message,
            fixed: fixed,
            location: 'bl'
          });
        },

        ERROR: function () {
          growl = $.growl.error({
            title: lang.alert.error,
            message: message,
            fixed: true,
            location: 'bl'
          });
        }
      };

      types[type]();
      setTimeout(function () {
        $('.growl').on('click', function () {
          onClickCallback(growl);
        });
      }, 500);
    }

    _handleCloseNotification = () => {
      $('#growls').remove();
    }

    _handleCloseAllView = () => {
      $('.device > .menu').removeClass('show');
      $('.dialog-opener').prop('checked', '');
    }

    _handleSliceReport = (data) => {
      this.setState({ slicingStatus: data.report });
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
