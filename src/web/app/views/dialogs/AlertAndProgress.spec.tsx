/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/widgets/Alert', () => function DummyAlert() {
  return (
    <div>
      This is dummy Alert
    </div>
  );
});

jest.mock('app/widgets/Progress', () => function DummyProgress() {
  return (
    <div>
      This is dummy Progress
    </div>
  );
});

jest.mock('app/contexts/AlertProgressContext', () => ({
  AlertProgressContext: React.createContext({
    alertProgressStack: [{
      message: 'Yes or No',
      caption: 'Hello World',
      iconUrl: 'https://www.flux3dp.com/icon.svg',
      buttons: [{
        title: 'Yes',
      }, {
        title: 'No',
      }],
      checkboxText: 'Select',
      checkboxCallbacks: jest.fn(),
    }, {
      isProgress: true,
    }],
    popFromStack: jest.fn(),
    popById: jest.fn(),
  }),
}));

import AlertAndProgress from './AlertAndProgress';

test('should render correctly', () => {
  expect(toJson(mount(
    <AlertAndProgress className="flux" />,
  ))).toMatchSnapshot();
});
