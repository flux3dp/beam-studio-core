import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Prompt from './Prompt';

jest.mock('antd', () => ({
  Modal: ({ children, onOk, onCancel, ...props }: any) => (
    <div>
      Dummy Modal
      <button type="button" onClick={onOk}>ok</button>
      <button type="button" onClick={onCancel}>cancel</button>
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Input: React.forwardRef<HTMLInputElement>(({ children, ...props }: any, ref) => (
    <div>
      Dummy Input
      <p>props: {JSON.stringify(props)}</p>
      <input type="text" ref={ref} />
      {children}
    </div>
  )),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      ok2: 'OK',
      cancel: 'Cancel',
    },
  },
}));

const onYes = jest.fn();
const onCancel = jest.fn();
const onClose = jest.fn();

describe('test Prompt', () => {
  test('should render correctly', () => {
    const { container, getByText } = render(
      <Prompt
        caption="New Preset Name"
        defaultValue=""
        onYes={onYes}
        onCancel={onCancel}
        onClose={onClose}
      />
    );
    expect(container).toMatchSnapshot();

    expect(onYes).not.toBeCalled();
    expect(onClose).not.toBeCalled();
    fireEvent.click(getByText('ok'));
    expect(onYes).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(1);

    expect(onCancel).not.toBeCalled();
    fireEvent.click(getByText('cancel'));
    expect(onCancel).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(2);
  });
});
