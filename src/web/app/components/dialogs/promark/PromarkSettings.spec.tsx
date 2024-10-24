import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PromarkSettings from './PromarkSettings';

jest.mock('./FieldBlock', () => () => <div>Mock FieldBlock</div>);
jest.mock('./RedDotBlock', () => () => <div>Mock RedDotBlock</div>);
jest.mock('./LensBlock', () => () => <div>Mock LensBlock</div>);

const mockStorageGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockStorageGet(...args),
}));

const mockPromarkUpdate = jest.fn();
jest.mock('helpers/device/promark-data-store', () => ({
  update: (...args) => mockPromarkUpdate(...args),
}));

const mockOnClose = jest.fn();

describe('test PromarkSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageGet.mockReturnValue('mm');
  });

  it('should render correctly', () => {
    const { baseElement } = render(
      <PromarkSettings model="fpm1" serial="123" initData={{}} onClose={mockOnClose} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('Cancel button', async () => {
    const { findByText } = render(
      <PromarkSettings model="fpm1" serial="123" initData={{}} onClose={mockOnClose} />
    );
    const cancelBtn = await findByText('Cancel');
    expect(mockOnClose).not.toBeCalled();
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('Save button', async () => {
    const { findByText } = render(
      <PromarkSettings model="fpm1" serial="123" initData={{}} onClose={mockOnClose} />
    );
    const saveBtn = await findByText('Save');
    expect(mockPromarkUpdate).not.toBeCalled();
    fireEvent.click(saveBtn);
    expect(mockPromarkUpdate).toBeCalledTimes(1);
    expect(mockPromarkUpdate).toBeCalledWith('123', {
      field: { offsetX: 0, offsetY: 0, angle: 0 },
      redDot: { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 },
      lensCorrection: {
        x: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
        y: { scale: 100, bulge: 1, skew: 1, trapezoid: 1 },
      },
    });
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
