import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import FieldBlock from './FieldBlock';

const mockGetWorkarea = jest.fn();
jest.mock('app/constants/workarea-constants', () => ({
  getWorkarea: (...args) => mockGetWorkarea(...args),
}));

const mockSetField = jest.fn();
const mockField = { offsetX: 0, offsetY: 0, angle: 0 };

describe('test FieldBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkarea.mockReturnValue({ width: 300 });
  });

  it('should render correctly', () => {
    const { container } = render(
      <FieldBlock model="fpm1" isInch={false} field={mockField} setField={mockSetField} />
    );
    expect(container).toMatchSnapshot();
    expect(mockGetWorkarea).toBeCalledTimes(1);
    expect(mockGetWorkarea).toBeCalledWith('fpm1');
  });

  describe('test edit values', () => {
    [
      { id: 'offset-x', key: 'offsetX' },
      { id: 'offset-y', key: 'offsetY' },
      { id: 'angle', key: 'angle' },
    ].forEach(({ id, key }) => {
      test(`edit ${key}`, () => {
        const { getByTestId } = render(
          <FieldBlock model="fpm1" isInch={false} field={mockField} setField={mockSetField} />
        );
        const input = getByTestId(id);
        fireEvent.change(input, { target: { value: '10' } });
        expect(mockSetField).toBeCalledTimes(1);
        const [[dispatch]] = mockSetField.mock.calls;
        expect(dispatch(mockField)).toEqual({ ...mockField, [key]: 10 });
      });
    });
  });
});
