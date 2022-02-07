/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      info: 'INFO',
      warning: 'WARNING',
      error: 'UH-OH',
      retry: 'Retry',
      confirm: 'Confirm',
      cancel: 'Cancel',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
    },
  },
}));

import AlertConstants from 'app/constants/alert-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import ProgressConstants from 'app/constants/progress-constants';
import { AlertProgressContextProvider, AlertProgressContext } from './AlertProgressContext';

const eventEmitter = eventEmitterFactory.createEventEmitter('alert-progress');
const Children = () => {
  const context = React.useContext(AlertProgressContext);
  return (
    <>
      {context.alertProgressStack}
    </>
  );
};

test('should render correctly', () => {
  const wrapper = shallow(
    <AlertProgressContextProvider>
      <Children />
    </AlertProgressContextProvider>,
  );
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(eventEmitter.eventNames().length).toBe(7);

  eventEmitter.emit('OPEN_PROGRESS', {
    id: 'check-status',
    type: ProgressConstants.NONSTOP,
    caption: 'preparing',
    isProgress: true,
  });
  eventEmitter.emit('OPEN_PROGRESS', {
    id: 'get_log',
    type: ProgressConstants.STEPPING,
    message: 'downloading',
    isProgress: true,
    percentage: 0,
  });
  expect(toJson(wrapper)).toMatchSnapshot();

  eventEmitter.emit('UPDATE_PROGRESS', 'get_log1', {
    percentage: 100,
  });
  expect(toJson(wrapper)).toMatchSnapshot();

  eventEmitter.emit('UPDATE_PROGRESS', 'get_log', {
    percentage: 100,
  });
  expect(toJson(wrapper)).toMatchSnapshot();

  eventEmitter.emit('UPDATE_PROGRESS', 'check-status', {
    message: 'prepared',
  });
  expect(toJson(wrapper)).toMatchSnapshot();

  // type: 'SHOW_POPUP_INFO' + button type: 'YES_NO'
  eventEmitter.emit('POP_UP', {
    type: AlertConstants.SHOW_POPUP_INFO,
    message: 'File already exists, do you want to replace it?',
    buttonType: AlertConstants.YES_NO,
    onYes: jest.fn(),
  });
  // type: 'SHOW_POPUP_WARNING' + default button type + NO button labels
  eventEmitter.emit('POP_UP', {
    type: AlertConstants.SHOW_POPUP_WARNING,
    message: 'Some texts were changed to other Fonts when parsing texts to paths and some character may not converted normally.',
    callbacks: jest.fn(),
    checkbox: {
      text: 'Don\'t Show this next time.',
      callbacks: jest.fn(),
    },
  });
  // type: 'SHOW_POPUP_ERROR' + button type: 'RETRY_CANCEL'
  eventEmitter.emit('POP_UP', {
    id: 'monitor-reconnect',
    type: AlertConstants.SHOW_POPUP_ERROR,
    buttonType: AlertConstants.RETRY_CANCEL,
    message: 'The connection with the machine has broken. Do you want to reconnect?',
    onRetry: jest.fn(),
  });
  // default type + button type: 'CONFIRM_CANCEL'
  eventEmitter.emit('POP_UP', {
    buttonType: AlertConstants.CONFIRM_CANCEL,
    message: 'This will load arrangement of presets and replacing customized parameters set in the file, are you sure to proceed?',
    onConfirm: jest.fn(),
  });
  // default type + button type: 'CUSTOM_CANCEL'
  eventEmitter.emit('POP_UP', {
    id: 'latest-firmware',
    message: 'You have the latest Machine firmware',
    caption: 'Machine firmware Update',
    buttonType: AlertConstants.CUSTOM_CANCEL,
    buttonLabels: ['UPDATE'],
    callbacks: jest.fn(),
    onCancel: jest.fn(),
  });
  // has buttons
  eventEmitter.emit('POP_UP', {
    message: 'Unable to find machine ',
    buttons: [{
      label: 'Set Connection',
      className: 'btn-default primary',
      onClick: jest.fn(),
    },
    {
      label: 'Retry',
      className: 'btn-default primary',
      onClick: jest.fn(),
    }],
  });
  // type: 'SHOW_POPUP_INFO' + default button type + has button labels
  eventEmitter.emit('POP_UP', {
    id: 'machine-info',
    type: AlertConstants.SHOW_POPUP_INFO,
    caption: 'abcde',
    message: 'abcde: 111.222.333.444',
    buttonLabels: ['Test Network', 'OK'],
    callbacks: [
      jest.fn(),
      jest.fn(),
    ],
    primaryButtonIndex: 1,
  });
  expect(toJson(wrapper)).toMatchSnapshot();

  eventEmitter.emit('POP_BY_ID', 'machine-info');
  expect(toJson(wrapper)).toMatchSnapshot();

  const response = {
    idExist: false,
  };
  eventEmitter.emit('CHECK_ID_EXIST', 'latest-firmware', response);
  expect(response.idExist).toBeTruthy();
  eventEmitter.emit('CHECK_ID_EXIST', 'check-status', response);
  expect(response.idExist).toBeFalsy();

  eventEmitter.emit('POP_LAST_PROGRESS');
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.unmount();
  expect(eventEmitter.eventNames().length).toBe(0);
});
