import * as React from 'react';
import classNames from 'classnames';

import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import DeviceMaster from 'helpers/device-master';
import dialog from 'app/actions/dialog-caller';
import Discover from 'helpers/api/discover';
import i18n from 'helpers/i18n';
import keyCodeConstants from 'app/constants/keycode-constants';
import Modal from 'app/widgets/Modal';
import network from 'implementations/network';
import storage from 'implementations/storage';
import { IDeviceInfo } from 'interfaces/IDevice';

let lang = i18n.lang.initialize;
const TIMEOUT = 20;
const ipRex = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;

interface State {
  rpiIp: string;
  machineIp: string;
  didConnectMachine: boolean;
  firmwareVersion: string;
  cameraAvailability: boolean;
  device: IDeviceInfo;
  connectionTestCountDown: number;
  isTesting: boolean;
  hadTested: boolean;
  isIpValid?: boolean;
  testIpInfo?: string;
}

export default class ConnectMachine extends React.Component<any, State> {
  private ipInput: React.RefObject<HTMLInputElement>;

  private isWired: boolean;

  private discover: any;

  private testCountDown: NodeJS.Timeout;

  constructor(props) {
    super(props);
    lang = i18n.lang.initialize;
    this.state = {
      rpiIp: null,
      machineIp: null,
      didConnectMachine: null,
      firmwareVersion: null,
      cameraAvailability: null,
      device: null,
      connectionTestCountDown: TIMEOUT,
      isTesting: false,
      hadTested: false,
    };
    this.ipInput = React.createRef();

    const queryString = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);

    this.isWired = urlParams.get('wired') === '1';

    this.discover = Discover('connect-machine-ip', (deviceList) => {
      const { isIpValid, didConnectMachine, machineIp } = this.state;
      const shouldTryConnect = isIpValid || (isIpValid === null);
      if (shouldTryConnect && didConnectMachine === null && machineIp !== null) {
        for (let i = 0; i < deviceList.length; i += 1) {
          const device = deviceList[i];
          if (device.ipaddr === machineIp) {
            clearInterval(this.testCountDown);
            this.setState({
              isIpValid: true,
              didConnectMachine: true,
              firmwareVersion: device.version,
              device,
            });
          }
        }
      }
    });
  }

  componentDidMount(): void {
    this.checkRpiIp();
  }

  componentDidUpdate(): void {
    const { didConnectMachine, cameraAvailability } = this.state;
    if (didConnectMachine && (cameraAvailability === null)) {
      this.testCamera();
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
        cameraAvailability: true,
        isTesting: false,
        hadTested: true,
      });
    } catch (e) {
      console.log(e);
      this.setState({
        cameraAvailability: false,
        isTesting: false,
        hadTested: true,
      });
    }
  };

  renderContent = (): JSX.Element => {
    const { rpiIp } = this.state;
    const imgSrc = this.isWired ? 'img/init-panel/network-panel-wired.jpg' : 'img/init-panel/network-panel-wireless.jpg';
    return (
      <div className="connection-machine-ip">
        <div className="image-container">
          <div className={classNames('hint-circle', 'ip', { wired: this.isWired })} />
          <img className="touch-panel-icon" src={imgSrc} draggable="false" />
        </div>
        <div className="text-container">
          <div className="title">{lang.connect_machine_ip.enter_ip}</div>
          <div className="contents tutorial">
            <input
              ref={this.ipInput}
              className="ip-input"
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

  renderTestInfos = (): JSX.Element => {
    const {
      machineIp,
      isIpValid,
      didConnectMachine,
      testIpInfo,
      firmwareVersion,
      cameraAvailability,
      connectionTestCountDown,
    } = this.state;
    if (machineIp !== null) {
      const shouldTryConnect = isIpValid || (isIpValid === undefined);
      const ipStatus = isIpValid ? 'OK' : testIpInfo;
      let connectionStatus = `${connectionTestCountDown}s`;
      let cameraStatus = '';
      if (didConnectMachine !== null) {
        connectionStatus = didConnectMachine ? 'OK' : 'Fail';
      }
      if (cameraAvailability !== null) {
        cameraStatus = cameraAvailability ? 'OK' : 'Fail';
      }
      return (
        <div className="test-infos">
          <div className="test-info">{`${lang.connect_machine_ip.check_ip}... ${ipStatus || ''}`}</div>
          {shouldTryConnect ? <div className="test-info">{`${lang.connect_machine_ip.check_connection}... ${connectionStatus}`}</div> : null}
          {didConnectMachine ? <div className="test-info">{`${lang.connect_machine_ip.check_firmware}... ${firmwareVersion}`}</div> : null}
          {didConnectMachine ? <div className="test-info">{`${lang.connect_machine_ip.check_camera}... ${cameraStatus}`}</div> : null}
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
        isIpValid: false,
        testIpInfo: `${lang.connect_machine_ip.invalid_ip}${lang.connect_machine_ip.invalid_format}`,
      });
    }
    return isIPFormatValid;
  };

  checkIPExist = async (): Promise<boolean> => {
    const ip = this.ipInput.current.value;
    const { error, isExisting } = await network.checkIPExist(ip, 3);

    if (!error && !isExisting) {
      this.setState({
        machineIp: ip,
        isIpValid: false,
        testIpInfo: `${lang.connect_machine_ip.unreachable}`,
        isTesting: false,
        hadTested: true,
      });
      return false;
    }

    // if error occur when pinging, continue testing, return null as result unknown
    return error ? null : true;
  };

  private startTesting = async () => {
    const ip = this.ipInput.current.value;
    this.setState({
      isIpValid: null,
      testIpInfo: null,
      didConnectMachine: null,
      firmwareVersion: null,
      cameraAvailability: null,
      device: null,
    });

    // check format
    if (!this.checkIPFormat(ip)) return;

    this.setState({
      isTesting: true,
      hadTested: false,
      machineIp: ip,
    });

    // Ping Target
    const isIpValid = await this.checkIPExist();
    if (isIpValid === false) return;

    this.setState({
      machineIp: ip,
      isIpValid,
      connectionTestCountDown: TIMEOUT,
    });

    if (window.FLUX.version === 'web') {
      localStorage.setItem('host', ip);
      localStorage.setItem('post', '8000');
    }
    this.discover.poke(ip);
    this.discover.pokeTcp(ip);
    this.discover.testTcp(ip);

    // Connecting to Machine
    clearInterval(this.testCountDown);
    this.testCountDown = setInterval(() => {
      const { isTesting, didConnectMachine, connectionTestCountDown } = this.state;
      console.log(isTesting, didConnectMachine, connectionTestCountDown);
      if (isTesting && didConnectMachine === null) {
        if (connectionTestCountDown > 1) {
          this.setState({ connectionTestCountDown: connectionTestCountDown - 1 });
        } else {
          this.setState({
            didConnectMachine: false,
            isTesting: false,
            hadTested: true,
          });
          clearInterval(this.testCountDown);
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
    const { isTesting, hadTested, didConnectMachine } = this.state;
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
      if (didConnectMachine) {
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
