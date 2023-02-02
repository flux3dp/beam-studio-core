import * as React from 'react';
import { render } from '@testing-library/react';

import AlertAndProgress from './AlertAndProgress';

jest.mock('antd', () => ({
  Button: ({ children, ...props }: any) => (
    <div>
      Dummy Button
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Modal: ({ children, ...props }: any) => (
    <div>
      Dummy Modal
      {children}
    </div>
  ),
  Progress: ({ children, ...props }: any) => (
    <div>
      Dummy Progress
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
}));

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
  const { container } = render(<AlertAndProgress />);
  expect(container).toMatchSnapshot();
});
