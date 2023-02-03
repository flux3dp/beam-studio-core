import * as React from 'react';
import { render } from '@testing-library/react';

import AlertAndProgress from './AlertAndProgress';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Cancel',
    },
  },
}));

jest.mock('app/contexts/AlertProgressContext', () => ({
  AlertProgressContext: React.createContext({
    alertProgressStack: [{
      id: 'alert',
      message: 'Yes or No',
      caption: 'Hello World',
      iconUrl: 'https://www.flux3dp.com/icon.svg',
      buttons: [{
        title: 'Yes',
        label: 'Yes',
      }, {
        title: 'No',
        label: 'No',
      }],
      checkboxText: 'Select',
      checkboxCallbacks: jest.fn(),
    }, {
      id: 'progress',
      isProgress: true,
    }],
    popFromStack: jest.fn(),
    popById: jest.fn(),
  }),
}));

test('should render correctly', () => {
  const { baseElement } = render(<AlertAndProgress />);
  expect(baseElement).toMatchSnapshot();
});
