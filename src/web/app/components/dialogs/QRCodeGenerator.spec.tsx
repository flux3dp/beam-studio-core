import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import QRCodeGenerator from './QRCodeGenerator';

jest.mock('helpers/useI18n', () => () => ({
  alert: {
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  qr_code_generator: {
    title: 'QR Code Generator',
    placeholder: 'Input a link or text',
    preview: 'Preview',
    error_tolerance: 'Error Tolerance',
    invert: 'Invert background color',
  },
}));

const mockInsertImage = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  insertImage: (...props: any) => mockInsertImage(...props),
}));

const mockOnClose = jest.fn();
describe('test QRCodeGenerator', () => {
  it('should behave correctly', () => {
    const { baseElement } = render(<QRCodeGenerator onClose={mockOnClose} />);

    const input = baseElement.querySelector('textarea');
    const okButton = baseElement.querySelector('.ant-btn-primary');
    expect(input).toHaveValue('');
    expect(okButton).toBeDisabled();
    expect(baseElement).toMatchSnapshot();

    fireEvent.change(input, { target: { value: 'some text' } });
    expect(okButton).not.toBeDisabled();
    expect(baseElement).toMatchSnapshot();

    const canvas = baseElement.querySelector('canvas');
    jest.spyOn(canvas, 'toDataURL').mockReturnValue('mock url');
    fireEvent.click(okButton);
    expect(mockInsertImage).toBeCalledTimes(1);
    expect(mockInsertImage).toBeCalledWith(
      'mock url',
      { x: 0, y: 0, width: 500, height: 500 },
      127,
      { useCurrentLayer: true, ratioFixed: true }
    );
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
