import * as React from 'react';
import classNames from 'classnames';
import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import DeviceMaster from 'helpers/device-master';
import dialog from 'app/actions/dialog-caller';
import Discover from 'helpers/api/discover';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import menuDeviceActions from 'app/actions/beambox/menuDeviceActions';
import Modal from 'app/widgets/Modal';
import network from 'implementations/network';
import storage from 'implementations/storage';
import versionChecker from 'helpers/version-checker';
import { IDeviceInfo } from 'interfaces/IDevice';

let lang = i18n.lang.initialize;
const TIMEOUT = 20;
const ipRex = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;

enum TestState {
  UNKNOWN = 0,
  SUCCESS = 1,
  FAIL = -1,
}

interface State {
  rpiIp: string;
  machineIp: string;
  ipFormapTestState: TestState,
  pingTestState: TestState;
  connectionTestState: TestState;
  cameraTestState: TestState;
  device: IDeviceInfo;
  connectionTestCountDown: number;
  isTesting: boolean;
  hadTested: boolean;
  firmwareVersion?: string;
}

export default class ConnectMachine extends React.Component<any, State> {
  private ipInput: React.RefObject<HTMLInputElement>;

  private isWired: boolean;

  private isUsb: boolean;

  private discover: any;

  private failTimer: NodeJS.Timeout;

  constructor(props) {
    super(props);
    lang = i18n.lang.initialize;
    this.state = {
      rpiIp: null,
      machineIp: null,
      ipFormapTestState: TestState.UNKNOWN,
      pingTestState: TestState.UNKNOWN,
      connectionTestState: TestState.UNKNOWN,
      cameraTestState: TestState.UNKNOWN,
      device: null,
      connectionTestCountDown: TIMEOUT,
      isTesting: false,
      hadTested: false,
    };
    this.ipInput = React.createRef();

    const queryString = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);

    this.isWired = urlParams.get('wired') === '1';
    this.isUsb = urlParams.get('usb') === '1';

    this.discover = Discover('connect-machine-ip', (deviceList) => {
      const {
        ipFormapTestState,
        pingTestState,
        connectionTestState,
        machineIp,
      } = this.state;
      if (
        ipFormapTestState === TestState.SUCCESS
        && machineIp
        && pingTestState !== TestState.FAIL
        && connectionTestState === TestState.UNKNOWN
      ) {
        for (let i = 0; i < deviceList.length; i += 1) {
          const device = deviceList[i];
          if (device.ipaddr === machineIp) {
            clearInterval(this.failTimer);
            if (window.FLUX.version === 'web' && !versionChecker(device.version).meetRequirement('LATEST_GHOST_FOR_WEB')) {
              alertCaller.popUp({
                message: sprintf(i18n.lang.update.firmware.too_old_for_web, device.version),
                buttonLabels: [i18n.lang.update.download, i18n.lang.update.later],
                primaryButtonIndex: 0,
                callbacks: [
                  () => menuDeviceActions.UPDATE_FIRMWARE(device),
                  () => { },
                ],
              });
            }
            this.setState({
              pingTestState: TestState.SUCCESS,
              connectionTestState: TestState.SUCCESS,
              firmwareVersion: device.version,
              device,
            });
          }
        }
      }
    });
  }

  componentDidMount(): void {
    if (!this.isUsb) {
      this.checkRpiIp();
    } else {
      this.startTesting();
    }
  }

  componentDidUpdate(): void {
    const { connectionTestState, cameraTestState, isTesting } = this.state;
    if (connectionTestState === TestState.SUCCESS && cameraTestState === TestState.UNKNOWN) {
      this.testCamera();
    }
    if (!isTesting) {
      clearInterval(this.failTimer);
    }
  }

  componentWillUnmount(): void {
    this.discover.removeListener('connect-machine-ip');
  }

  private checkRpiIp = async () => {
    try {
      const res = await network.dnsLookUpAll('raspberrypi.local');
      res.forEach((ipAddress) => {
        if (ipAddress.family === 4) {
          this.setState({ rpiIp: ipAddress.address });
        }
      });
    } catch (e) {
      if (e.toString().includes('ENOTFOUND')) {
        console.log('DNS server not found raspberrypi.local');
      } else {
        console.log(`Error when dns looking up raspberrypi:\n${e}`);
      }
    }
  };

  private testCamera = async () => {
    const { device } = this.state;
    try {
      const res = await DeviceMaster.select(device);
      if (!res.success) {
        throw new Error('Fail to select device');
      }
      await DeviceMaster.connectCamera();
      await DeviceMaster.takeOnePicture();
      DeviceMaster.disconnectCamera();
      this.setState({
        cameraTestState: TestState.SUCCESS,
        isTesting: false,
        hadTested: true,
      });
    } catch (e) {
      console.log(e);
      this.setState({
        cameraTestState: TestState.FAIL,
        isTesting: false,
        hadTested: true,
      });
    }
  };

  renderImageContent = (): JSX.Element => {
    const { isUsb, isWired } = this;
    if (isUsb) return null;
    const imgSrc = isWired ? 'img/init-panel/network-panel-wired.jpg' : 'img/init-panel/network-panel-wireless.jpg';
    return (
      <div className="image-container">
        <div className={classNames('hint-circle', 'ip', { wired: isWired })} />
        <img className="touch-panel-icon" src={imgSrc} draggable="false" />
      </div>
    );
  };

  renderContent = (): JSX.Element => {
    const { isUsb } = this;
    const { rpiIp } = this.state;
    return (
      <div className={classNames('connection-machine-ip', { usb: isUsb })}>
        {this.renderImageContent()}
        <div className="text-container">
          <div className="title">{isUsb ? 'Check USB Connection' : lang.connect_machine_ip.enter_ip}</div>
          <div className="contents tutorial">
            <input
              ref={this.ipInput}
              className={classNames('ip-input', { hide: isUsb })}
              placeholder="192.168.0.1"
              type="text"
              onKeyDown={this.handleKeyDown}
              defaultValue={rpiIp}
            />
            {this.renderTestInfos()}
          </div>
        </div>
      </div>
    );
  };

  renderMachineInfo = (): JSX.Element => {
    const { connectionTestState, firmwareVersion, cameraTestState } = this.state;
    if (connectionTestState !== TestState.SUCCESS) return null;
    let cameraStatus = '';
    if (cameraTestState !== TestState.UNKNOWN) cameraStatus = cameraTestState > 0 ? 'OK' : 'Fail';
    return (
      <>
        <div id="firmware-test-info" className="test-info">{`${lang.connect_machine_ip.check_firmware}... ${firmwareVersion}`}</div>
        <div id="camera-test-info" className="test-info">{`${lang.connect_machine_ip.check_camera}... ${cameraStatus}`}</div>
      </>
    );
  };

  renderTestInfos = (): JSX.Element => {
    const {
      machineIp,
      ipFormapTestState,
      pingTestState,
      connectionTestState,
      connectionTestCountDown,
    } = this.state;
    if (machineIp !== null) {
      let ipStatus = 'OK';
      if (ipFormapTestState === TestState.FAIL) ipStatus = `${lang.connect_machine_ip.invalid_ip}${lang.connect_machine_ip.invalid_format}`;
      else if (pingTestState === TestState.FAIL) ipStatus = lang.connect_machine_ip.unreachable;
      else if (ipFormapTestState === TestState.UNKNOWN || pingTestState === TestState.UNKNOWN) ipStatus = '';
      let connectionStatus = `${connectionTestCountDown}s`;
      if (connectionTestState !== TestState.UNKNOWN) connectionStatus = connectionTestState > 0 ? 'OK' : 'Fail';
      return (
        <div className="test-infos">
          <div id="ip-test-info" className="test-info">{`${lang.connect_machine_ip.check_ip}... ${ipStatus || ''}`}</div>
          {
            ipFormapTestState === TestState.SUCCESS && (pingTestState !== TestState.FAIL)
              ? <div id="machine-test-info" className="test-info">{`${lang.connect_machine_ip.check_connection}... ${connectionStatus}`}</div>
              : null
          }
          {this.renderMachineInfo()}
        </div>
      );
    }
    return <div className="test-infos" />;
  };

  private handleKeyDown = (e) => {
    if (e.keyCode === keyCodeConstants.KEY_RETURN) {
      this.startTesting();
    }
  };

  private checkIPFormat = (ip: string): boolean => {
    const isIPFormatValid = ipRex.test(ip);
    if (!isIPFormatValid) {
      this.setState({
        machineIp: ip,
        ipFormapTestState: TestState.FAIL,
      });
    }
    return isIPFormatValid;
  };

  checkIPExist = async (ip: string): Promise<TestState> => {
    const { error, isExisting } = await network.checkIPExist(ip, 3);
    if (!error && !isExisting) {
      this.setState({
        machineIp: ip,
        pingTestState: TestState.FAIL,
        isTesting: false,
        hadTested: true,
      });
      return TestState.FAIL;
    }
    // if error occur when pinging, continue testing, return result unknown
    return error ? TestState.UNKNOWN : TestState.SUCCESS;
  };

  private startTesting = async () => {
    const ip = this.isUsb ? '10.55.0.1' : this.ipInput.current.value;
    this.setState({
      ipFormapTestState: TestState.UNKNOWN,
      connectionTestState: TestState.UNKNOWN,
      firmwareVersion: null,
      cameraTestState: TestState.UNKNOWN,
      device: null,
    });

    // check format
    if (!this.checkIPFormat(ip)) return;
    this.setState({
      ipFormapTestState: TestState.SUCCESS,
      isTesting: true,
      hadTested: false,
      machineIp: ip,
    });

    // Ping Target
    const result = await this.checkIPExist(ip);
    if (result === TestState.FAIL) return;

    this.setState({
      machineIp: ip,
      pingTestState: result,
      connectionTestCountDown: TIMEOUT,
    });

    if (window.FLUX.version === 'web') {
      localStorage.setItem('host', ip);
      localStorage.setItem('port', '8000');
    }
    this.discover.poke(ip);
    this.discover.pokeTcp(ip);
    this.discover.testTcp(ip);

    // Connecting to Machine
    clearInterval(this.failTimer);
    this.failTimer = setInterval(() => {
      const { isTesting, connectionTestState, connectionTestCountDown } = this.state;
      if (isTesting && connectionTestState === TestState.UNKNOWN) {
        if (connectionTestCountDown > 1) {
          this.setState({ connectionTestCountDown: connectionTestCountDown - 1 });
        } else {
          this.setState({
            connectionTestState: TestState.FAIL,
            isTesting: false,
            hadTested: true,
          });
          clearInterval(this.failTimer);
        }
      }
    }, 1000);
  };

  private onFinish = () => {
    const { device, machineIp } = this.state;
    const modelMap = {
      fbm1: 'fbm1',
      fbb1b: 'fbb1b',
      fbb1p: 'fbb1p',
      fbb2b: 'fbb2b',
    };
    const model = modelMap[device.model] || 'fbb1b';
    BeamboxPreference.write('model', model);
    BeamboxPreference.write('workarea', model);
    let pokeIPs = storage.get('poke-ip-addr');
    pokeIPs = (pokeIPs ? pokeIPs.split(/[,;] ?/) : []);
    if (!pokeIPs.includes(machineIp)) {
      if (pokeIPs.length > 19) {
        pokeIPs = pokeIPs.slice(pokeIPs.length - 19, pokeIPs.length);
      }
      pokeIPs.push(machineIp);
      storage.set('poke-ip-addr', pokeIPs.join(','));
    }
    if (!storage.get('printer-is-ready')) {
      storage.set('new-user', true);
    }
    storage.set('printer-is-ready', true);
    dialog.showLoadingWindow();
    window.location.hash = '#studio/beambox';
    window.location.reload();
  };

  renderNextButton = (): JSX.Element => {
    const { isTesting, hadTested, connectionTestState } = this.state;
    let onClick = () => { };
    let label: string;
    let className = classNames('btn-page', 'next', 'primary');
    if (!isTesting && !hadTested) {
      label = lang.next;
      onClick = this.startTesting;
    } else if (isTesting) {
      label = lang.next;
      className = classNames('btn-page', 'next', 'primary', 'disabled');
    } else if (hadTested) {
      if (connectionTestState === TestState.SUCCESS) {
        label = lang.connect_machine_ip.finish_setting;
        onClick = this.onFinish;
      } else {
        label = lang.retry;
        onClick = this.startTesting;
      }
    }
    return (
      <div className={className} onClick={() => onClick()}>
        {label}
      </div>
    );
  };

  renderButtons = (): JSX.Element => (
    <div className="btn-page-container">
      <div className="btn-page" onClick={() => window.history.back()}>
        {lang.back}
      </div>
      {this.renderNextButton()}
    </div>
  );

  render(): JSX.Element {
    const wrapperClassName = { initialization: true };
    const innerContent = this.renderContent();
    const content = (
      <div className="connect-machine">
        <div className="top-bar" />
        {this.renderButtons()}
        {innerContent}
      </div>
    );

    return (
      <Modal className={wrapperClassName} content={content} />
    );
  }
}
