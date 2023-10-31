import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ColorRatioBlock from './ColorRatioBlock';

const mockSetValue = jest.fn();

describe('test ColorRatioBlock', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ColorRatioBlock value={50} setValue={mockSetValue} color="c" />
    );
    expect(container).toMatchSnapshot();
  });

  test('setValue should work', () => {
    const { container, rerender } = render(
      <ColorRatioBlock value={50} setValue={mockSetValue} color="c" />
    );
    expect(mockSetValue).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 49 } });
    expect(mockSetValue).toBeCalledTimes(1);
    expect(mockSetValue).toHaveBeenLastCalledWith(49);
    rerender(<ColorRatioBlock value={49} setValue={mockSetValue} color="c" />);
    expect(input.value).toBe('49');
  });
});
