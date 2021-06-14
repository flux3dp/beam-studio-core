/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Resolution',
      confirm: 'Low',
    },
  },
}));

jest.mock('app/widgets/AlertDialog', () => function DummyImageAlertDialog() {
  return (
    <div>
      This is dummy AlertDialog
    </div>
  );
});

import Constants from 'app/constants/input-lightbox-constants';

import InputLightbox from './InputLightbox';

test('test InputLightbox', () => {
  expect(toJson(shallow(<InputLightbox
    caption="Firmware upload (*.bin / *.fxfw)"
    type={Constants.TYPE_FILE}
    confirmText="UPLOAD"
    onSubmit={jest.fn()}
    onClose={jest.fn()}
  />))).toMatchSnapshot();

  expect(toJson(shallow(<InputLightbox
    caption="ABCDE requires a password"
    type={Constants.TYPE_PASSWORD}
    inputHeader="Password"
    confirmText="CONNECT"
    onSubmit={jest.fn()}
    onClose={jest.fn()}
  />))).toMatchSnapshot();
});
