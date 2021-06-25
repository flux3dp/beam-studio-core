import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockPoke = jest.fn();
const mockPokeTcp = jest.fn();
const mockTestTcp = jest.fn();
const mockRemoveDiscover = jest.fn();
const mockNetworkTest = jest.fn();

import NetworkTestingPanel from './NetworkTestingPanel';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      network_testing_panel: {
        network_testing: 'Network Testing',
        local_ip: 'Local IP address:',
        insert_ip: 'Target device IP address:',
        empty_ip: '#818 Please enter target device IP first.',
        start: 'Start',
        end: 'End',
        testing: 'Testing Network...',
        invalid_ip: '#818 Invalid IP address',
        ip_startswith_169: '#843 Machine IP address starts with 169.254',
        connection_quality: 'Connection Quality',
        average_response: 'Average Response Time',
        test_completed: 'Test Completed',
        test_fail: 'Test Failed',
        cannot_connect_1: '#840 Fail to connect to target IP.',
        cannot_connect_2: '#840 Fail to connect to target IP. Please make sure that the target is in the same network.',
        network_unhealthy: '#841 Connection quality <70 or average response time >100ms',
        device_not_on_list: '#842 The machine is not on the list, but the connection Quality is >70 and the average response time is <100ms',
        hint_device_often_on_list: 'The machine is often not found on the list?',
        link_device_often_on_list: 'https://support.flux3dp.com/hc/en-us/articles/360001841636',
        hint_connect_failed_when_sending_job: 'Failed to connect when sending a job?',
        link_connect_failed_when_sending_job: 'https://support.flux3dp.com/hc/en-us/articles/360001841656',
        hint_connect_camera_timeout: 'Timeout occurs when starting camera preview?',
        link_connect_camera_timeout: 'https://support.flux3dp.com/hc/en-us/articles/360001791895',
        cannot_get_local: 'Access to local IP address failed.',
        fail_to_start_network_test: '#817 Fail to start network testing.',
        linux_permission_hint: 'This error usually occurs due to insufficient permissions.\nKindly run "sudo beam-studio --no-sandbox" in terminal to obtain permissions and perform network testing.',
      },
    },
  },
}));

jest.mock('implementations/network', () => ({
  networkTest: mockNetworkTest,
}));

jest.mock('helpers/api/discover', () => {
  const ins = {
    poke: mockPoke,
    pokeTcp: mockPokeTcp,
    testTcp: mockTestTcp,
    removeListener: mockRemoveDiscover,
  };
  return (id: string) => ins;
});

jest.mock('implementations/os', () => ({
  networkInterfaces: () => ({
    en0: [
      {
        address: '192.168.68.2',
        family: 'IPv4',
        internal: false,
      },
    ],
  }),
}));

test('should render correctly', () => {
  const onClose = jest.fn();
  const wrapper = mount(<NetworkTestingPanel
    onClose={onClose}
    ip="192.168.68.163"
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(wrapper.find('input').instance().value).toBe('192.168.68.163');

  wrapper.find('input').simulate('keyDown', {
    keyCode: 13,
    key: 'Enter',
  });
  expect(mockNetworkTest).toHaveBeenCalledTimes(1);
  expect(mockNetworkTest).toHaveBeenNthCalledWith(1, '192.168.68.163', 30000, expect.any(Function));
  expect(mockPoke).toHaveBeenCalledTimes(1);
  expect(mockPoke).toHaveBeenNthCalledWith(1, '192.168.68.163');
  expect(mockPokeTcp).toHaveBeenCalledTimes(1);
  expect(mockPokeTcp).toHaveBeenNthCalledWith(1, '192.168.68.163');
  expect(mockTestTcp).toHaveBeenCalledTimes(1);
  expect(mockTestTcp).toHaveBeenNthCalledWith(1, '192.168.68.163');

  wrapper.find('input').instance().value = '192.168.68.3';
  wrapper.find('input').simulate('keyDown', {
    keyCode: 13,
    key: 'Enter',
  });
  expect(mockNetworkTest).toHaveBeenCalledTimes(2);
  expect(mockNetworkTest).toHaveBeenNthCalledWith(2, '192.168.68.3', 30000, expect.any(Function));
  expect(mockPoke).toHaveBeenCalledTimes(2);
  expect(mockPoke).toHaveBeenNthCalledWith(2, '192.168.68.3');
  expect(mockPokeTcp).toHaveBeenCalledTimes(2);
  expect(mockPokeTcp).toHaveBeenNthCalledWith(2, '192.168.68.3');
  expect(mockTestTcp).toHaveBeenCalledTimes(2);
  expect(mockTestTcp).toHaveBeenNthCalledWith(2, '192.168.68.3');

  wrapper.unmount();
  expect(mockRemoveDiscover).toHaveBeenCalledTimes(1);
});
