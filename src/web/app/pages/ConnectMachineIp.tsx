import classNames from 'classnames';
import React, { KeyboardEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import alertConfig from 'helpers/api/alert-config';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import checkCamera from 'helpers/device/check-camera';
import checkIPFormat from 'helpers/check-ip-format';
import checkRpiIp from 'helpers/check-rpi-ip';
import checkSoftwareForAdor from 'helpers/check-software';
import constant from 'app/actions/beambox/constant';
import Discover from 'helpers/api/discover';
import dialogCaller from 'app/actions/dialog-caller';
import isWeb from 'helpers/is-web';
import menuDeviceActions from 'app/actions/beambox/menuDeviceActions';
import network from 'implementations/network';
import storage from 'implementations/storage';
import TestInfo from 'app/components/settings/connection/TestInfo';
import TestState, { isTesting } from 'app/constants/connection-test';
import useI18n from 'helpers/useI18n';
import versionChecker from 'helpers/version-checker';
import { allWorkareas } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';

import styles from './ConnectMachineIp.module.scss';

// TODO: add test
const ConnectMachineIp = (): JSX.Element => {
  const lang = useI18n();
  const [ipValue, setIpValue] = useState('');
  const [state, setState] = useState<{
    testState: TestState;
    countDownDisplay: number;
    device: IDeviceInfo | null;
  }>({
    testState: TestState.NONE,
    countDownDisplay: 0,
    device: null,
  });
  const countDown = useRef(0);
  const intervalId = useRef(0);
  const discoveredDevicesRef = useRef<IDeviceInfo[]>([]);

  useEffect(() => {
    checkRpiIp().then((ip) => {
      if (ip) setIpValue(ip);
    });
    return () => {
      clearInterval(intervalId.current);
    };
  }, []);

  const discoverer = useMemo(
    () =>
      Discover('connect-machine-ip', (devices) => {
        discoveredDevicesRef.current = devices;
      }),
    []
  );
  useEffect(() => () => discoverer.removeListener('connect-machine-ip'), [discoverer]);

  const { isWired, isUsb, model } = useMemo(() => {
    const queryString = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryString);
    return {
      isWired: urlParams.get('wired') === '1',
      isUsb: urlParams.get('usb') === '1',
      model: urlParams.get('model'),
    };
  }, []);
  const isAdor = useMemo(() => constant.adorModels.includes(model), [model]);
  const testingIps = isUsb ? ['10.55.0.1', '10.55.0.17'] : [ipValue];

  const testIpFormat = () => {
    const res = testingIps.every((ip) => checkIPFormat(ip));
    if (!res) setState((prev) => ({ ...prev, testState: TestState.IP_FORMAT_ERROR }));
    return res;
  };

  const testIpReachability = async () => {
    setState((prev) => ({ ...prev, testState: TestState.IP_TESTING }));
    let hasError = false;
    for (let i = 0; i < testingIps.length; i += 1) {
      const ip = testingIps[i];
      // eslint-disable-next-line no-await-in-loop
      const { error, isExisting } = await network.checkIPExist(ip, 3);
      if (isExisting) return ip;
      if (error) hasError = true;
    }
    if (!hasError) {
      setState((prev) => ({ ...prev, testState: TestState.IP_UNREACHABLE }));
      return null;
    }
    // if error occurs, ip may exist but unable to reach due to error, use the first ip to test
    return testingIps[0];
  };

  const setUpLocalStorageIp = (ip: string) => {
    if (isWeb()) {
      localStorage.setItem('host', ip);
      localStorage.setItem('port', '8000');
    }
  };

  const testConnection = async () => {
    countDown.current = 30;
    setState({
      countDownDisplay: countDown.current,
      device: null,
      testState: TestState.CONNECTION_TESTING,
    });
    return new Promise<IDeviceInfo>((resolve) => {
      intervalId.current = setInterval(() => {
        if (countDown.current > 0) {
          const device = discoveredDevicesRef.current.find((d) => testingIps.includes(d.ipaddr));
          if (device) {
            if (
              isWeb() &&
              !versionChecker(device.version).meetRequirement('LATEST_GHOST_FOR_WEB')
            ) {
              alertCaller.popUp({
                message: sprintf(lang.update.firmware.too_old_for_web, device.version),
                buttonLabels: [lang.update.download, lang.update.later],
                primaryButtonIndex: 0,
                callbacks: [() => menuDeviceActions.UPDATE_FIRMWARE(device), () => {}],
              });
            }
            setState((prev) => ({ ...prev, device }));
            clearInterval(intervalId.current);
            resolve(device);
          } else {
            countDown.current -= 1;
            setState((prev) => ({
              ...prev,
              countDownDisplay: countDown.current,
              testState:
                countDown.current > 0
                  ? TestState.CONNECTION_TESTING
                  : TestState.CONNECTION_TEST_FAILED,
            }));
            if (countDown.current <= 0) {
              clearInterval(intervalId.current);
              resolve(null);
            }
          }
        } else {
          clearInterval(intervalId.current);
          resolve(null);
        }
      }, 1000) as unknown as number;
    });
  };

  const testCamera = async (device: IDeviceInfo) => {
    setState((prev) => ({ ...prev, testState: TestState.CAMERA_TESTING }));
    const res = await checkCamera(device);

    setState((prev) => ({
      ...prev,
      testState: res ? TestState.TEST_COMPLETED : TestState.CAMERA_TEST_FAILED,
    }));
  };

  const handleStartTest = async () => {
    const { testState } = state;
    if (isTesting(testState)) return;
    if (!testIpFormat()) return;
    const ip = await testIpReachability();
    if (!ip) return;
    setUpLocalStorageIp(ip);
    testingIps.forEach((testingIp) => {
      discoverer.poke(testingIp);
      discoverer.pokeTcp(testingIp);
      discoverer.testTcp(testingIp);
    });
    const device = await testConnection();
    if (!device) return;
    if (!checkSoftwareForAdor(device)) {
      setIpValue('');
      setState((prev) => ({ ...prev, device: null, testState: TestState.NONE }));
      return;
    }
    testCamera(device);
  };

  const onFinish = () => {
    const { device } = state;
    const deviceModel = allWorkareas.has(device.model) ? device.model : 'fbb1b';
    BeamboxPreference.write('model', deviceModel);
    BeamboxPreference.write('workarea', deviceModel);
    let pokeIPs = storage.get('poke-ip-addr');
    pokeIPs = pokeIPs ? pokeIPs.split(/[,;] ?/) : [];
    if (!pokeIPs.includes(device.ipaddr)) {
      if (pokeIPs.length > 19) {
        pokeIPs = pokeIPs.slice(pokeIPs.length - 19, pokeIPs.length);
      }
      pokeIPs.push(device.ipaddr);
      storage.set('poke-ip-addr', pokeIPs.join(','));
    }
    if (!storage.get('printer-is-ready')) {
      storage.set('new-user', true);
    }
    storage.set('printer-is-ready', true);
    storage.set('selected-device', device.uuid);
    if (constant.adorModels.includes(device.model)) {
      alertConfig.write('done-first-cali', true);
    } else if (device.model === 'fbm1') {
      alertConfig.write('done-first-cali', false);
    }
    dialogCaller.showLoadingWindow();
    window.location.hash = '#studio/beambox';
    window.location.reload();
  };

  const renderNextBtn = () => {
    const { testState } = state;
    let label = lang.initialize.next;
    let handleClick: () => void = handleStartTest;
    if ([TestState.CAMERA_TEST_FAILED, TestState.TEST_COMPLETED].includes(testState)) {
      label = lang.initialize.connect_machine_ip.finish_setting;
      handleClick = onFinish;
    } else if (!isTesting(testState) && testState !== TestState.NONE) {
      label = lang.initialize.retry;
    }

    return (
      <div
        className={classNames(styles.btn, styles.primary, {
          [styles.disabled]: isTesting(testState),
        })}
        onClick={handleClick}
      >
        {label}
      </div>
    );
  };

  const handleInputKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter') handleStartTest();
  };

  const { testState, countDownDisplay, device } = state;

  const touchPanelSrc = useMemo(() => {
    if (isAdor) return 'core-img/init-panel/ador-ip.jpg';
    return `img/init-panel/network-panel-${isWired ? 'wired' : 'wireless'}.jpg`;
  }, [isAdor, isWired]);
  return (
    <div className={styles.container}>
      <div className={styles['top-bar']} />
      <div className={styles.btns}>
        <div className={styles.btn} onClick={() => window.history.back()}>
          {lang.initialize.back}
        </div>
        {renderNextBtn()}
      </div>
      <div className={classNames(styles.main, { [styles.ador]: isAdor })}>
        {!isUsb && (
          <div className={styles.image}>
            <div className={classNames(styles.hint, { [styles.wired]: isWired })} />
            <img src={touchPanelSrc} draggable="false" />
          </div>
        )}
        <div className={styles.text}>
          <div className={styles.title}>
            {isUsb
              ? lang.initialize.connect_machine_ip.check_usb
              : lang.initialize.connect_machine_ip.enter_ip}
          </div>
          {!isUsb ? (
            <input
              className={classNames(styles.input)}
              value={ipValue}
              onChange={(e) => setIpValue(e.currentTarget.value)}
              placeholder="192.168.0.1"
              type="text"
              onKeyDown={handleInputKeyDown}
            />
          ) : null}
          <TestInfo
            testState={testState}
            connectionCountDown={countDownDisplay}
            firmwareVersion={device?.version}
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectMachineIp;
