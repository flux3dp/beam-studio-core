import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ColorRatioBlock from './ColorRatioBlock';

const mockSetRatio = jest.fn();
const mockSetSmooth = jest.fn();

describe('test ColorRatioBlock', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ColorRatioBlock
        ratio={50}
        setRatio={mockSetRatio}
        smooth={1}
        setSmooth={mockSetSmooth}
        color="c"
      />
    );
    expect(container).toMatchSnapshot();
  });

  test('setValue should work', () => {
    const { container, rerender } = render(
      <ColorRatioBlock
        ratio={50}
        setRatio={mockSetRatio}
        smooth={1}
        setSmooth={mockSetSmooth}
        color="c"
      />
    );
    expect(mockSetRatio).not.toBeCalled();
    const ratioInput = container.querySelectorAll('input')[0];
    const smoothInput = container.querySelectorAll('input')[1];
    fireEvent.change(ratioInput, { target: { value: 49 } });
    expect(mockSetRatio).toBeCalledTimes(1);
    expect(mockSetRatio).toHaveBeenLastCalledWith(49);
    rerender(
      <ColorRatioBlock
        ratio={49}
        setRatio={mockSetRatio}
        smooth={1}
        setSmooth={mockSetSmooth}
        color="c"
      />
    );
    expect(ratioInput.value).toBe('49');
    fireEvent.change(smoothInput, { target: { value: 1.1 } });
    expect(mockSetSmooth).toBeCalledTimes(1);
    expect(mockSetSmooth).toHaveBeenLastCalledWith(1.1);
    rerender(
      <ColorRatioBlock
        ratio={49}
        setRatio={mockSetRatio}
        smooth={1.1}
        setSmooth={mockSetSmooth}
        color="c"
      />
    );
    expect(smoothInput.value).toBe('1.1');

  });
});
