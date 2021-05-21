import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockQuitTask = jest.fn();
jest.mock('helpers/device-master', () => ({
  quitTask: mockQuitTask,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    update: {
      release_note: 'Release Note:',
      firmware: {
        caption: 'A Firmware Update to the machine is available',
        message_pattern_1: '"%s" is now ready for firmware update.',
        message_pattern_2: '%s Firmware v%s is now available - You have v%s.',
      },
      skip: 'Skip This Version',
      later: 'LATER',
      download: 'ONLINE UPDATE',
      install: 'INSTALL',
      upload: 'UPLOAD',
    },
  },
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('helpers/storage-helper', () => ({
  get: mockGet,
  set: mockSet,
}));

// eslint-disable-next-line import/first
import UpdateDialog from './Update-Dialog';

describe('should render correctly', () => {
  test('not opened', () => {
    expect(toJson(shallow(<UpdateDialog
      open={false}
      deviceName=""
      deviceModel=""
      currentVersion="1.0.0"
      latestVersion="1.0.1"
      releaseNote="fix bugs"
      onDownload={jest.fn()}
      onClose={jest.fn()}
      onInstall={jest.fn()}
    />))).toMatchSnapshot();
  });

  test('opened', () => {
    expect(toJson(shallow(<UpdateDialog
      open
      deviceName="flux"
      deviceModel="Beamo"
      currentVersion="1.0.0"
      latestVersion="1.0.1"
      releaseNote="fix bugs"
      onDownload={jest.fn()}
      onClose={jest.fn()}
      onInstall={jest.fn()}
    />))).toMatchSnapshot();
  });
});
