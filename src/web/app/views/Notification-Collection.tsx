import config from 'helpers/api/config';
import AlertActions from 'app/actions/alert-actions';
import AlertStore from 'app/stores/alert-store';
import UpdateDialog from 'app/views/Update-Dialog';
import GlobalStore from 'app/stores/global-store';
import storage from 'helpers/storage-helper';
import checkFirmware from 'helpers/check-firmware';
import firmwareUpdater from 'helpers/firmware-updater';
import DeviceMaster from 'helpers/device-master';
// @ts-expect-error
import Notifier = require('jqueryGrowl');
declare global {
  interface JQueryStatic {
    growl: any
  }
}

const React = requireNode('react');
const { $ } = window;

export default function (args) {
  args = args || {};

  var lang = args.state.lang,
    FIRST_DEVICE_UPDATE = 'check-first-device-firmware';

  return class NotificationCollection extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        // monitor
        showMonitor: false,
        fcode: {},
        previewUrl: '',
        monitorOpener: null,


        // input lightbox
        inputLightbox: {
          open: false,
          type: '',
          caption: '',
          inputHeader: '',
          defaultValue: '',
          confirmText: '',
          onClose: function () { },
          onSubmit: function () { }
        },
        // application update
        application: {
          open: false,
          type: 'firmware',
          releaseNote: '',
          latestVersion: '',
          updateFile: undefined,
          device: {},
          onDownload: function () { },
          onInstall: function () { }
        },
        // change filament
        changeFilament: {
          open: false,
          device: {},
          onClose: function () { }
        },
        headTemperature: {
          show: false,
          device: {}
        },

        cameraCalibration: {
          open: false,
          device: {}
        },

        firstDevice: {
          info: {}, // device info
          apiResponse: {}, // device info
        },
        // images
        displayImages: false,
        images: []
      };
    }

    componentDidMount() {
      var self = this,
        discoverMethods,
        firstDevice,
        defaultPrinter,
        type = 'firmware',
        _checkFirmwareOfDefaultPrinter = function () {
          let printers = DeviceMaster.getAvailableDevices();
          printers.some(function (printer) {
            if (defaultPrinter.serial === printer.serial) {
              defaultPrinter = printer;
              //update default-print's data.
              config().write('default-printer', JSON.stringify(printer));
              return true;
            }
          });

          checkFirmware(defaultPrinter, type).done(function (response) {
            if (response.needUpdate) {
              firmwareUpdater(response, defaultPrinter, type);
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
      defaultPrinter = config().read('default-printer');
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
      var currentVersion = (
        'software' === payload.type ?
          payload.updateInfo.currentVersion :
          payload.device.version
      ),
        releaseNote = (
          'zh-tw' === storage.get('active-lang') ?
            payload.updateInfo.changelog_zh :
            payload.updateInfo.changelog_en
        );

      this.setState({
        application: {
          open: true,
          device: payload.device,
          type: payload.type,
          currentVersion: currentVersion,
          latestVersion: payload.updateInfo.latestVersion,
          releaseNote: releaseNote,
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
      let latestVersion = (
        'toolhead' === this.state.application.type ?
          this.state.application.device.toolhead_version :
          this.state.application.latestVersion
      );

      return (
        <div className="notification-collection">
          <UpdateDialog
            open={this.state.application.open}
            type={this.state.application.type}
            device={this.state.application.device}
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
