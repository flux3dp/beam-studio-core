import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ColorRatioBlock from './ColorRatioBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        color_strength: 'Color Strength',
      },
    },
  },
}));

const mockSetRatio = jest.fn();

describe('test ColorRatioBlock', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ColorRatioBlock
        ratio={50}
        setRatio={mockSetRatio}
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
        color="c"
      />
    );
    expect(mockSetRatio).not.toBeCalled();
    const ratioInput = container.querySelectorAll('input')[0];
    fireEvent.change(ratioInput, { target: { value: 49 } });
    expect(mockSetRatio).toBeCalledTimes(1);
    expect(mockSetRatio).toHaveBeenLastCalledWith(49);
    rerender(
      <ColorRatioBlock
        ratio={49}
        setRatio={mockSetRatio}
        color="c"
      />
    );
    expect(ratioInput.value).toBe('49');
  });
});
