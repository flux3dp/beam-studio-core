import * as React from 'react';
import { render } from '@testing-library/react';

import Constants from 'app/constants/input-lightbox-constants';

import InputLightbox from './InputLightbox';

jest.mock('antd', () => ({
  get Form() {
    const mockFormItem = ({ children, ...props }: any) => (
      <div>
        Dummy FormItem
        <p>props: {JSON.stringify(props)}</p>
        {children}
      </div>
    );
    const mockForm = ({ children }: any) => (
      <div>
        Dummy Form
        {children}
      </div>
    );
    mockForm.Item = mockFormItem;
    return mockForm;
  },
  Modal: ({ children, ...props }: any) => (
    <div>
      Dummy Modal
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Input: React.forwardRef(({ children, ...props }: any, ref) => (
    <div>
      Dummy Input
      <p>props: {JSON.stringify(props)}</p>
      <p>ref: {JSON.stringify(ref)}</p>
      {children}
    </div>
  )),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Resolution',
      confirm: 'Low',
    },
  },
}));

jest.mock(
  'app/widgets/AlertDialog',
  () => function DummyImageAlertDialog() {
    return <div>This is dummy AlertDialog</div>;
  },
);

describe('test InputLightbox', () => {
  it('should render correctly when type is file', () => {
    const { container } = render(
      <InputLightbox
        defaultValue=""
        inputHeader="header"
        caption="Firmware upload (*.bin / *.fxfw)"
        maxLength={100}
        type={Constants.TYPE_FILE}
        confirmText="UPLOAD"
        onSubmit={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when type is password', () => {
    const { container } = render(
      <InputLightbox
        defaultValue=""
        inputHeader="Password"
        caption="ABCDE requires a password"
        maxLength={100}
        type={Constants.TYPE_PASSWORD}
        confirmText="CONNECT"
        onSubmit={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
