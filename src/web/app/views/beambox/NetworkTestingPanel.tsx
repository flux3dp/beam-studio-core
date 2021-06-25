/* eslint-disable no-console */
/* eslint-disable react/sort-comp */
import * as React from 'react';

import Alert from 'app/actions/alert-caller';
import AlertConstants from 'app/constants/alert-constants';
import browser from 'implementations/browser';
import Discover from 'helpers/api/discover';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import network from 'implementations/network';
import os from 'implementations/os';
import Progress from 'app/actions/progress-caller';
import { IDeviceInfo } from 'interfaces/IDevice';

const LANG = i18n.lang.beambox.network_testing_panel;
const TEST_TIME = 30000;

interface Props {
  ip: string;
  onClose: () => void;
}

interface State {
  localIps: string[];
}

class NetworkTestingPanel extends React.Component<Props, State> {
  private discoveredDevices: IDeviceInfo[];

  private discover: any;

  private textInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);
    const localIps = [];
    const ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach((ifname) => {
      let alias = 0;
      ifaces[ifname].forEach((iface) => {
        if (iface.family !== 'IPv4' || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(`${ifname}:${alias}`, iface.address);
        } else {
          // this interface has only one ipv4 adress
          console.log(ifname, iface.address);
        }
        alias += 1;
        localIps.push(iface.address);
      });
    });
    this.discoveredDevices = [];
    this.discover = Discover('network-testing-panel', (devices) => {
      this.discoveredDevices = devices;
    });
    this.state = {
      localIps,
    };
    this.textInputRef = React.createRef();
  }

  componentWillUnmount(): void {
    this.discover.removeListener('network-testing-panel');
  }

  onStart = async (): Promise<void> => {
    const ip = this.getIPValue();
    if (!ip) {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: LANG.empty_ip,
      });
      return;
    }
    if (ip.trim().startsWith('169.254')) {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: LANG.ip_startswith_169,
      });
    }
    this.discover.poke(ip);
    this.discover.pokeTcp(ip);
    this.discover.testTcp(ip);
    Progress.openSteppingProgress({
      id: 'network-testing',
      message: `${LANG.testing} - 0%`,
    });
    const {
      err,
      reason,
      successRate,
      avgRRT,
      quality,
    } = await network.networkTest(ip, TEST_TIME, (percentage) => {
      Progress.update('network-testing', {
        percentage,
        message: `${LANG.testing} - ${percentage}%`,
      });
    });
    Progress.popById('network-testing');
    if (err === 'CREATE_SESSION_FAILED') {
      let message = `${LANG.fail_to_start_network_test}\n${reason}`;
      if (window.os === 'Linux') message += `\n${LANG.linux_permission_hint}`;
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
      });
    } else if (err === 'INVALID_IP') {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: `${LANG.invalid_ip}: ${ip}`,
      });
    } else {
      this.handleResult(successRate, avgRRT, quality);
    }
  };

  handleResult(successRate: number, avgRRT: number, quality: number): void {
    const ip = this.getIPValue();
    const { localIps } = this.state;
    console.log(`success rate: ${successRate}`);
    console.log(`average rrt of success: ${Math.round(100 * avgRRT) / 100} ms`);
    if (successRate > 0) {
      let message = `${LANG.connection_quality} : ${quality}\n${LANG.average_response} : ${Math.round(100 * avgRRT) / 100} ms`;
      let children = null;
      if (quality < 70 || avgRRT > 100) {
        message = `${LANG.network_unhealthy}\n${message}`;
      } else if (!this.discoveredDevices || !this.discoveredDevices.find((d) => d.ipaddr === ip)) {
        message = `${LANG.device_not_on_list}\n${message}`;
      } else {
        children = (
          <div className="hint-container network-testing">
            <div className="hint" onClick={() => browser.open(LANG.link_device_often_on_list)}>{LANG.hint_device_often_on_list}</div>
            <div className="hint" onClick={() => browser.open(LANG.link_connect_failed_when_sending_job)}>{LANG.hint_connect_failed_when_sending_job}</div>
            <div className="hint" onClick={() => browser.open(LANG.link_connect_camera_timeout)}>{LANG.hint_connect_camera_timeout}</div>
          </div>
        );
      }
      Alert.popUp({
        type: AlertConstants.SHOW_INFO,
        message,
        caption: LANG.test_completed,
        children,
      });
    } else {
      let match = false;
      const targetIpFirstThree = ip.match(/.*\./)[0];
      localIps.forEach((localIP) => {
        const localFirstThree = localIP.match(/.*\./)[0];
        if (targetIpFirstThree === localFirstThree) {
          match = true;
        }
      });
      if (match) {
        Alert.popUp({
          id: 'network_test_result',
          message: `${LANG.cannot_connect_1}`,
          caption: LANG.test_completed,
        });
      } else {
        Alert.popUp({
          id: 'network_test_result',
          message: `${LANG.cannot_connect_2}`,
          caption: LANG.test_completed,
        });
      }
    }
  }

  getIPValue = (): string => {
    const { value } = this.textInputRef.current;
    return value.replace(' ', '');
  };

  onInputKeydown = (e: React.KeyboardEvent): void => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      this.onStart();
    }
  };

  close(): void {
    const { onClose } = this.props;
    onClose();
  }

  render(): JSX.Element {
    const { ip, onClose } = this.props;
    const { localIps } = this.state;
    return (
      <Modal onClose={onClose}>
        <div className="network-testing-panel">
          <section className="main-content">
            <div className="title">{LANG.network_testing}</div>
            <div className="info">
              <div className="left-part">
                {LANG.local_ip}
              </div>
              <div className="right-part">
                {localIps.join(', ')}
              </div>
            </div>
            <div className="info">
              <div className="left-part">
                {LANG.insert_ip}
              </div>
              <div className="right-part">
                <input
                  ref={this.textInputRef}
                  defaultValue={ip || ''}
                  onKeyDown={this.onInputKeydown}
                />
              </div>
            </div>
          </section>
          <section className="footer">
            <button
              type="button"
              className="btn btn-default pull-right"
              onClick={onClose}
            >
              {LANG.end}
            </button>
            <button
              type="button"
              className="btn btn-default pull-right primary"
              onClick={this.onStart}
            >
              {LANG.start}
            </button>
          </section>
        </div>
      </Modal>
    );
  }
}

export default NetworkTestingPanel;
