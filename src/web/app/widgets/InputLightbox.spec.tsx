import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Constants from 'app/constants/input-lightbox-constants';

import InputLightbox from './InputLightbox';

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
  }
);

const mockOnSubmit = jest.fn();
const mockOnClose = jest.fn();

describe('test InputLightbox', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly when type is file', () => {
    const { baseElement, getByText } = render(
      <InputLightbox
        defaultValue=""
        inputHeader="header"
        caption="Firmware upload (*.bin / *.fxfw)"
        maxLength={100}
        type={Constants.TYPE_FILE}
        confirmText="UPLOAD"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );
    expect(baseElement).toMatchSnapshot();
    const input = baseElement.querySelector('input') as HTMLInputElement;
    const filesGetter = jest.spyOn(input, 'files', 'get');
    const mockFile = new File(['mock-file'], 'mock-file');
    filesGetter.mockReturnValue([mockFile] as any);
    fireEvent.change(input);
    expect(mockOnSubmit).not.toBeCalled();
    fireEvent.click(getByText('UPLOAD'));
    expect(mockOnSubmit).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
    expect(mockOnClose).toHaveBeenLastCalledWith('submit');
  });

  it('should render correctly when type is password', () => {
    const { baseElement, getByText } = render(
      <InputLightbox
        defaultValue=""
        inputHeader="Password"
        caption="ABCDE requires a password"
        maxLength={100}
        type={Constants.TYPE_PASSWORD}
        confirmText="CONNECT"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );
    expect(baseElement).toMatchSnapshot();
    fireEvent.change(baseElement.querySelector('input'), { target: { value: 'pAssw0rd' } });
    expect(mockOnSubmit).not.toBeCalled();
    fireEvent.click(getByText('CONNECT'));
    expect(mockOnSubmit).toBeCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenLastCalledWith('pAssw0rd');
    expect(mockOnClose).toBeCalledTimes(1);
    expect(mockOnClose).toHaveBeenLastCalledWith('submit');
  });
});
