/* eslint-disable react/require-default-props */
import React from 'react';

import TestState from 'app/constants/connection-test';
import useI18n from 'helpers/useI18n';

import styles from './TestInfo.module.scss';

interface Props {
  testState: TestState;
  connectionCountDown: number;
  firmwareVersion?: string;
}

const TestInfo = (
  { testState, connectionCountDown, firmwareVersion = '' }: Props
): JSX.Element => {
  const lang = useI18n();
  const t = lang.initialize.connect_machine_ip;

  const renderIpTestInfo = () => {
    if (testState === TestState.NONE) return null;
    let status = 'OK ✅';
    if (testState === TestState.IP_TESTING) status = '';
    else if (testState === TestState.IP_FORMAT_ERROR) {
      status = `${t.invalid_ip}${t.invalid_format}`;
    } else if (testState === TestState.IP_UNREACHABLE) status = t.unreachable;
    return <div id="ip-test-info" className={styles.info}>{`${t.check_ip}... ${status}`}</div>;
  };

  const renderConnectionTestInfo = () => {
    if (testState < TestState.CONNECTION_TESTING) return null;
    let status = 'OK ✅';
    if (testState === TestState.CONNECTION_TESTING) status = `${connectionCountDown}s`;
    else if (testState === TestState.CONNECTION_TEST_FAILED) status = 'Fail';
    return (
      <div id="machine-test-info" className={styles.info}>
        {`${t.check_connection}... ${status}`}
      </div>
    );
  };

  const renderFirmwareVersion = () => {
    if (testState < TestState.CAMERA_TESTING) return null;
    return <div className={styles.info}>{`${t.check_firmware}... ${firmwareVersion}`}</div>;
  };

  const renderCameraTesting = () => {
    if (testState < TestState.CAMERA_TESTING) return null;
    let status = '';
    if (testState === TestState.TEST_COMPLETED) status = 'OK ✅';
    else if (testState === TestState.CAMERA_TEST_FAILED) status = 'Fail';
    return <div className={styles.info}>{`${t.check_camera}... ${status}`}</div>;
  };

  return (
    <div className={styles.container}>
      {renderIpTestInfo()}
      {renderConnectionTestInfo()}
      {renderFirmwareVersion()}
      {renderCameraTesting()}
      {testState === TestState.TEST_COMPLETED && (
        <div className={styles.info}>{t.succeeded_message}</div>
      )}
    </div>
  );
};

export default TestInfo;
